# 👑🪬 REVIEW — cron paths + council output

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Correction of previous claim

Previous probe checked assumed paths:
- /root/CentralDark/scripts/casa-bridge-monitor.sh
- /root/CentralDark/scripts/hermes-watchdog.sh
- /root/CentralDark/scripts/memory-linker-inbox-sentinel.sh

But live crontab actually references:
- /root/CentralDark/scripts/remote-bridge/monitor-casa-bridge.sh
- /root/CentralDark/docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/watchdog.sh
- /root/CentralDark/scripts/memory-linker/inbox-sentinel-cron.sh

Therefore:
PREVIOUS_THREE_MISSING_CRON_PATHS_CLAIM=RETRACTED.
CAUSE=WRONG_ASSUMED_PATHS_IN_PROBE.
ACTUAL_CRON_TARGET_EXISTENCE=UNKNOWN_UNTIL_MEASURED.

## Council

Live crontab:
- daily Arsenal hermes.sh at 06:00
- atualizar-conselho-vivo.mjs every 5 min
- Cartografo every 30 min

/var/log/conselho-vivo.log repeatedly reports:
"conselho-vivo.json atualizado — 8 debates · 8 evoluções"

But:
docs/CONSCIENCIA/ARSENAL/conselho-vivo.json = ABSENT

Therefore:
COUNSEL_UPDATE_ACTIVITY=CONFIRMED
COUNSEL_OUTPUT_PATH=UNKNOWN
REPO_PATH_ASSUMPTION_INVALID=true

## Grupo Evolução / Telegram

Recent Cartografo log:
- drift debates were created
- notifier reported "credenciais ausentes — pulando envio"
- later repeated "sem drift"

TELEGRAM_DELIVERY_FROM_GROUP_EVOLUTION=NOT_PROVEN
LAST_OBSERVED_NOTIFIER_STATE=CREDENTIALS_ABSENT_SKIP

## Desktop Commander VPS

conta1 service active/running
conta2 service active/running
both launched through /root/centraldark-auth/centraldark-mcp-auth.sh login <profile>

Watchdog timers active/waiting; watchdog service units are inactive/dead between timer invocations, which by itself is normal for oneshot timer services.

## NEXT_CURSOR

1. measure actual cron target existence;
2. inspect atualizar-conselho-vivo output path;
3. inspect latest daily council failure/success tail;
4. only then classify runtime debt.
