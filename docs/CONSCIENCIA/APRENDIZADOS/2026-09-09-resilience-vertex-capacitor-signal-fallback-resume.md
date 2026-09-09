---
title: "Resilience Vertex — continuidade causal"
status: KNOWLEDGE_ONLY
date: 2026-09-09
updated: 2026-09-09T00:00:00-03:00
tags: [resilience-vertex, continuidade, fallback, handoff, centraldark]
category: CONSCIENCIA-APRENDIZADOS
sensitivity: INTERNAL
source: "handoff interno do PR-mãe sobre continuidade causal"
source_class: INTERNAL
source_rule: "REALITY_IS_JUDGE; UNKNOWN_IS_NOT_PASS; REUSE_BEFORE_CREATE"
owner: "docs/CONSCIENCIA/APRENDIZADOS/"
---
# 🧿 RESILIENCE VERTEX · CONTINUIDADE CAUSAL

Refs #1444

```text
MISSION_ID=CENTRALDARK_RESILIENCE_VERTEX_20260909
PR_MAE=#1444
ROLE=ARCHITECTURE_CRYSTAL_AND_EXECUTION_HANDOFF
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
NO_V2_V3_PARALLEL_SYSTEMS=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
```

## 👑 Intenção

Absorver no corpo existente da CentralDark a capacidade de **preservar estado, receber sinais de retorno, escolher fallback deterministicamente e retomar exatamente do `NEXT_CURSOR`**, com logs categorizados e receipts causais, sem criar outro cérebro, outro router, outro event bus, outro workflow equivalente ou outro owner.

```text
⚡ CAPACITOR_DE_ESTADO
+ 📡 RECEPTOR_DE_SINAL
+ 🧮 FALLBACK_DETERMINISTICO
+ 🔄 RESUME_FROM_CURSOR
+ 🧾 LOG/RECEIPT ESTRUTURADO
= CONTINUIDADE CAUSAL VERIFICÁVEL
```

## 🧠 Arquitetura

```text
                               👑 SEGREDO/CHEFE
                                      │
                                   INTENÇÃO
                                      │
                                      ▼
                              🧿 CENTRALDARK VERTEX
                                      │
      ┌───────────────────────────────┼───────────────────────────────┐
      ▼                               ▼                               ▼
   🏠 CASA                         ☁️ VPS                         🧬 GITHUB
      │                               │                               │
      ├─ 🖥 APP                       ├─ MCP/Router                    ├─ main/PR
      ├─ 🎙 VOZ                      ├─ PM2/Docker                    ├─ CI
      ├─ 👁 Screenpipe               ├─ Caddy                         └─ receipts
      └─ 🖐 Remote MCP               └─ heartbeat
      │                               │                               │
      └───────────────────────┬───────┴───────────────────────────────┘
                              ▼
                       📡 SIGNAL RECEIVER
                              │
                 validate origin + TTL + cause
                              │
                              ▼
                       ⚡ STATE CAPACITOR
                  mission + cause + last_good
                       + next_cursor + lock
                              │
                              ▼
                     🧮 DETERMINISTIC POLICY
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        🔄 RESUME         🔀 FALLBACK        ⏸ HOLD
            │                 │                 │
            └─────────────────┴─────────────────┘
                              ▼
                         🧾 RECEIPT
                              │
                              ▼
                        ⚖️ REALITY JUDGE
```

`VERTEX` é ponto de convergência de eventos e retomada, **não um novo cérebro**.

## 🧭 Owners existentes a estender

```text
Trigger Fabric
  ↓ contrato/policy/eventos
Fixed Point Fabric
  ↓ heartbeat/ledger/contraprova/receipt
HERMES-CORE
  ↓ execução/fallback/continuation
Memory API / handoff
  ↓ LAST_GOOD_STATE + NEXT_CURSOR
screenpipe-live-observer
  ↓ sensor read-only
Remote MCP
  ↓ presença/ping/transporte autorizado
GitHub
  ↓ HEAD/CI/PR/receipts
```

Regra dura:

```text
OWNER_EXISTE
→ EXTEND_EXISTING_OWNER
→ NÃO CRIAR OWNER PARALELO
```

## 🧾 Contrato de logs

Forma humana:

```text
[ÍCONE CATEGORIA][OBJETO][ESTADO] mensagem
```

Exemplos:

```text
[⚡ CAPACITOR][mission:voice_app][SAVED] cursor=await_voice_receipt cause=PROVIDER_AUTH_401
[📡 RECEPTOR][source:remote_mcp][SIGNAL_OK] device=SEGREDO signal=PONG age_ms=41
[🧮 FALLBACK][provider:moa][REJECT] reason=AUTH_401 retry_same_credential=false
[🧮 FALLBACK][provider:opencode_free][SELECT] model=deepseek-v4-flash-free
[🔄 RESUME][cursor:continue_provider_recovery][BLOCKED] reason=USER_SUSPENDED
[🎙 VOZ][event:abc123][CAPTURED] correlation_id=abc123
[🧭 ROUTER][event:abc123][ROUTED] correlation_id=abc123
[🧾 RECEIPT][event:abc123][PASS] correlation_id=abc123
[⚖ REALIDADE][scope:voice_e2e][PROVEN] samples=2
```

Não usar `[OBJECT OBJECT]` ambíguo. O segundo bloco deve ser chaveado, por exemplo `[source:vps]`, `[mission:voice_app]`, `[provider:moa]`.

Categorias:

```text
[👑 AUTHORITY] [🧠 INTENT] [👁 SENSOR] [📡 RECEPTOR]
[⚡ CAPACITOR] [🧮 FALLBACK] [🔄 RESUME] [🧭 ROUTER]
[🖐 REMOTE] [🏠 CASA] [☁ VPS] [🧬 GITHUB]
[🖥 APP] [🎙 VOZ] [🔒 SECURITY] [🧾 RECEIPT] [⚖ REALIDADE]
```

Persistência: JSONL, um objeto por linha, com pelo menos:

```text
ts category icon object_type object_id state
mission_id correlation_id source cause next_cursor
evidence sensitivity
```

Segredos entram redigidos antes da persistência.

## ⚡ Máquina de estado

```text
RUNNING
  ├─ USER_SUSPEND       → SUSPENDED_BY_USER
  ├─ PROVIDER_AUTH_401  → DEGRADED_PROVIDER
  ├─ REMOTE_OFFLINE     → WAIT_SIGNAL
  └─ FAILURE_UNKNOWN    → INVESTIGATE

RESUME_PENDING
  → validate mission
  → validate cursor
  → validate authority lock
  → validate evidence freshness
  → validate writer lease
  → RESUME or HOLD
```

Capacitor mínimo:

```text
mission_id
state
pause_class
pause_cause
last_good_state
next_cursor
input_fingerprint
owner
writer_scope
human_lock
provider_primary
provider_active
fallback_chain
observed_at
updated_at
correlation_id
```

## 🔒 Regras críticas

```text
USER_SUSPENDED → NUNCA AUTO-RESUME
AUTH_401 → NÃO REPETIR MESMA CREDENCIAL
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
PONG != APP_READY
BROWSER_BRIDGE_CONNECTED != SCREENPIPE_E2E
WEBHOOK_PROCESS_PRESENT != EXPECTED_PORT_MATCH
DOCUMENTED != EXECUTED
STALE_SIGNAL != PASS
RESUME → SEMPRE GERA RECEIPT
```

## 🧮 Fallback determinístico

```text
PROVIDER_AUTH_401
→ retry_same=false
→ SELECT_AUTHORIZED_PROVIDER_FALLBACK

PROVIDER_TIMEOUT
→ retry limitado
→ backoff
→ fallback compatível autorizado

MODEL_NOT_FOUND
→ próximo modelo compatível autorizado

USER_SUSPENDED
→ HOLD_FOR_USER_RESUME

REMOTE_OFFLINE
→ WAIT_FOR_FRESH_SIGNAL

CURSOR_MISMATCH
→ REHYDRATE_AND_RECONCILE

SECRET_EXPOSED
→ REDACT + SECURITY_BLOCK
```

Fallback nunca atravessa fronteira de autoridade.

## 🎯 Integração sem arquitetura paralela

```text
A. Trigger Fabric
   → adicionar pause_class, pause_cause, signal_type, signal_ttl,
     resume_policy, fallback_policy, correlation_id

B. Fixed Point Fabric
   → ledger/receipt do mesmo envelope
   → hash chain + redaction existentes

C. HERMES-CORE
   EVENT/FAILURE
   → FAILURE_SIGNATURE
   → SEARCH_EXISTING_CRYSTAL
   → fallback policy
   → LAST_GOOD_STATE
   → NEXT_CURSOR
   → authority gate
   → resume
   → receipt

D. Superfícies
   👁 Screenpipe → SENSOR
   🖐 Remote MCP → REMOTE
   ☁ VPS heartbeat → VPS
   🧬 GitHub → GITHUB
   🖥 APP → APP
   🎙 VOZ → VOICE
```

## 🧪 Denominador mínimo de prova

```text
T1 AUTH_401 seleciona fallback autorizado
T2 USER_SUSPENDED bloqueia resume mesmo com PONG
T3 PONG fresco reabre WAIT_SIGNAL sem declarar APP_READY
T4 STALE/UNKNOWN nunca libera resume
T5 correlation_id sobrevive VOZ→INTENT→ROUTER→RECEIPT
T6 segredo é redigido antes de persistir
T7 resume preserva NEXT_CURSOR
T8 receipt final liga causa→decisão→ação→estado
```

## 🧿 Estado desta cristalização

```text
ARCHITECTURE_CRYSTAL=COMMITTED_TO_PR_MAE_BRANCH
RUNTIME_IMPLEMENTATION=NOT_PROVEN
DEPLOY=NOT_REQUESTED_BY_THIS_CRYSTAL
UNKNOWN != PASS
NEXT_CURSOR=EXECUTE_EXISTING_OWNERS_WITH_PROMPT_SIBLING
```
