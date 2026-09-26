---
name: hermes-platform-access-control
description: "Verify or lock who can message the Hermes bot."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hermes, telegram, access-control, config, security, allowed-users]
    category: operational
---

# Hermes Platform Access Control — Verify / Lock

## Trigger
User asks any of:
- "can anyone DM the bot or only me?"
- "is the bot open to anyone? lock it to me"
- "who is allowed to message the bot?"
- "how do I restrict the Telegram/Discord/WhatsApp bot to specific users?"

## Core fact
Hermes platform access allowlists live in the **`.env` file** (secret-bearing), NOT in `config.yaml`. They are comma-separated user IDs:
- `TELEGRAM_ALLOWED_USERS` — DMs + groups + forums (applies everywhere)
- `TELEGRAM_GROUP_ALLOWED_USERS` — sender IDs authorized in groups/forums only (does NOT grant DM)
- `TELEGRAM_GROUP_ALLOWED_CHATS` — group/forum chat IDs; any member authorized
- Per-platform equivalents: `DISCORD_ALLOWED_USERS`, `WHATSAPP_ALLOWED_USERS` (`*` = allow all), `SLACK_ALLOWED_USERS`, `SIGNAL_ALLOWED_USERS`, `GOOGLE_CHAT_ALLOWED_USERS`, etc.

A wildcard `*` means open to all senders — the lock you want is a specific numeric ID, no `*`.

## Lookup recipe (READ_ONLY, safe)
```bash
# 1. Resolve the ACTIVE Hermes home — config/.env there are the live ones
echo "HERMES_HOME=$HERMES_HOME"

# 2. Grep the allowlist vars in the active .env (read_file is blocked on .env; use terminal)
grep -niE "TELEGRAM_ALLOWED|TELEGRAM_GROUP_ALLOWED" "$HERMES_HOME/.env"

# 3. Confirm no wildcard and no group exception that opens a backdoor
grep -nE "=\*|ALLOWED_USERS=\s*$" "$HERMES_HOME/.env"
```

## PITFALL — first config.yaml is usually NOT the active one
On this machine `C:\Users\danda\AppData\Local\hermes\config.yaml` showed `platforms.telegram.enabled: false`, yet the bot was clearly responding. Reason: `HERMES_HOME=E:/CentralDark/Pivete`, so the **active** config is `E:/CentralDark/Pivete/config.yaml`, not the AppData one. The AppData `config.yaml` is a stale/legacy profile copy.

**Rule:** never trust the `config.yaml` you find first. Resolve `HERMES_HOME` and inspect THAT path's `config.yaml` + `.env`. `platforms.<x>.enabled: false` in a non-active config is misleading — it does not mean the bot is off.

## How to lock to one user (R2 — config change, reversible)
Set in the ACTIVE `.env` (the one under `$HERMES_HOME`):
```
TELEGRAM_ALLOWED_USERS=1901426549
```
Comma-separate for multiple: `TELEGRAM_ALLOWED_USERS=111,222`. Remove or comment out any `TELEGRAM_GROUP_ALLOWED_USERS` / `TELEGRAM_GROUP_ALLOWED_CHATS` to close group backdoors. Restart the gateway/session for it to take effect (access vars are read at startup).

Do NOT hand-edit via read_file (defense-in-depth blocks it); use `terminal` to grep/inspect, and tell the user to edit the value (or use `hermes config set` if a config-key equivalent exists). Never paste the `.env` contents back into chat.

## Fixed point for "is it locked?"
- `TELEGRAM_ALLOWED_USERS` = exact target ID(s), no `*`
- no `TELEGRAM_GROUP_ALLOWED_USERS` / `TELEGRAM_GROUP_ALLOWED_CHATS` set (or intentionally scoped)
- bot responds to target, rejects others at the gateway

## Related
- Card notification format (admin vs status channel) is canonical at `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md` — do NOT duplicate; read it before sending cards.
