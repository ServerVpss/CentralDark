#!/usr/bin/env python3
"""
External File Reconciliation Script — Automatiza a verificação de arquivos externos
contra o canônico (Casa → GitHub → VPS).

Uso:
    uv run python scripts/external-reconcile.py <arquivo_externo> <caminho_canonico_relativo>

Exemplo:
    uv run python scripts/external-reconcile.py \
        "C:\Users\danda\Downloads\Telegram Desktop\Novo(a) Documento de Texto.txt" \
        "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json"

Saída: YAML com classificação e evidência (stdout)
"""

import json
import sys
import hashlib
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

# Caminhos base da Casa
CASA_ROOT = Path(r"E:\CentralDark\Pivete\CentralDark")
VPS_HOST = "Segredo-VPS"
VPS_REPO = "/root/CentralDark"


def run_cmd(cmd: list, cwd: Optional[Path] = None) -> Tuple[int, str, str]:
    """Executa comando e retorna (exit_code, stdout, stderr)."""
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)
    return result.returncode, result.stdout.strip(), result.stderr.strip()


def sha256_file(path: Path) -> str:
    """Calcula SHA256 do arquivo."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json_file(path: Path) -> Any:
    """Carrega JSON — suporta string JSON escapada (dupla camada)."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    try:
        # Tenta carregar direto
        return json.loads(content)
    except json.JSONDecodeError:
        # Tenta dupla camada (string JSON dentro do arquivo)
        try:
            outer = json.loads(content)
            if isinstance(outer, str):
                return json.loads(outer)
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Não foi possível parsear JSON: {path}")


def deep_compare(a: Any, b: Any, path: str = "") -> list:
    """Compara semanticamente dois objetos JSON."""
    diffs = []
    if type(a) != type(b):
        diffs.append(f"TYPE_MISMATCH at {path}: {type(a).__name__} vs {type(b).__name__}")
        return diffs
    
    if isinstance(a, dict):
        keys_a, keys_b = set(a.keys()), set(b.keys())
        for k in keys_a - keys_b:
            diffs.append(f"+{path}.{k} only in A")
        for k in keys_b - keys_a:
            diffs.append(f"-{path}.{k} only in B")
        for k in keys_a & keys_b:
            diffs.extend(deep_compare(a[k], b[k], f"{path}.{k}"))
    elif isinstance(a, list):
        if len(a) != len(b):
            diffs.append(f"~{path} list length: {len(a)} vs {len(b)}")
        else:
            for i, (av, bv) in enumerate(zip(a, b)):
                diffs.extend(deep_compare(av, bv, f"{path}[{i}]"))
    elif a != b:
        diffs.append(f"~{path} value: {str(a)[:100]} vs {str(b)[:100]}")
    return diffs


def get_canonical_local(canonical_rel_path: str) -> Tuple[Any, str]:
    """Lê canônico local (Casa)."""
    path = CASA_ROOT / canonical_rel_path
    if not path.exists():
        raise FileNotFoundError(f"Canônico local não encontrado: {path}")
    data = load_json_file(path)
    sha = sha256_file(path)
    return data, sha


def get_canonical_remote(canonical_rel_path: str) -> Tuple[Any, str, str]:
    """Lê canônico remoto (GitHub origin/main)."""
    # HEAD remoto
    code, head_sha, _ = run_cmd(["git", "ls-remote", "origin", "refs/heads/main"], cwd=CASA_ROOT)
    if code != 0 or not head_sha:
        raise RuntimeError("Falha ao obter HEAD remoto")
    head_sha = head_sha.split("\t")[0]
    
    # Arquivo no HEAD remoto
    code, content, err = run_cmd(["git", "show", f"origin/main:{canonical_rel_path}"], cwd=CASA_ROOT)
    if code != 0:
        raise RuntimeError(f"Arquivo não existe no origin/main: {err}")
    
    data = json.loads(content)
    return data, head_sha, sha256_file(Path(content.encode()))


def get_vps_state() -> Dict[str, Any]:
    """Mede estado Git da VPS via SSH."""
    cmd = [
        "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", VPS_HOST,
        f"cd {VPS_REPO} && "
        "git rev-parse HEAD && "
        "git branch --show-current && "
        "git status --porcelain | wc -l && "
        "ps -eo args | grep -c '[g]it' || true"
    ]
    code, stdout, stderr = run_cmd(cmd)
    if code != 0:
        return {"error": f"SSH falhou: {stderr}", "accessible": False}
    
    lines = stdout.strip().split("\n")
    return {
        "accessible": True,
        "head_sha": lines[0] if len(lines) > 0 else "?",
        "branch": lines[1] if len(lines) > 1 else "DETACHED",
        "dirty_files": int(lines[2]) if len(lines) > 2 and lines[2].isdigit() else -1,
        "git_processes": int(lines[3]) if len(lines) > 3 and lines[3].isdigit() else -1,
    }


def classify_diff(diffs: list) -> str:
    """Classifica o tipo de diferença."""
    if not diffs:
        return "IDENTICO"
    
    extra_keys = [d for d in diffs if d.startswith("+")]
    missing_keys = [d for d in diffs if d.startswith("-")]
    value_diffs = [d for d in diffs if d.startswith("~")]
    
    # Se só tem chaves extras que parecem feature flags
    if extra_keys and not missing_keys and not value_diffs:
        # Verifica se parece feature branch (ex: copy_paste_exact_mode)
        for ek in extra_keys:
            if "copy_paste" in ek.lower() or "exact_mode" in ek.lower():
                return "CANDIDATO"
    
    if extra_keys or missing_keys:
        return "DIVERGENCIA"
    
    return "DIVERGENCIA"


def main():
    if len(sys.argv) < 3:
        print("Uso: external-reconcile.py <arquivo_externo> <caminho_canonico_relativo>", file=sys.stderr)
        sys.exit(1)
    
    external_path = Path(sys.argv[1])
    canonical_rel = sys.argv[2]
    
    if not external_path.exists():
        print(f"Arquivo externo não encontrado: {external_path}", file=sys.stderr)
        sys.exit(1)
    
    # 1. Carregar arquivo externo
    try:
        external_data = load_json_file(external_path)
        external_sha = sha256_file(external_path)
    except Exception as e:
        print(f"Erro ao ler arquivo externo: {e}", file=sys.stderr)
        sys.exit(1)
    
    # 2. Carregar canônico local
    try:
        canonical_local, local_sha = get_canonical_local(canonical_rel)
    except Exception as e:
        print(f"Erro ao ler canônico local: {e}", file=sys.stderr)
        sys.exit(1)
    
    # 3. Medir remoto
    try:
        canonical_remote, remote_head, remote_sha = get_canonical_remote(canonical_rel)
        remote_ok = True
    except Exception as e:
        canonical_remote = None
        remote_head = "ERROR"
        remote_sha = "ERROR"
        remote_ok = False
    
    # 4. Medir VPS (opcional - apenas status Git)
    vps_state = get_vps_state()
    
    # 5. Comparar semanticamente
    diffs = deep_compare(canonical_local, external_data)
    classification = classify_diff(diffs)
    
    # 6. Decisão
    decision_map = {
        "IDENTICO": "IGNORAR",
        "CANDIDATO": "AGUARDAR_PROMOCAO",
        "DIVERGENCIA": "BLOQUEAR",
        "MELHORA": "PR_CANONICO",
    }
    decision = decision_map.get(classification, "BLOQUEAR")
    
    # 7. Report YAML
    report = {
        "EXTERNAL_FILE_RECONCILIATION": {
            "file": str(external_path),
            "canonical_local": f"LOADED|sha256:{local_sha[:16]}",
            "canonical_remote": f"HEAD={remote_head[:12]}|BRANCH=main" if remote_ok else "ERROR",
            "vps_state": "MEASURED" if vps_state.get("accessible") else "BLOCKED",
            "comparison": classification,
            "diff_semantic": "; ".join(diffs[:5]) if diffs else "none",
            "diff_keys": [d for d in diffs if d.startswith(("+", "-"))][:10],
            "decision": decision,
            "evidence": f"local_sha={local_sha[:16]} remote_head={remote_head[:12]} vps={vps_state.get('branch','?')}"
        }
    }
    
    print(yaml_dump(report))
    
    # Exit code baseado na classificação
    if classification == "IDENTICO":
        sys.exit(0)
    elif classification == "CANDIDATO":
        sys.exit(1)  # aguardar
    else:
        sys.exit(2)  # bloquear/divergir


def yaml_dump(obj: Any, indent: int = 0) -> str:
    """Simple YAML dump para o report."""
    lines = []
    prefix = "  " * indent
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                lines.append(f"{prefix}{k}:")
                lines.append(yaml_dump(v, indent + 1))
            else:
                lines.append(f"{prefix}{k}: \"{v}\"")
    elif isinstance(obj, list):
        for v in obj:
            lines.append(f"{prefix}- \"{v}\"")
    else:
        lines.append(f"{prefix}\"{obj}\"")
    return "\n".join(lines)


if __name__ == "__main__":
    main()