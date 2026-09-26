# Resource Breathing Governor (CentralDark)

Condensed from CHEFE 30/08 mandamento. Apply when running multi-window / multi-agent
cadeia (`#ACORDAR !CALIBRAR` + "faz a cadeia toda").

## Same comandão to all windows
Every branch gets the SAME packet:
```
MISSION_ID
DESTINATION = MAIN_PROVEN_FIXED_POINT
CURRENT_STATE
NEXT_CURSOR
DECISIONS_PROVEN
UNKNOWN
PENDING
ONE_WRITER_PER_SCOPE
REALITY = JUDGE
```
Turns "5 windows = 5 missions" into: UMA intenção → N braços → RENDEZVOUS → DELTA →
WRITER ÚNICO → MAIN.

## Governor (CPU leve primeiro, memória estável, cache com prova)
1. MEASURE before spawn: CPU, RAM, IO, process count, active agents, active writers.
   If no material need → NÃO SPAWN. LESS_IS_MORE.
2. K braços (not N): K = smallest parallelism that yields next discriminative delta.
3. CPU states: <70% normal; >70% no new agents; >85% pause background; >95% checkpoint
   + preserve Writer. Pico curto != HOT (use temporal average).
4. Memory: classify HOT/WARM/COLD. Under pressure: block new procs → checkpoint idle →
   close redundant context → release own temp. NEVER EmptyWorkingSet global / purge /
   kill useful proc / wipe Screenpipe / cache / creds.
5. Cache: only STALE_CACHE proven (owner+age+rebuild_cost) is candidate. UNKNOWN = keep.
6. Writer priority: preserve 1 Writer → Reality Judge → checkpoint → essential services.
7. FORBIDDEN: aggressive cleaner, RAM optimizer, taskkill by name, 1s loop, N agents
   reading same file, N models same health check, continuous OCR without demand.
8. Auto-breath each phase: CHECKPOINT → flush own → receipt → release handles/temp →
   measure again. Never "cleanup done" without before/after.

## Cadeia reconcile recipe (proven 30/08)
Goal: voice on iPhone via Casa. Steps:
1. Measure ports (PowerShell, git-bash netstat doesn't match PID on this host):
   `Get-NetTCPConnection -LocalPort <p> -State Listen | Select OwningProcess`
2. WebUI 8788 (`C:\Users\danda\hermes-webui`, start via `pwsh start.ps1`, bind 0.0.0.0)
   → free tier by pointing hermes_cli config.yaml to `centraldark-router` → 8099.
3. Omni Router 8099 (`%LOCALAPPDATA%\Temp\launch_omni_router.py` →
   `e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`).
   Serves `nous/tencent/hy3:free` (no NOUS_API_KEY needed) + `auto` + `claude-code`.
4. Tailscale Serve: `tailscale serve --bg 8788` → `https://segredo.tail6d7aa4.ts.net/`
   (iOS needs Tailscale CA installed to trust cert; fallback HTTP `http://100.125.83.74:8788`).
5. Gateway: `hermes.exe dashboard --port 9119 --host 127.0.0.1 --no-open` (NOT 8787;
   port drift — see SKILL.md GATEWAY PORT DRIFT).
6. Screenpipe 3030: usually already alive; verify `/health`.

State measured 30/08: CPU 41% / RAM 75% → K=2 braços (router + dashboard); did NOT spawn
8645/8648 (redundant for voice goal). LESS_IS_MORE honored.

## Resource fixed point
NO_DUPLICATE_WORK / NO_BUSY_LOOP / NO_ORPHAN_BACKGROUND / NO_UNNECESSARY_AGENT /
CACHE_CLASSIFIED / CPU_STABLE / MEMORY_STABLE / IO_STABLE / MISSION_CONTINUITY = true.
Does NOT replace mission fixed point — mission still needs PROVE → MAIN → REMEASURE →
COUNTERPROVE.
