# 👑🪬 Cron debt confirmed + council output resolved

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Actual cron target existence

Live crontab references:
- /root/CentralDark/scripts/remote-bridge/monitor-casa-bridge.sh
- /root/CentralDark/docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/watchdog.sh
- /root/CentralDark/scripts/memory-linker/inbox-sentinel-cron.sh

All three:
EXISTS=NO

Therefore:
CRON_PATH_DRIFT_CONFIRMED=true.

## Log activity

Despite missing targets, log files have current mtimes:
- /tmp/hermes-watchdog.log => 2026-09-20 05:35
- /var/log/memory-linker-inbox-sentinel.log => 2026-09-20 05:30
- /var/log/casa-bridge-monitor.log => 2026-09-20 05:36

This strongly indicates recurring cron attempts; exact error text still requires tail proof.

## Council output path resolved

atualizar-conselho-vivo.mjs explicitly writes:
apps/modulos/status/conselho-vivo.json

Live file exists:
mtime=2026-09-20 05:35:01
bytes=4232

Therefore:
PREVIOUS_REPO_PATH_ASSUMPTION_INVALID=true.
COUNSEL_LIVE_OUTPUT_PRESENT=true.

## Current council split

Legacy daily Arsenal hermes.sh:
- repeated "Council falhou" from Aug 31 through Sep 19
- latest observed failure Sep 19 15:31

Current live council status generator:
- runs every 5 minutes
- reports 8 debates + 8 evolutions
- output file current

Cartografo:
- runs every 30 minutes
- creates drift debates when needed
- latest notifier state observed: credentials absent, send skipped

## Verdict

LEGACY_DAILY_COUNCIL=FAIL
CURRENT_COUNSEL_STATUS_GENERATOR=PASS
GROUP_EVOLUTION_TRIGGER=PASS_RECENT
TELEGRAM_DELIVERY=BLOCKED_CREDENTIALS_ABSENT
CRON_PATH_DRIFT_3_TARGETS=CONFIRMED
GLOBAL_FIXED_POINT=false

## NEXT_CURSOR

Tail exact cron errors, then search existing replacement/renamed owners before creating any script.
