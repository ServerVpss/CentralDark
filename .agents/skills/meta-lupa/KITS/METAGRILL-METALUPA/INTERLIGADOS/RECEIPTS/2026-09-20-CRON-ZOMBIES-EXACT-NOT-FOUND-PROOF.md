# 👑🪬 Three zombie cron jobs — exact error proof

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Exact current errors

casa bridge:
`/bin/sh: 1: /root/CentralDark/scripts/remote-bridge/monitor-casa-bridge.sh: not found`

Hermes watchdog:
`/bin/sh: 1: /root/CentralDark/docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/watchdog.sh: not found`

Memory inbox sentinel:
`bash: scripts/memory-linker/inbox-sentinel-cron.sh: No such file or directory`

Errors repeat in current log tails.

## Classification

CRON_JOB_ZOMBIE_COUNT=3
TARGET_PATH_MISSING=true
REPEATED_FAILURE=true
RUNTIME_DEBT=true

## Constraint

Do NOT recreate scripts by filename alone.

REUSE_BEFORE_CREATE requires proving whether each responsibility is already covered by a current owner.

## NEXT_CURSOR

Map:
1. casa bridge monitor → systemd/watchdog coverage;
2. Hermes watchdog → HERMES-CORE/Docker/internal watchdog coverage;
3. memory inbox sentinel → current Memory-Linker agents/sentinel coverage.

Then remove only redundant stale cron entries or restore only a genuinely missing capability.
