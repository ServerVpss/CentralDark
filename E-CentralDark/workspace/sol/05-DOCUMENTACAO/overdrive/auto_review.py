#!/usr/bin/env python3
"""
Overdrive Auto-Review — revisão automática que roda ANTES de qualquer script do overdrive.

Pre-flight checklist silencioso: verifica estado, integridade e ambiente.
- Silencioso por padrão (só imprime em erro/aviso)
- --verbose para detalhar cada step
- Importável como módulo: check_all() retorna dict estruturado

Uso:
    python auto_review.py                  # silencioso, exit 0 se tudo OK
    python auto_review.py --verbose        # detalha cada verificação
    python auto_review.py --json           # output JSON em vez de texto
    from auto_review import check_all      # retorna dict programático
    result = check_all(verbose=False)
"""

import json
import os
import sys
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# --- Paths ---
BASE = Path(os.path.dirname(os.path.abspath(__file__)))
STATE_FILE = BASE / "xp_state.json"
VISUALS_FILE = BASE / "skill_visuals.json"
BACKUP_DIR = BASE / "backups"
WIDGETS_DIR = Path(os.path.expanduser(
    os.path.join("~", "AppData", "Local", "hermes", "tui-widgets")
))

# Garante que o diretório do overdrive está no path pra importar xp_engine
if str(BASE) not in sys.path:
    sys.path.insert(0, str(BASE))

# --- Estado inicial seguro ---
def _safe_state():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "total_xp": 0,
        "level": 1,
        "current_level_xp": 0,
        "xp_to_next_level": 500,
        "skills_used": 0,
        "actions_history": [],
        "efficiency_scores": [],
        "created_at": now,
        "last_updated": now,
    }

# Campos obrigatórios e seus tipos esperados
REQUIRED_FIELDS = {
    "total_xp": (int, float),
    "level": int,
    "current_level_xp": (int, float),
    "xp_to_next_level": (int, float),
    "skills_used": int,
    "actions_history": list,
    "efficiency_scores": list,
}

# Lista de campos com default para reparação
FIELD_DEFAULTS = {
    "total_xp": 0,
    "level": 1,
    "current_level_xp": 0,
    "xp_to_next_level": 500,
    "skills_used": 0,
    "actions_history": [],
    "efficiency_scores": [],
    "created_at": None,  # preenchido dinamicamente
    "last_updated": None,
}


# --- Logger silencioso ---
class Reviewer:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.messages = []

    def _log(self, msg, level="INFO", always=False):
        """Log que só aparece se verbose ou se always=True (erros/warnings)."""
        ts = datetime.now().strftime("%H:%M:%S")
        icons = {"INFO": "ℹ️", "OK": "✅", "WARN": "⚠️", "ERROR": "❌", "FIX": "🔧"}
        entry = {"level": level, "message": msg, "timestamp": ts}
        self.messages.append(entry)
        if self.verbose or always or level in ("ERROR", "WARN"):
            icon = icons.get(level, "ℹ️")
            print(f"  {icon} [{ts}] {msg}")

    def info(self, msg):
        self._log(msg, "INFO")

    def ok(self, msg):
        self._log(msg, "OK")

    def warn(self, msg):
        self._log(msg, "WARN", always=True)

    def error(self, msg):
        self._log(msg, "ERROR", always=True)

    def fix(self, msg):
        self._log(msg, "FIX", always=True)


# --- Helpers ---
def _load_json(path):
    """Carrega JSON. Retorna (data, error)."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f), None
    except json.JSONDecodeError as e:
        return None, f"JSON inválido: {e}"
    except Exception as e:
        return None, f"Erro ao ler: {e}"


def _save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _find_latest_backup():
    """Encontra o backup mais recente. Retorna Path ou None."""
    if not BACKUP_DIR.exists():
        return None
    backups = sorted(
        BACKUP_DIR.glob("xp_state_*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return backups[0] if backups else None


# --- Verificações individuais ---

def check_xp_state(reviewer):
    """
    1) Verifica xp_state.json: JSON válido, campos, tipos, consistência level/total_xp.
    2) Se corrompido, restaura do backup.
    3) Se sem backup, cria estado seguro.
    """
    result = {
        "name": "xp_state",
        "ok": False,
        "action": "none",  # none | repaired | restored | created
        "details": {},
        "errors": [],
    }

    # Arquivo não existe — criar estado seguro
    if not STATE_FILE.exists():
        reviewer.warn("xp_state.json não encontrado — criando estado seguro")
        state = _safe_state()
        _save_json(STATE_FILE, state)
        reviewer.fix("Estado seguro criado: Nível 1, 0 XP")
        result["action"] = "created"
        result["details"] = {"level": 1, "total_xp": 0}
        result["ok"] = True
        return result

    # Carrega JSON
    state, err = _load_json(STATE_FILE)
    if err:
        reviewer.error(f"xp_state.json corrompido — {err}")
        # Tenta restaurar do backup
        restored = _restore_from_backup(reviewer)
        result["action"] = "restored" if restored["ok"] else "created"
        result["details"] = restored.get("details", {})
        result["ok"] = restored["ok"]
        if restored["errors"]:
            result["errors"].extend(restored["errors"])
        return result

    # Valida campos obrigatórios
    missing = [f for f in REQUIRED_FIELDS if f not in state]
    if missing:
        reviewer.warn(f"Campos faltando: {missing} — reparando")
        for f in missing:
            default = FIELD_DEFAULTS[f]
            if default is None:
                default = datetime.now(timezone.utc).isoformat()
            state[f] = default
        _save_json(STATE_FILE, state)
        reviewer.fix("Campos reparados")
        result["action"] = "repaired"

    # Valida tipos
    type_errors = []
    for field, expected_type in REQUIRED_FIELDS.items():
        val = state.get(field)
        if val is None:
            type_errors.append(f"{field}: ausente")
            continue
        if not isinstance(val, expected_type):
            # bool é subclasse de int — rejeitar bool onde se espera int
            if expected_type is int and isinstance(val, bool):
                type_errors.append(f"{field}: esperado int, got bool")
                continue
            if isinstance(val, bool) and expected_type == (int, float):
                type_errors.append(f"{field}: esperado número, got bool")
                continue
            type_errors.append(f"{field}: esperado {expected_type}, got {type(val).__name__}")
            # Repara
            default = FIELD_DEFAULTS[field]
            if default is None:
                default = datetime.now(timezone.utc).isoformat()
            state[field] = default
            reviewer.warn(f"{field} com tipo inválido — resetado para {default}")
    if type_errors:
        _save_json(STATE_FILE, state)
        reviewer.fix("Tipos reparados")
        result["action"] = "repaired"
        result["errors"].extend(type_errors)

    # Consistência: level vs total_xp
    try:
        from xp_engine import xp_threshold_for_next_level, xp_for_level
        total_xp = int(state["total_xp"])
        expected_level = 1
        cumul = 0
        threshold = xp_threshold_for_next_level(expected_level)
        while cumul + threshold <= total_xp:
            cumul += threshold
            expected_level += 1
            threshold = xp_threshold_for_next_level(expected_level)

        if int(state["level"]) != expected_level:
            reviewer.warn(
                f"Nível inconsistente: era {state['level']}, deveria ser {expected_level}"
            )
            state["level"] = expected_level
            state["current_level_xp"] = total_xp - cumul
            state["xp_to_next_level"] = threshold
            _save_json(STATE_FILE, state)
            reviewer.fix(f"Nível corrigido para {expected_level}")
            result["action"] = "repaired" if result["action"] == "none" else result["action"]
        else:
            reviewer.ok(
                f"xp_state.json OK — Nível {state['level']}, {state['total_xp']} XP"
            )
    except Exception as e:
        reviewer.warn(f"Não foi possível validar consistência level/total_xp: {e}")
        result["errors"].append(f"consistency_check_failed: {e}")

    result["ok"] = True
    result["details"] = {
        "level": state.get("level"),
        "total_xp": state.get("total_xp"),
        "skills_used": state.get("skills_used"),
    }
    return result


def _restore_from_backup(reviewer):
    """Restaura do backup mais recente. Se backup também corrompido ou inexistente, cria estado seguro."""
    result = {"ok": False, "details": {}, "errors": []}

    backup = _find_latest_backup()
    if backup is None:
        reviewer.warn("Nenhum backup disponível — criando estado seguro")
        state = _safe_state()
        _save_json(STATE_FILE, state)
        reviewer.fix("Estado seguro criado: Nível 1, 0 XP")
        result["ok"] = True
        result["details"] = {"level": 1, "total_xp": 0, "source": "safe_state"}
        return result

    reviewer.info(f"Tentando restaurar de {backup.name}")
    state, err = _load_json(backup)
    if err:
        reviewer.error(f"Backup {backup.name} também corrompido — {err}")
        # Tenta próximo backup
        backups = sorted(
            BACKUP_DIR.glob("xp_state_*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        for b in backups[1:]:
            reviewer.info(f"Tentando backup mais antigo: {b.name}")
            state, err = _load_json(b)
            if err is None:
                break
        if err is not None:
            reviewer.warn("Todos backups corrompidos — criando estado seguro")
            state = _safe_state()
            _save_json(STATE_FILE, state)
            reviewer.fix("Estado seguro criado")
            result["ok"] = True
            result["details"] = {"level": 1, "total_xp": 0, "source": "safe_state"}
            return result

    _save_json(STATE_FILE, state)
    reviewer.ok(f"Estado restaurado de backup: Nível {state.get('level', 1)}, {state.get('total_xp', 0)} XP")
    result["ok"] = True
    result["details"] = {
        "level": state.get("level", 1),
        "total_xp": state.get("total_xp", 0),
        "source": str(backup.name),
    }
    return result


def check_skill_visuals(reviewer):
    """4) Verifica skill_visuals.json."""
    result = {
        "name": "skill_visuals",
        "ok": False,
        "action": "none",
        "details": {},
        "errors": [],
    }

    if not VISUALS_FILE.exists():
        reviewer.warn("skill_visuals.json não encontrado")
        result["errors"].append("file_not_found")
        return result

    visuals, err = _load_json(VISUALS_FILE)
    if err:
        reviewer.error(f"skill_visuals.json corrompido — {err}")
        result["errors"].append(err)
        return result

    if "skills" not in visuals:
        reviewer.warn("skill_visuals.json sem chave 'skills'")
        result["errors"].append("missing_skills_key")
        return result

    skills = visuals.get("skills", {})
    if not isinstance(skills, dict):
        reviewer.warn("skill_visuals.json: 'skills' não é um objeto/dict")
        result["errors"].append("skills_not_dict")
        return result

    skill_count = len(skills)
    reviewer.ok(f"skill_visuals.json OK — {skill_count} skills mapeadas")
    result["ok"] = True
    result["details"] = {"skill_count": skill_count}
    return result


def check_widgets(reviewer):
    """5) Verifica widgets .mjs com node --check."""
    result = {
        "name": "widgets",
        "ok": False,
        "action": "none",
        "details": {"checked": [], "failed": []},
        "errors": [],
    }

    if not WIDGETS_DIR.exists():
        reviewer.warn(f"Diretório de widgets não encontrado: {WIDGETS_DIR}")
        result["errors"].append("widgets_dir_not_found")
        return result

    widgets = list(WIDGETS_DIR.glob("*.mjs"))
    if not widgets:
        reviewer.warn("Nenhum widget .mjs encontrado")
        result["errors"].append("no_widgets")
        return result

    # Verifica se node está disponível
    try:
        node_check = subprocess.run(
            ["node", "--version"],
            capture_output=True, text=True, timeout=5,
        )
        if node_check.returncode != 0:
            reviewer.warn("node não disponível — pulando verificação de sintaxe")
            result["errors"].append("node_unavailable")
            return result
    except (FileNotFoundError, subprocess.TimeoutExpired):
        reviewer.warn("node não encontrado no PATH — pulando verificação de sintaxe")
        result["errors"].append("node_not_found")
        return result

    all_ok = True
    for w in sorted(widgets):
        try:
            r = subprocess.run(
                ["node", "--check", str(w)],
                capture_output=True, text=True, timeout=10,
            )
            if r.returncode == 0:
                reviewer.ok(f"Widget {w.name} — sintaxe OK")
                result["details"]["checked"].append(w.name)
            else:
                err_msg = r.stderr.strip()[:200] if r.stderr else "erro desconhecido"
                reviewer.error(f"Widget {w.name} — ERRO de sintaxe: {err_msg}")
                result["details"]["failed"].append({"file": w.name, "error": err_msg})
                result["errors"].append(f"{w.name}: syntax_error")
                all_ok = False
        except subprocess.TimeoutExpired:
            reviewer.warn(f"Widget {w.name} — timeout no node --check")
            result["details"]["failed"].append({"file": w.name, "error": "timeout"})
            result["errors"].append(f"{w.name}: timeout")
            all_ok = False
        except Exception as e:
            reviewer.error(f"Widget {w.name} — erro inesperado: {e}")
            result["errors"].append(f"{w.name}: {e}")
            all_ok = False

    result["ok"] = all_ok
    return result


def check_colorterm(reviewer):
    """6) Verifica COLORTERM=truecolor."""
    result = {
        "name": "colorterm",
        "ok": False,
        "action": "none",
        "details": {},
        "errors": [],
    }

    ct = os.environ.get("COLORTERM", "")
    result["details"]["session"] = ct

    if ct == "truecolor":
        reviewer.ok("COLORTERM=truecolor ativo nesta sessão")
        result["ok"] = True
    else:
        reviewer.warn(f"COLORTERM={ct or '∅'} — truecolor pode não estar ativo")
        result["errors"].append(f"colorterm_not_truecolor: {ct or 'unset'}")
        # Ainda assim não é erro fatal — sistema pode funcionar com fallback
        result["ok"] = True  # warning, não bloqueante
        result["details"]["warning"] = True

    return result


# --- Função principal importável ---

def check_all(verbose=False):
    """
    Executa todas as verificações do pre-flight review.
    Retorna dict estruturado com resultados de cada check.

    Returns:
        {
            "passed": bool,           # True se todas verificações críticas passaram
            "checks": [ ... ],        # Lista de resultados individuais
            "messages": [ ... ],      # Log de mensagens
            "summary": {              # Resumo rápido
                "xp_state_ok": bool,
                "visuals_ok": bool,
                "widgets_ok": bool,
                "colorterm_ok": bool,
            }
        }
    """
    reviewer = Reviewer(verbose=verbose)

    reviewer.info("Auto-review iniciada")

    checks = [
        check_xp_state(reviewer),
        check_skill_visuals(reviewer),
        check_widgets(reviewer),
        check_colorterm(reviewer),
    ]

    # passed = todas as verificações críticas OK (colorterm é warning, não bloqueante)
    # xp_state, visuals e widgets são críticos
    critical_ok = all(c["ok"] for c in checks)
    # colorterm é sempre ok=True (warning não bloqueante), então critical_ok cobre

    summary = {
        "xp_state_ok": checks[0]["ok"],
        "visuals_ok": checks[1]["ok"],
        "widgets_ok": checks[2]["ok"],
        "colorterm_ok": checks[3]["ok"],
    }

    if critical_ok:
        reviewer.ok("Auto-review completa — sistema operacional")
    else:
        reviewer.error("Auto-review encontrou problemas — verifique os erros acima")

    return {
        "passed": critical_ok,
        "checks": checks,
        "messages": reviewer.messages,
        "summary": summary,
    }


# --- CLI ---

def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="Overdrive Auto-Review — pre-flight check silencioso"
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true",
        help="Detalha cada verificação (default: silencioso)"
    )
    parser.add_argument(
        "--json", action="store_true",
        help="Output em JSON em vez de texto"
    )
    args = parser.parse_args()

    result = check_all(verbose=args.verbose)

    if args.json:
        # JSON output sempre completo, independente de verbose
        print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
    else:
        # Modo texto: se não verbose e tudo OK, não imprime nada extra
        if args.verbose or not result["passed"]:
            print()
            print("═" * 55)
            if result["passed"]:
                print("  ✅ AUTO-REVIEW: SISTEMA OPERACIONAL")
            else:
                print("  ❌ AUTO-REVIEW: PROBLEMAS ENCONTRADOS")
            print("═" * 55)
            for check in result["checks"]:
                status = "✅" if check["ok"] else "❌"
                name = check["name"]
                detail = ""
                if check.get("details"):
                    if name == "xp_state":
                        detail = f" — Nível {check['details'].get('level', '?')}, {check['details'].get('total_xp', 0)} XP"
                    elif name == "skill_visuals":
                        detail = f" — {check['details'].get('skill_count', 0)} skills"
                    elif name == "widgets":
                        checked = len(check["details"].get("checked", []))
                        failed = len(check["details"].get("failed", []))
                        detail = f" — {checked} OK, {failed} falhou"
                action = f" [{check['action']}]" if check["action"] != "none" else ""
                print(f"  {status} {name}{action}{detail}")
            print("═" * 55)

    # Exit code: 0 se passou, 1 se houve problemas
    sys.exit(0 if result["passed"] else 1)


if __name__ == "__main__":
    main()
