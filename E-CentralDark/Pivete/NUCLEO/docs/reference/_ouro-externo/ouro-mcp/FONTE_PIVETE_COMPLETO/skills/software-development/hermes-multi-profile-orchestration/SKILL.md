---
name: hermes-multi-profile-orchestration
description: "Run multiple Hermes profiles as isolated processes with PM2."
version: 1.0.0
author: Hermes Agent (auto-captured from session)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hermes, profiles, multi-instance, orchestration, pm2, telegram, launcher, lifecycle]
    related_skills: [hermes-agent]
---

# Hermes Multi-Profile Orchestration

**Class-level skill** for running and managing multiple Hermes profiles as independent processes, with patterns for Telegram-driven "persona switching", PM2-based lifecycle management, and profile discovery/registration.

## Scope

This skill covers the **operational patterns** for:
- Registering existing profile folders so `hermes profile list` recognizes them
- Running multiple Hermes instances concurrently (different ports, PIDs, isolated state)
- Graceful profile switching via external launcher (PM2, systemd, custom script)
- Telegram bot integration for user-initiated profile switching
- Debugging "profile exists on disk but CLI doesn't see it"

## Hard Invariant

**Profiles cannot be hot-swapped mid-session.** Each `--profile NAME` = separate process. "Switching" = terminate current + spawn new.

---

## Profile Registration & Discovery

### Why a Folder Isn't Enough
A folder at `$HERMES_HOME/profiles/<name>/` is **not** a registered profile. Hermes CLI only lists profiles it has metadata for (stored in its internal registry).

### Register an Existing Folder
```bash
# Option 1: Import (preserves folder as-is)
hermes profile import /path/to/existing/profile/folder

# Option 2: Create with clone-from (registers + links)
hermes profile create <name> --clone-from /path/to/existing/folder

# Option 3: Clone current profile as starting point
hermes profile create <name> --clone       # config + skills only
hermes profile create <name> --clone-all   # everything including memory/sessions
```

### Verify Registration
```bash
hermes profile list          # Should show the profile
hermes profile show <name>   # Shows resolved paths, config, skills
```

---

## Running Multiple Instances Concurrently

Each profile needs:
- Unique port (if gateway/webhook enabled)
- Unique PID
- Isolated `$HERMES_HOME` → `$HERMES_HOME/profiles/<name>/`

### PM2 Ecosystem Config (Recommended for VPS)
```javascript
// ecosystem.config.js — place at /root/CentralDark/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'hermes-default',
      script: 'hermes',
      args: '--profile default',
      interpreter: 'bash',
      env: { HERMES_HOME: '/root/.hermes' },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/CentralDark/logs/hermes-default-error.log',
      out_file: '/root/CentralDark/logs/hermes-default-out.log',
    },
    {
      name: 'hermes-pivete',
      script: 'hermes',
      args: '--profile pivete',
      interpreter: 'bash',
      env: { HERMES_HOME: '/root/.hermes' },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'hermes-sol',
      script: 'hermes',
      args: '--profile sol',
      interpreter: 'bash',
      env: { HERMES_HOME: '/root/.hermes' },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
```

### Start/Stop/Restart via PM2
```bash
pm2 start /root/CentralDark/ecosystem.config.js
pm2 stop hermes-pivete
pm2 restart hermes-sol
pm2 logs hermes-pivete
pm2 save  # Persist across reboot (CRITICAL per CLAUDE.md)
```

---

## Telegram-Driven Profile Switching

Since Telegram webhooks are stateless, the bot **cannot** switch the running Hermes process's profile. Requires an external **Launcher** that owns process lifecycle.

### Architecture
```
User → Telegram Bot → Launcher API → PM2/Process Manager → Hermes Instances
                              ↓
                       Health Check → Notify User
```

### Launcher Script (PM2-backed)
```bash
#!/bin/bash
# /root/CentralDark/scripts/hermes-launcher.sh
# Usage: hermes-launcher.sh <profile> [notify_chat_id]

set -euo pipefail

PROFILE="${1:-default}"
CHAT_ID="${2:-}"
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"

VALID_PROFILES=("default" "pivete" "sol")
if [[ ! " ${VALID_PROFILES[*]} " =~ " ${PROFILE} " ]]; then
  echo "Invalid profile: $PROFILE. Valid: ${VALID_PROFILES[*]}"
  exit 1
fi

PM2_NAME="hermes-${PROFILE}"

# 1. Stop ALL other hermes instances (only one active at a time)
pm2 stop hermes-* 2>/dev/null || true

# 2. Start/restart target
pm2 restart "${PM2_NAME}" --update-env 2>/dev/null || \
  pm2 start /root/CentralDark/ecosystem.config.js --only "${PM2_NAME}"

# 3. Health check (adjust port per profile if needed)
PORT=8080  # or derive from profile
for i in {1..20}; do
  if curl -sf "http://localhost:${PORT}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# 4. Notify via Telegram if chat_id provided
if [[ -n "${CHAT_ID}" && -n "${BOT_TOKEN}" ]]; then
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${CHAT_ID}" \
    -d "text=✅ Perfil ativo: ${PROFILE}" \
    -d "parse_mode=HTML" >/dev/null
fi

echo "Profile ${PROFILE} active on port ${PORT}"
```

### Telegram Webhook Handler (Python Example)
```python
# webhook_handler.py — receives /perfil <name> commands
import subprocess
import os
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
ADMIN_CHAT_ID = os.environ["ADMIN_CHAT_ID"]  # Your user ID
LAUNCHER_SCRIPT = "/root/CentralDark/scripts/hermes-launcher.sh"

async def perfil_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("Uso: /perfil <default|pivete|sol>")
        return
    
    profile = context.args[0].lower()
    valid = ["default", "pivete", "sol"]
    
    if profile not in valid:
        await update.message.reply_text(f"Perfis válidos: {', '.join(valid)}")
        return
    
    await update.message.reply_text(f"🔄 Trocando para <b>{profile}</b>...", parse_mode="HTML")
    
    try:
        # Run launcher with chat_id for notification
        result = subprocess.run(
            [LAUNCHER_SCRIPT, profile, str(update.effective_chat.id)],
            capture_output=True, text=True, timeout=45
        )
        
        if result.returncode == 0:
            await update.message.reply_text(f"✅ Perfil ativo: <b>{profile}</b>", parse_mode="HTML")
        else:
            await update.message.reply_text(f"❌ Falha ao trocar:\n<code>{result.stderr}</code>", parse_mode="HTML")
            
    except subprocess.TimeoutExpired:
        await update.message.reply_text("⏱️ Timeout — verifique logs no servidor")
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: <code>{e}</code>", parse_mode="HTML")

def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("perfil", perfil_command))
    app.run_polling()

if __name__ == "__main__":
    main()
```

---

## Common Pitfalls & Fixes

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Folder exists but `profile list` empty | "Profile does not exist" | `hermes profile import <path>` or `create --clone-from` |
| PM2 restarts killed process | Two instances fighting | Use `pm2 stop` not `kill`; `pm2 delete` then re-add |
| Port conflict on switch | `EADDRINUSE` / health check fails | Ensure old process fully stopped before health check; use unique ports per profile |
| Session DB locked | "Database locked" on resume | Only ONE Hermes process per profile at a time |
| Env vars missing in new profile | Skills/tools not loading | Launcher must export full env (`HERMES_HOME`, API keys) |
| Webhook points to dead instance | Messages lost | Use single entrypoint (nginx/Caddy proxy) or update webhook URL on switch |

---

## Profile Isolation Checklist

When debugging profile-specific issues:
- [ ] `hermes profile list` shows the profile
- [ ] `hermes --profile X config show` resolves correct paths
- [ ] `$HERMES_HOME` → `.../profiles/X/` when process runs
- [ ] Skills in `profiles/X/skills/` (not global)
- [ ] Memory provider configured per-profile (or shared intentionally)
- [ ] Cron jobs in `profiles/X/cron/`
- [ ] `.env` in profile folder has correct keys

---

## References

- `hermes-agent` skill: `references/cli-reference.md` (Profiles section), `references/troubleshooting.md`, `references/windows-quirks.md`
- CLI: `hermes profile --help`, `hermes --help`
- PM2: `pm2 --help`, `pm2 ecosystem`
- Project context: `CLAUDE.md` (Sincronia 4-Point, PM2 rules, areas protegidas)