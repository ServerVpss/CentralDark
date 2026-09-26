#!/usr/bin/env python3
"""
Overdrive Recovery — sistema de recuperação automática.
Roda quando o TUI cai ou a sessão reinicia. Verifica, repara e restaura.

Uso:
    python overdrive_recovery.py              # verifica e repara
    python overdrive_recovery.py --backup     # cria backup do estado
    python overdrive_recovery.py --restore    # restaura do último backup
    python overdrive_recovery.py --status      # só mostra estado
"""

import json
import os
import sys
import shutil
import subprocess
import math
from datetime import datetime, timezone
from pathlib import Path

# Garante que o diretório do overdrive está no path pra importar xp_engine
_OVERDRIVE_DIR = Path("E:/CentralDark/Sol/overdrive")
if str(_OVERDRIVE_DIR) not in sys.path:
    sys.path.insert(0, str(_OVERDRIVE_DIR))

BASE = Path("E:/CentralDark/Sol/overdrive")
STATE_FILE = BASE / "xp_state.json"
VISUALS_FILE = BASE / "skill_visuals.json"
BACKUP_DIR = BASE / "backups"
WIDGETS_DIR = Path("C:/Users/danda/AppData/Local/hermes/tui-widgets")

# Estado inicial seguro
SAFE_STATE = {
    "total_xp": 0,
    "level": 1,
    "current_level_xp": 0,
    "xp_to_next_level": 500,
    "skills_used": 0,
    "actions_history": [],
    "efficiency_scores": [],
    "created_at": datetime.now(timezone.utc).isoformat(),
    "last_updated": datetime.now(timezone.utc).isoformat(),
}


def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    icons = {"INFO": "ℹ️", "OK": "✅", "WARN": "⚠️", "ERROR": "❌", "FIX": "🔧", "RECOVER": "🔄"}
    print(f"  {icons.get(level, 'ℹ️')} [{ts}] {msg}")


def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return None


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def verify_xp_state():
    """Verifica integridade do xp_state.json. Repara se necessário."""
    if not STATE_FILE.exists():
        log("xp_state.json não encontrado — criando estado inicial seguro", "WARN")
        save_json(STATE_FILE, SAFE_STATE)
        log("Estado inicial criado: Nível 1, 0 XP", "FIX")
        return SAFE_STATE

    state = load_json(STATE_FILE)
    if state is None:
        log("xp_state.json corrompido (JSON inválido) — tentando backup", "ERROR")
        return restore_from_backup()

    # Validar campos obrigatórios
    required = ["total_xp", "level", "current_level_xp", "xp_to_next_level",
                "skills_used", "actions_history", "efficiency_scores"]
    missing = [f for f in required if f not in state]
    if missing:
        log(f"Campos faltando: {missing} — reparando", "WARN")
        for f in required:
            if f not in state:
                state[f] = [] if f in ("actions_history", "efficiency_scores") else SAFE_STATE[f]
        save_json(STATE_FILE, state)
        log("Campos reparados", "FIX")

    # Validar tipos
    needs_save = False
    if not isinstance(state.get("total_xp", 0), (int, float)):
        log("total_xp inválido — resetando", "WARN")
        state["total_xp"] = 0
        needs_save = True
    elif not math.isfinite(state["total_xp"]) or state["total_xp"] < 0:
        log(f"total_xp inválido ({state['total_xp']}) — resetando", "WARN")
        state["total_xp"] = 0
        needs_save = True
    if not isinstance(state.get("level", 0), int):
        log("level inválido — resetando", "WARN")
        state["level"] = 1
        needs_save = True
    if needs_save:
        save_json(STATE_FILE, state)

    # Consistência: level vs total_xp
    from xp_engine import xp_threshold_for_next_level
    expected_level = 1
    cumul = 0
    threshold = xp_threshold_for_next_level(expected_level)
    while cumul + threshold <= state["total_xp"]:
        cumul += threshold
        expected_level += 1
        threshold = xp_threshold_for_next_level(expected_level)

    if state["level"] != expected_level:
        log(f"Nível inconsistente: era {state['level']}, deveria ser {expected_level}", "WARN")
        state["level"] = expected_level
        state["current_level_xp"] = state["total_xp"] - cumul
        state["xp_to_next_level"] = threshold
        save_json(STATE_FILE, state)
        log(f"Nível corrigido para {expected_level}", "FIX")

    return state


def verify_visuals():
    """Verifica skill_visuals.json."""
    if not VISUALS_FILE.exists():
        log("skill_visuals.json não encontrado", "WARN")
        return False
    visuals = load_json(VISUALS_FILE)
    if visuals is None:
        log("skill_visuals.json corrompido", "ERROR")
        return False
    if "skills" not in visuals:
        log("skill_visuals.json sem chave 'skills'", "WARN")
        return False
    skill_count = len(visuals.get("skills", {}))
    log(f"skill_visuals.json OK — {skill_count} skills mapeadas", "OK")
    return True


def verify_widgets():
    """Verifica que os widgets TUI existem e têm sintaxe válida."""
    import subprocess
    widgets = list(WIDGETS_DIR.glob("*.mjs")) if WIDGETS_DIR.exists() else []
    if not widgets:
        log("Nenhum widget .mjs encontrado", "WARN")
        return False

    all_ok = True
    for w in widgets:
        r = subprocess.run(["node", "--check", str(w)], capture_output=True, timeout=10)
        if r.returncode == 0:
            log(f"Widget {w.name} — sintaxe OK", "OK")
        else:
            log(f"Widget {w.name} — ERRO de sintaxe: {r.stderr.strip()[:80]}", "ERROR")
            all_ok = False
    return all_ok


def create_backup():
    """Cria backup do estado atual — só se o estado for válido."""
    state = load_json(STATE_FILE)
    if state is None:
        log("Estado inválido — não criando backup corrompido", "WARN")
        return
    BACKUP_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"xp_state_{ts}.json"
    shutil.copy2(STATE_FILE, backup_path)
    log(f"Backup criado: {backup_path.name}", "OK")
    # Manter só os 5 mais recentes
    backups = sorted(BACKUP_DIR.glob("xp_state_*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    for old in backups[5:]:
        old.unlink()


def restore_from_backup():
    """Restaura do backup mais recente."""
    if not BACKUP_DIR.exists():
        log("Nenhum backup encontrado — criando estado inicial", "WARN")
        save_json(STATE_FILE, SAFE_STATE)
        return SAFE_STATE

    backups = sorted(BACKUP_DIR.glob("xp_state_*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not backups:
        log("Backups vazios — criando estado inicial", "WARN")
        save_json(STATE_FILE, SAFE_STATE)
        return SAFE_STATE

    backup = backups[0]
    log(f"Restaurando de {backup.name}", "RECOVER")
    state = load_json(backup)
    if state is None:
        log("Backup corrompido — criando estado inicial", "ERROR")
        save_json(STATE_FILE, SAFE_STATE)
        return SAFE_STATE
    save_json(STATE_FILE, state)
    log(f"Estado restaurado: Nível {state.get('level', 1)}, {state.get('total_xp', 0)} XP", "OK")
    return state


def verify_env():
    """Verifica COLORTERM e outras variáveis críticas."""
    ct = os.environ.get("COLORTERM", "")
    if ct == "truecolor":
        log("COLORTERM=truecolor — truecolor ativo nesta sessão", "OK")
    else:
        log(f"COLORTERM={ct or '∅'} — truecolor pode não estar ativo", "WARN")

    # Verifica persistência (User-level)
    try:
        import subprocess
        r = subprocess.run(
            ["powershell", "-Command", "[Environment]::GetEnvironmentVariable('COLORTERM', 'User')"],
            capture_output=True, text=True, timeout=10
        )
        persisted = r.stdout.strip()
        if persisted == "truecolor":
            log("COLORTERM=truecolor persistido no Windows (User)", "OK")
        else:
            log(f"COLORTERM persistido={persisted or '∅'} — pode precisar reset", "WARN")
    except Exception:
        log("Não foi possível verificar COLORTERM persistido", "WARN")


def print_status(state):
    """Mostra estado atual de tudo."""
    eff = state.get("efficiency_scores", [])
    avg = sum(eff) / len(eff) if eff else 0
    hist = state.get("actions_history", [])

    print("\n" + "=" * 55)
    print("  🔄 OVERDRIVE RECOVERY — STATUS DO SISTEMA")
    print("=" * 55)
    print(f"  ⭐ Nível:           {state.get('level', 1)}")
    print(f"  📊 XP Total:        {state.get('total_xp', 0):,} XP")
    print(f"  📈 XP no nível:     {state.get('current_level_xp', 0):,} / {state.get('xp_to_next_level', 500):,}")
    print(f"  🔧 Skills usadas:   {state.get('skills_used', 0)}")
    print(f"  ⚡ Eficiência média: {avg:.1f}%")
    print(f"  📜 Histórico:       {len(hist)} entradas")

    # Últimas 3 ações
    if hist:
        print(f"\n  📋 ÚLTIMAS AÇÕES:")
        for entry in hist[-3:]:
            sk = entry.get("skill", "?")
            xp = entry.get("xp_gained", 0)
            eff = entry.get("efficiency", "—")
            print(f"    {sk:25s} +{xp} XP | eff {eff}%")

    # Widgets
    print(f"\n  📦 WIDGETS:")
    if WIDGETS_DIR.exists():
        for w in sorted(WIDGETS_DIR.glob("*.mjs")):
            print(f"    ✅ {w.name}")
    else:
        print("    ❌ Diretório de widgets não encontrado")

    # Visuals
    print(f"\n  🎨 VISUALS:")
    if VISUALS_FILE.exists():
        v = load_json(VISUALS_FILE)
        if v and "skills" in v:
            print(f"    ✅ {len(v['skills'])} skills mapeadas")
        else:
            print("    ⚠️ Arquivo existe mas inválido")
    else:
        print("    ❌ skill_visuals.json não encontrado")

    # Backups
    print(f"\n  💾 BACKUPS:")
    if BACKUP_DIR.exists():
        backups = list(BACKUP_DIR.glob("xp_state_*.json"))
        if backups:
            print(f"    ✅ {len(backups)} backups disponíveis")
        else:
            print("    ⚠️ Diretório existe mas vazio")
    else:
        print("    ❌ Nenhum backup")

    print("=" * 55 + "\n")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Overdrive Recovery System")
    parser.add_argument("--backup", action="store_true", help="Criar backup do estado")
    parser.add_argument("--restore", action="store_true", help="Restaurar do último backup")
    parser.add_argument("--status", action="store_true", help="Só mostrar status")
    args = parser.parse_args()

    print("\n" + "═" * 55)
    print("  🔄 OVERDRIVE RECOVERY SYSTEM")
    print("═" * 55)

    if args.status:
        state = load_json(STATE_FILE) or SAFE_STATE
        print_status(state)
        verify_env()
        return

    if args.backup:
        create_backup()
        return

    if args.restore:
        restore_from_backup()
        return

    # --- Recuperação completa ---

    log("Iniciando verificação de recuperação…", "INFO")

    # 1. Criar backup antes de qualquer coisa
    log("Criando backup de segurança…", "INFO")
    create_backup()

    # 2. Verificar e reparar XP state
    log("Verificando xp_state.json…", "INFO")
    state = verify_xp_state()
    log(f"Estado OK: Nível {state['level']}, {state['total_xp']} XP, {state['skills_used']} skills", "OK")

    # 3. Verificar visuals
    log("Verificando skill_visuals.json…", "INFO")
    verify_visuals()

    # 4. Verificar widgets
    log("Verificando widgets TUI…", "INFO")
    verify_widgets()

    # 5. Verificar ambiente
    log("Verificando ambiente (COLORTERM)…", "INFO")
    verify_env()

    # 6. Status final
    print_status(state)

    log("Recuperação completa — sistema operacional", "OK")


if __name__ == "__main__":
    main()
