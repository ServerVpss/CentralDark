# 👑🪬 REVIEW — Bridge monitor not equivalent + Memory regression

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Correction: Casa bridge monitor

Historical successful log lines from /var/log/casa-bridge-monitor.log show the old monitor checked:
- Tailscale direct pong to Casa SEGREDO;
- MCP healthy;
- GitHub reachable;
- Casa active/direct in mesh;
- MCP restart count.

Current systemd Desktop Commander watchdogs prove bridge-process persistence per profile, but do NOT by themselves prove the full cross-surface monitoring set above.

Therefore previous claim:
LEGACY_BRIDGE_CRON_FUNCTIONALLY_REDUNDANT=true

is RETRACTED.

Correct state:
OLD_CASA_BRIDGE_MONITOR_FUNCTION=KNOWN
CURRENT_EQUIVALENT_OWNER=UNKNOWN
DO_NOT_DELETE_CRON_UNTIL_EQUIVALENT_OWNER_PROVEN=true

## Memory-Linker

Historical log before missing-path failures contains repeated successful executions:

ok=true
count=0
report=/root/CentralDark/logs/memory-linker/inbox-sentinel-latest.json

PR #1510:
merged=true
merge_commit=13364d482f79aa4fa24ae081c96c2374fdff7f96

It introduced:
- scripts/memory-linker/inbox-sentinel-cron.sh
- scripts/memory-linker/inbox-sentinel.mjs
- inbox-sentinel tests
- scripts/memory-linker/inbox/*

Current main does not contain these files and the merge commit is not an ancestor of current main.

Verdict:
MEMORY_INBOX_SENTINEL_WAS_REAL_AND_WORKING=true
CURRENT_MAIN_CAPABILITY_MISSING=true
RUNTIME_CRON_STILL_EXPECTS_CAPABILITY=true
CAPABILITY_REGRESSION_OR_HISTORY_REWRITE_EFFECT=true

Do not delete the memory cron as redundant.

## Hermes

/tmp/hermes-watchdog.log has no non-missing historical output in the inspected set.
Current CentralDark-HermesThinker is an auxiliary thinker, not the HERMES-CORE orchestrator.
HERMES-CORE orchestrator current runtime not proven.

Verdict:
LEGACY_HERMES_CRON_FUNCTION=UNKNOWN
CURRENT_HERMES_CORE_ORCHESTRATOR_ALIVE=NOT_PROVEN
DO_NOT_DELETE_OR_RECREATE_BY_FILENAME_YET=true

## NEXT_CURSOR

1. find current owner equivalent for old Casa bridge multi-sensor monitor;
2. prove HERMES-CORE orchestrator runtime/supervisor;
3. restore Memory Inbox capability through a clean owner/writer path, not the huge conflicted #1545.
