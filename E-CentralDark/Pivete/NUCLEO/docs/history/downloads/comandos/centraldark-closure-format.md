# CentralDark Operational Closure Format

Extracted from `PROMPT-MESTRE-CENTRALDARK-ISSUES-AJUSTE-FINO.txt` (950 lines).

## Operational Cycle

```
OBSERVAR -> CLASSIFICAR -> DEBATER -> AGIR MINIMO -> REVISAR -> PROVAR -> REGISTRAR -> AVANCAR
```

## Closure Format (per operational action)

```
FEITO: <what was done>
EVIDENCIA: <proof it worked>
PENDENCIA: <what remains open>
PROXIMO PASSO: <next concrete action, if any>
BOOT: <canonical state reference>
FIO: <mission thread status>
```

## Mission Terminal States

A mission ends ONLY in one of:

- `DEPLOYED_TO_MAIN`
- `BLOCKED`

## Stagnation Rule

- 3 cycles without progress = PER TASK, not a global limit
- Progress = issue classified, duplicate reduced, new causal diagnosis, SHA/PR/check changed, correction tested, process/listener/health changed, gold promoted, junk removed, blocker advanced, new evidence
- Zero `CICLOS_SEM_PROGRESSO` when real progress occurs
- After 3 stagnant cycles on same task: stop that line, preserve evidence, try one different safe route, if none -> BLOCKED

## Issue Classifications

1. `RESOLVED_LIVE` - condition fixed, current proof confirms
2. `DUPLICATE` - another canonical issue represents same condition
3. `OBSOLETE_ARCHITECTURE` - belongs to retired component/workflow/port/service
4. `FALSE_POSITIVE` - alert from incorrect rule, transient condition, or expected endpoint
5. `ACTIONABLE` - problem exists and needs correction
6. `GOLD_TO_PRESERVE` - contains valid decision/architecture/learning to preserve
7. `UNKNOWN` - insufficient evidence (never closeable)

## VPS Artifact Classifications

- `CANONICAL` - corresponds to main, used by runtime, keep
- `GOLD` - not in main, provable value, promote via PR
- `REPRODUCIBLE_JUNK` - build/cache/worktree, not used, removable
- `ORPHANED` - not used by process, not runtime, no exclusive value, removable after review
- `ACTIVE_RUNTIME` - in use, do not remove before migration
- `UNKNOWN` - do not remove

## Shell Fail-Closed Policy

- `set -Eeuo pipefail` always
- `trap 'registrar_erro_sanitizado "$LINENO" "$?"' ERR`
- `set -x` prohibited by default
- Never mask failures with `|| true`, `exit 0`, `continue-on-error`
- Sanitized error logging only (no payload, secrets, headers, auth URLs)

## Port 9300 Rule

- Port 9300 = legacy retired webhook
- Healthy state: `PORT_9300_NO_LISTENER`
- If listener appears: identify PID, process, user, cwd, command, parent tree, PM2/systemd/container link
- Never kill unknown process
- Only kill if proven legacy webhook, then confirm it stays dead
- Never start new service on 9300

## Key Invariants

- GitHub is source of truth; VPS is execution environment
- No force-push, no destructive history rewrite, no false green, no secret exposure
- No blind database destruction, no unclassified deletion
- No merge of different SHA than audited
- No push of dirty local main
- Reconcile before create (REUSE_BEFORE_CREATE)
- Single writer per scope
- Minimum effective change
