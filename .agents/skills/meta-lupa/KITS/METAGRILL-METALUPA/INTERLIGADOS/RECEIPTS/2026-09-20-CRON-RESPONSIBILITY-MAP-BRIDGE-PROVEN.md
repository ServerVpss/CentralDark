# 👑🪬 Cron responsibility map — Bridge proven, Hermes/Memory pending

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Bridge

Current owner runtime:
- /usr/local/sbin/centraldark-desktop-commander-watchdog.sh exists mode 755
- centraldark-desktop-commander-watchdog.timer active/waiting
- centraldark-desktop-commander-conta2-watchdog.timer active/waiting
- both timers last-triggered 2026-09-20 05:39:48 -03
- recent journals repeatedly show watchdog service Finished/Deactivated successfully for conta1 and conta2

Legacy cron:
- references missing /root/CentralDark/scripts/remote-bridge/monitor-casa-bridge.sh
- log repeatedly says not found

Verdict:
BRIDGE_CURRENT_WATCHDOG=PASS_CURRENT
LEGACY_BRIDGE_CRON_FUNCTIONALLY_REDUNDANT=true
LEGACY_BRIDGE_CRON_TARGET_MISSING=true

## Hermes

CentralDark-HermesThinker:
- running since 2026-09-11
- restart policy=unless-stopped
- restart count=0
- cmd=node src/index.mjs
- no Docker healthcheck

No HERMES-CORE orchestrator path/watchdog marker found inside that container by the first candidate-path probe.

Verdict:
HERMES_SUPERVISION_PARTIAL=true
HERMES_CORE_EQUIVALENCE_NOT_PROVEN=true
LEGACY_HERMES_CRON_REDUNDANT=UNKNOWN

## Memory-Linker

main scripts/memory-linker directory:
31 entries
zero filename matching inbox or sentinel.

Git commits for exact path scripts/memory-linker/inbox-sentinel-cron.sh:
none found.

Verdict:
CURRENT_INBOX_SENTINEL_OWNER=UNKNOWN
LEGACY_MEMORY_CRON_REDUNDANT=UNKNOWN
DO_NOT_DELETE_UNTIL_FUNCTION_INTENT_RECOVERED=true

## NEXT_CURSOR

Inspect HermesThinker source/runtime responsibility and recover origin/intent of Memory-Linker inbox cron.
