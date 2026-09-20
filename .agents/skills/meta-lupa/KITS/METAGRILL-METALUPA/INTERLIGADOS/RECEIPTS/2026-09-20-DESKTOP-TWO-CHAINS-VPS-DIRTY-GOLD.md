# 👑🪬 Desktop two chains + VPS dirty gold

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Desktop Commander CURRENT

Probe corrigido:
TOKEN_PROCESS_COUNT=3
ROOT_CHAIN_COUNT=2

Chain A:
ROOT PID=52576
version=0.2.48
start=2026-09-19 09:34:45
active descendant node PID=53572
Established TLS sockets observed.

Chain B:
ROOT PID=51780
version=latest
start=2026-09-19 07:09:17
active descendants node PID=51772/39156
Established TLS sockets observed.

MULTIPLE_REMOTE_CHAINS_ACTIVE=true.
CANONICAL_PROFILE_OWNER=UNKNOWN.
SAFE_TO_TERMINATE_CHAIN=false.

## VPS tracked dirty — delta useful

apps/modulos/mcp/src/health-deep.js:
- adds checkTelegramOwner;
- observes canonical process CentralDark-HubBot;
- checks configured secret presence without copying value into MCP;
- dependency health binds owner/process/token-present state.

apps/modulos/mcp/src/hub-mission-consumer.js:
- supports HUB_SUPABASE_PROJECT_REF;
- validates explicit Supabase URL project against configured ref;
- fails with HUB_MISSION_SUPABASE_URL_INVALID / PROJECT_MISMATCH;
- adds PostgREST profile headers.

LEIA-ME-IA.md:
- GITHUB_VPS_PARALLEL_REMEASURE=true
- GITHUB_AND_VPS_ARE_INDEPENDENT_SENSORS=true
- ONE_SIDE_BLOCKED_DOES_NOT_BLOCK_OTHER_READS=true
- PARALLEL_READS_RENDEZVOUS_BEFORE_MUTATION=true
- CROSS_SURFACE_DRIFT_MUST_BE_EXPLICIT=true

docs/CONSCIENCIA/APRENDIZADOS.md:
contains recent Grupo Evolução learning records for Gemini Flash, Claude Sonnet and Groq Llama on 2026-09-19/20.

## VPS untracked useful candidates

docs/CONSCIENCIA/ARSENAL/hermes-vivo/executor.mjs:
compatibility adapter; canonical executor remains HERMES-CORE/agents/Executor.

scripts/notificar-tg.sh:
local Telegram notifier using env vars; not canonicalized yet.

Other receipts/state/error artifacts require classification separately.

## Interpretation

LEGACY_ARSENAL_PORTS_8083_8090_DOWN=true.
MULTI_AI_EVOLUTION_ACTIVITY_PRESENT_IN_VPS_LEARNING=true.

Therefore:
ARSENAL_LEGACY_RUNTIME_DOWN != COUNCIL_CAPABILITY_ABSENT.

Need discover current Group Evolution/HubBot owner before deciding recovery path.

## Learned probe defect

Previous PowerShell $pid collision was corrected using $currentPid.
AUTOMATIC_VARIABLE_COLLISION_GUARD_REQUIRED=true.

## NEXT_CURSOR

- identify parent launcher/session for both Desktop Commander roots;
- measure CentralDark-HubBot / grupo-evolucao runtime;
- preserve VPS dirty source deltas in canonical branch before VPS sync.
