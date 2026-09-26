#!/usr/bin/env python3
"""Validador rápido de lacunas em PR — roda localmente antes de merge.

Uso:
  python scripts/pr-audit.py <PR_NUMBER> [--repo owner/repo] [--skill-path .agents/skills/meta-lupa]

Verifica:
1. Testes citados no PR body existem no disco
2. Recursos declarados na skill existem no disco
3. Interface CLI compatível (main vs branch)
4. Achievements têm evidência no ledger
5. false_green_blocked coerente
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple

def run_cmd(cmd: List[str], cwd: str = None) -> Tuple[int, str, str]:
    """Executa comando e retorna (exit_code, stdout, stderr)."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=60)
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "TIMEOUT"
    except Exception as e:
        return -1, "", str(e)

def get_pr_body(pr_number: int, repo: str) -> str:
    """Obtém body do PR via gh."""
    code, out, err = run_cmd(["gh", "pr", "view", str(pr_number), "--repo", repo, "--json", "body", "--jq", ".body"])
    if code != 0:
        print(f"Erro ao buscar PR: {err}", file=sys.stderr)
        return ""
    return out

def get_pr_files(pr_number: int, repo: str) -> List[str]:
    """Lista arquivos alterados no PR."""
    code, out, err = run_cmd(["gh", "pr", "view", str(pr_number), "--repo", repo, "--json", "files", "--jq", ".files[].path"])
    if code != 0:
        return []
    return [line.strip() for line in out.strip().split("\n") if line.strip()]

def get_branch_name(pr_number: int, repo: str) -> str:
    """Obtém nome do branch head do PR."""
    code, out, err = run_cmd(["gh", "pr", "view", str(pr_number), "--repo", repo, "--json", "headRefName", "--jq", ".headRefName"])
    if code != 0:
        return ""
    return out.strip()

def find_files(patterns: List[str], root: str) -> Dict[str, bool]:
    """Procura arquivos por padrões glob no disco."""
    results = {}
    for pattern in patterns:
        code, out, _ = run_cmd(["find", root, "-name", pattern, "-type", "f"], cwd=root)
        found = bool(out.strip())
        results[pattern] = found
    return results

def check_skill_resources(skill_path: str, root: str) -> Dict[str, bool]:
    """Valida recursos declarados na skill (matriz XP-5)."""
    skill_file = Path(root) / skill_path / "SKILL.md"
    if not skill_file.exists():
        return {"error": f"Skill não encontrada: {skill_file}"}
    
    content = skill_file.read_text(encoding="utf-8")
    results = {}
    
    # Extrair linhas da matriz que contêm caminhos
    import re
    # Padrão: | recurso | `caminho` | ESTADO |
    lines = content.split("\n")
    in_matrix = False
    for line in lines:
        if "Matriz de existência" in line or "XP-5" in line:
            in_matrix = True
            continue
        if in_matrix and line.startswith("|") and "`" in line:
            # Extrair caminho entre crases
            match = re.search(r"`([^`]+)`", line)
            if match:
                path = match.group(1)
                full = Path(root) / path
                results[path] = full.exists()
        elif in_matrix and not line.startswith("|"):
            break
    
    return results

def check_cli_interface(main_branch: str, pr_branch: str, script_rel: str, root: str) -> List[str]:
    """Compara args de finish-use no main vs branch."""
    # Get main version
    code, main_content, _ = run_cmd(["git", "show", f"{main_branch}:{script_rel}"], cwd=root)
    if code != 0:
        return [f"Erro: script não encontrado no main: {script_rel}"]
    
    # Get PR branch version
    code, pr_content, _ = run_cmd(["git", "show", f"{pr_branch}:{script_rel}"], cwd=root)
    if code != 0:
        return [f"Erro: script não encontrado no branch: {script_rel}"]
    
    # Extract add_argument lines for finish-use
    main_args = set(re.findall(r'f\.add_argument\("([^"]+)"', main_content))
    pr_args = set(re.findall(r'f\.add_argument\("([^"]+)"', pr_content))
    
    new_args = pr_args - main_args
    missing_defaults = []
    for arg in new_args:
        # Check if has default=
        pattern = rf'f\.add_argument\("{re.escape(arg)}"[^)]*default='
        if not re.search(pattern, pr_content):
            missing_defaults.append(arg)
    
    return list(new_args), missing_defaults

def check_ledger_achievements(skill_path: str, root: str, mission_id: str = None) -> Dict[str, Any]:
    """Verifica achievements no ledger vs evidência."""
    ledger_path = Path(root) / skill_path / "references" / "uso-ledger.jsonl"
    if not ledger_path.exists():
        return {"error": "Ledger não encontrado"}
    
    records = []
    with open(ledger_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    
    # Find latest FINAL for mission_id or most recent
    finals = [r for r in records if r.get("event") == "FINAL"]
    if mission_id:
        finals = [r for r in finals if r.get("mission_id") == mission_id]
    
    if not finals:
        return {"error": "Nenhum FINAL encontrado"}
    
    latest = finals[-1]
    return {
        "achievements": latest.get("achievements", []),
        "autolupa_executed": latest.get("autolupa_executed", False),
        "test_created": latest.get("test_created", ""),
        "regression_created": latest.get("regression_created", ""),
        "false_green_blocked": latest.get("false_green_blocked", False),
        "xp_gained": latest.get("xp_gained", 0),
        "mission_id": latest.get("mission_id", ""),
    }

def extract_cited_tests(pr_body: str) -> List[str]:
    """Extrai nomes de testes citados no PR body."""
    tests = []
    # Patterns like: test_lupa.py ............ TOTAL=52
    for match in re.finditer(r'(test_\w+\.py)\s+\.+\s+TOTAL=', pr_body):
        tests.append(match.group(1))
    # Also check for explicit mentions
    for match in re.finditer(r'`(test_\w+\.py)`', pr_body):
        if match.group(1) not in tests:
            tests.append(match.group(1))
    return tests

def main():
    parser = argparse.ArgumentParser(description="Auditoria rápida de PR para detectar falso verde")
    parser.add_argument("pr_number", type=int, help="Número do PR")
    parser.add_argument("--repo", default="ServerVpss/CentralDark", help="Owner/repo")
    parser.add_argument("--skill-path", default=".agents/skills/meta-lupa", help="Caminho da skill relativa à raiz")
    parser.add_argument("--main-branch", default="main", help="Branch main")
    parser.add_argument("--script", default=".agents/skills/meta-lupa/scripts/meta_lupa.py", help="Script para comparar interface CLI")
    parser.add_argument("--root", default=".", help="Raiz do repo")
    args = parser.parse_args()
    
    root = os.path.abspath(args.root)
    print(f"\n=== AUDITORIA PR #{args.pr_number} ===")
    print(f"Repo: {args.repo}")
    print(f"Root: {root}")
    print(f"Skill: {args.skill_path}")
    
    # 1. PR body
    print("\n1. Buscando PR body...")
    pr_body = get_pr_body(args.pr_number, args.repo)
    if not pr_body:
        print("  ❌ Falha ao obter PR body")
        return 1
    print(f"  ✅ PR body obtido ({len(pr_body)} chars)")
    
    # 2. Branch name
    pr_branch = get_branch_name(args.pr_number, args.repo)
    print(f"\n2. Branch do PR: {pr_branch}")
    
    # 3. Testes citados
    print("\n3. Testes citados no PR body:")
    cited_tests = extract_cited_tests(pr_body)
    if cited_tests:
        found = find_files(cited_tests, root)
        for test, exists in found.items():
            status = "✅" if exists else "❌ LACUNA CRÍTICA"
            print(f"  {status} {test}")
    else:
        print("  (nenhum teste explícito citado)")
    
    # 4. Recursos da skill
    print("\n4. Recursos declarados na skill (matriz XP-5):")
    resources = check_skill_resources(args.skill_path, root)
    if "error" in resources:
        print(f"  ❌ {resources['error']}")
    else:
        for path, exists in resources.items():
            status = "✅" if exists else "❌ LACUNA CRÍTICA"
            print(f"  {status} {path}")
    
    # 5. Interface CLI
    print("\n5. Compatibilidade CLI (main vs branch):")
    new_args, missing_defaults = check_cli_interface(args.main_branch, pr_branch, args.script, root)
    if new_args:
        print(f"  ⚠️  {len(new_args)} args novos no branch:")
        for arg in sorted(new_args):
            default_status = " (sem default!)" if arg in missing_defaults else " (com default)"
            print(f"      + {arg}{default_status}")
        if missing_defaults:
            print(f"  ❌ LACUNA CRÍTICA: {len(missing_defaults)} args sem default — quebram main se mergeado")
    else:
        print("  ✅ Interface compatível")
    
    # 6. Ledger achievements
    print("\n6. Achievements no ledger (último FINAL):")
    ledger = check_ledger_achievements(args.skill_path, root)
    if "error" in ledger:
        print(f"  ❌ {ledger['error']}")
    else:
        print(f"  Mission: {ledger['mission_id']}")
        print(f"  Achievements: {ledger['achievements']}")
        print(f"  autolupa_executed: {ledger['autolupa_executed']}")
        print(f"  test_created: '{ledger['test_created']}'")
        print(f"  regression_created: '{ledger['regression_created']}'")
        print(f"  false_green_blocked: {ledger['false_green_blocked']}")
        print(f"  xp_gained: {ledger['xp_gained']}")
        
        # Verificações de coerência
        issues = []
        if "erro_reproduzido" in ledger["achievements"] and not ledger["test_created"]:
            issues.append("achievement 'erro_reproduzido' mas test_created vazio")
        if "ponto_fixo_atingido" in ledger["achievements"] and not ledger["autolupa_executed"]:
            issues.append("achievement 'ponto_fixo_atingido' mas autolupa_executed=false")
        if "falso_verde_bloqueado" in ledger["achievements"] and not ledger["false_green_blocked"]:
            issues.append("achievement 'falso_verde_bloqueado' mas flag false_green_blocked=false")
        
        if issues:
            print("  ❌ INCONSISTÊNCIAS:")
            for issue in issues:
                print(f"      - {issue}")
        else:
            print("  ✅ Achievements coerentes com evidência")
    
    # 7. false_green_blocked coerente com defeito?
    print("\n7. Verificação de falso verde (heurística):")
    if "exposi" in pr_body.lower() or "não mostrava" in pr_body.lower() or "apenas usage_id" in pr_body.lower():
        if ledger.get("false_green_blocked") is False:
            print("  ⚠️  PR descreve defeito de exposição (falso verde) mas false_green_blocked=false")
            print("      → Deveria ser true conforme Invariante de Falsificação")
        else:
            print("  ✅ Flag coerente")
    else:
        print("  (não detectado padrão de falso verde no body)")
    
    print("\n=== FIM DA AUDITORIA ===")
    return 0

if __name__ == "__main__":
    sys.exit(main())