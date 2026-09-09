# 🚀 PROMPT DE EXECUÇÃO · RESILIENCE VERTEX

Refs #1444

Use este bloco **no próprio PR/branch #1444 como handoff executável**. Ele não autoriza criar arquitetura paralela nem transformar o PR-mãe em writer global.

```text
!CENTRALDARK

MISSION=
INTEGRATE_RESILIENCE_VERTEX_IN_EXISTING_CENTRALDARK_OWNERS

AUTHORITY=SEGREDO/CHEFE
PR_MAE=1444
MODE=MEASURE_RECONCILE_IMPLEMENT_TEST_COUNTERPROVE

REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_OWNER_PER_CAPABILITY=true
ONE_WRITER_PER_SCOPE=true
NO_V2_V3_PARALLEL_SYSTEMS=true
NO_NEW_EQUIVALENT_WORKFLOW=true
NO_BLIND_OVERWRITE=true
NO_SECRET_IN_LOG_OR_RECEIPT=true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 DESTINATION LOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Absorver no corpo existente da CentralDark, ponta a ponta:

⚡ CAPACITOR_DE_ESTADO
+ 📡 RECEPTOR_DE_SINAL
+ 🧮 FALLBACK_DETERMINISTICO
+ 🔄 RESUME_FROM_CURSOR
+ 🧾 LOG/RECEIPT_ESTRUTURADO

Objetivo final:

INTERRUPÇÃO
→ CAUSA CLASSIFICADA
→ ESTADO PRESERVADO
→ SINAL AUTORIZADO
→ FALLBACK DETERMINÍSTICO QUANDO APLICÁVEL
→ RETOMADA EXATA DO NEXT_CURSOR
→ RECEIPT CAUSAL
→ REALITY JUDGE

Não reduzir o destino para documentação.
Não criar Vertex V2, segundo cérebro, segundo router, segundo event bus,
segundo ledger, novo workflow equivalente ou novo owner se o owner atual existe.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 OWNER DISCOVERY OBRIGATÓRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antes de escrever qualquer código:

1. medir main/HEAD/branch/PR e estado vivo aplicável;
2. carregar os contratos canônicos da Casa;
3. localizar os owners reais já existentes para:
   - Trigger Fabric;
   - Fixed Point Fabric;
   - HERMES-CORE;
   - Memory/Handoff/NEXT_CURSOR;
   - screenpipe-live-observer;
   - Remote MCP;
   - GitHub event/receipt;
   - APP health/process;
   - VOZ/intent binding;
4. mapear consumers reais;
5. deduplicar qualquer capacidade equivalente;
6. só então adquirir Writer Lease por escopo.

Se owner existir:
→ PATCH EXISTING OWNER.

Se owner não for comprovável:
→ OWNER=UNKNOWN
→ procurar antes de criar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ CAPACITOR DE ESTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Persistir o mínimo suficiente para continuidade:

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

Regras:

MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
CHECKPOINT != CURRENT_TRUTH
LAST_GOOD_STATE = BASELINE
NEXT_CURSOR = RETOMADA
USER_SUSPENDED = HUMAN_LOCK

USER_SUSPENDED jamais autoriza auto-resume.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 RECEPTOR DE SINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Normalizar sinais de:

🏠 CASA
☁ VPS
🧬 GITHUB
🖐 REMOTE_MCP
👁 SCREENPIPE
🖥 APP
🎙 VOZ
🔌 MCP/HUB/API

Todo sinal deve carregar:

source
signal_type
observed_at
ttl/freshness
mission_id
correlation_id
evidence_ref

Antes de liberar qualquer ação:

SIGNAL
→ validar origem
→ validar frescor
→ validar missão
→ validar cursor
→ validar autoridade
→ validar writer lease
→ então policy

PONG != APP_READY
BROWSER_BRIDGE_CONNECTED != SCREENPIPE_E2E
PROCESS_PRESENT != HEALTHY
WEBHOOK_PRESENT != EXPECTED_PORT_MATCH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧮 FALLBACK DETERMINÍSTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Criar/estender policy mecânica por FAILURE_SIGNATURE.

Mínimo:

PROVIDER_AUTH_401
→ retry_same_credential=false
→ selecionar somente provider/modelo já autorizado e compatível

PROVIDER_TIMEOUT
→ retry limitado + backoff
→ fallback autorizado

MODEL_NOT_FOUND
→ próximo modelo compatível autorizado

RATE_LIMIT
→ backoff/fallback autorizado

USER_SUSPENDED
→ HOLD
→ somente USER_RESUME

REMOTE_OFFLINE
→ WAIT_SIGNAL
→ rota alternativa read-only pode medir,
  mas não declarar a superfície offline como PASS

CURSOR_MISMATCH
→ REHYDRATE
→ RECONCILE
→ HOLD até consistência

SECRET_EXPOSED
→ REDACT
→ SECURITY_RECEIPT
→ nunca copiar valor bruto

Fallback não pode atravessar fronteira de autoridade.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 RESUME_FROM_CURSOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resume somente após:

VALID_MISSION
AND VALID_CURSOR
AND AUTHORITY_OK
AND FRESH_EVIDENCE
AND WRITER_LEASE_OK
AND POLICY_ALLOWS

Retomada deve:

1. carregar LAST_GOOD_STATE;
2. comparar INPUT_DIFF;
3. reutilizar prova imutável ainda válida;
4. remedir somente arestas temporais afetadas;
5. continuar exatamente do NEXT_CURSOR;
6. emitir receipt da retomada.

NO_NEW_INFORMATION
→ NO_CHANGE
→ NEXT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧾 LOG CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Forma humana obrigatória:

[ÍCONE CATEGORIA][object_type:object_id][ESTADO] mensagem

Exemplos:

[⚡ CAPACITOR][mission:voice_app][SAVED] cursor=await_voice_receipt
[📡 RECEPTOR][source:remote_mcp][SIGNAL_OK] signal=PONG age_ms=41
[🧮 FALLBACK][provider:moa][REJECT] reason=AUTH_401 retry_same=false
[🔄 RESUME][mission:hermes_continuity][HOLD] reason=USER_SUSPENDED
[🧾 RECEIPT][event:abc123][PASS] correlation_id=abc123
[⚖ REALIDADE][scope:voice_e2e][PROVEN] samples=2

Categorias mínimas:

👑 AUTHORITY
🧠 INTENT
👁 SENSOR
📡 RECEPTOR
⚡ CAPACITOR
🧮 FALLBACK
🔄 RESUME
🧭 ROUTER
🖐 REMOTE
🏠 CASA
☁ VPS
🧬 GITHUB
🖥 APP
🎙 VOZ
🔒 SECURITY
🧾 RECEIPT
⚖ REALIDADE

Persistência máquina:
→ JSONL estruturado
→ nunca parsing dependente do emoji
→ emoji é cue humana, não autoridade
→ redaction ANTES da persistência

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTES OBRIGATÓRIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

T1  AUTH_401 escolhe fallback autorizado.
T2  AUTH_401 não repete a mesma credencial.
T3  USER_SUSPENDED impede auto-resume mesmo com PONG.
T4  USER_RESUME pode liberar reavaliação.
T5  sinal STALE nunca libera resume.
T6  UNKNOWN nunca vira PASS.
T7  PONG fresco não vira APP_READY sozinho.
T8  correlation_id atravessa VOZ→INTENT→ROUTER→ACTION→RECEIPT.
T9  segredo detectado é redigido antes do log persistente.
T10 NEXT_CURSOR sobrevive model/session/provider switch.
T11 resume gera receipt causal.
T12 duplicate signal sem informação nova não duplica ação.

Adicionar teste negativo para cada regra que já feriu a Casa nesta sessão.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 CASOS DESTA SESSÃO QUE DEVEM VIRAR FIXTURES/TESTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CASE_HERMES_USER_SUSPENDED:
"Hermes Agent has been suspended / Stopped hermes"
→ classificar como USER_SUSPENDED quando a origem for ação do CHEFE
→ NÃO como crash

CASE_PROVIDER_AUTH:
MOA/default → HTTP 401 Missing Authentication header
→ PROVIDER_AUTH_401
→ no same-credential retry

CASE_PROVIDER_FALLBACK:
OpenCode Free / deepseek-v4-flash-free
→ candidato de fallback somente se já autorizado/disponível
→ MODEL_SWITCH != RESET

CASE_REMOTE_MCP:
SEGREDO online + PONG
→ REMOTE_REACHABLE=PROVED
→ APP_EXE continua separado
→ VOICE_E2E continua separado

CASE_WEBHOOK_PORT_DRIFT:
processo webhook observado em :9000
contrato/painel espera :9003
→ PROCESS_PRESENT=PASS
→ EXPECTED_PORT_MATCH=FAIL
→ CONFIG_BINDING=UNKNOWN até reconciliar

CASE_SCREENPIPE:
BROWSER_BRIDGE_CONNECTED
→ sensor bridge provado
→ SCREENPIPE_CAPTURE_E2E não inferido

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧿 MUTATION DISCIPLINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION_PER_SCOPE=true

Cada escopo:
→ 1 Writer ativo
→ outros braços read-only counterproof

Não fazer:
- force push;
- reset destrutivo;
- restart amplo sem causa/autorização aplicável;
- secret exposure;
- merge só porque escreveu código;
- deploy só porque teste local passou.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ REALITY JUDGE / CRITÉRIO DE SAÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antes de declarar concluído:

TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD
quando Git se aplicar.

Verificar:
- testes positivos;
- testes negativos;
- integração com consumers reais;
- contraprova;
- ausência de arquitetura paralela;
- logs estruturados;
- redaction;
- receipt;
- NEXT_CURSOR;
- UNKNOWN residual explícito.

Não declarar FIXED_POINT global só porque o pacote/PR passou.
Cada superfície mantém seu próprio denominador de prova.

RETURN_ONLY_IF:
DESTINATION_PROVED
OR HUMAN_FRONTIER_PROVED
OR EXACT_HARD_BLOCKER_PROVED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 OUTPUT NO PR #1444
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ao terminar cada delta material, registrar no PR-mãe:

[⚡ CAPACITOR] estado implementado/testado
[📡 RECEPTOR] sinais integrados/testados
[🧮 FALLBACK] matriz implementada/testada
[🔄 RESUME] cursor persistido/reutilizado
[🧾 RECEIPT] SHA + testes + contraprova + residual

Campos obrigatórios do receipt:

OBSERVED_AT
BASE_MAIN_SHA
PR_HEAD_SHA
OWNER
WRITER_SCOPE
FILES_CHANGED
TESTS
COUNTERPROOF
RUNTIME_PROOF
UNKNOWN
VERDICT
NEXT_CURSOR

Se houver delta reutilizável global:
→ promover ao owner canônico correspondente.
Não deixar aprendizado dependente apenas do comentário do PR.

NEXT_CURSOR=
OWNER_DISCOVERY
→ MINIMAL_IMPLEMENTATION
→ TESTS
→ COUNTERPROOF
→ SAME_HEAD_CI
→ REALITY_JUDGE
→ RECEIPT_TO_PR_1444
```

## Critério do handoff

Este prompt é deliberadamente **owner-first**. Ele deve ser executado por um motor com acesso ao repo/runtime aplicável, mas o motor não vira owner nem Judge.

```text
PROMPT_READY=true
AUTO_CREATE_PARALLEL_ARCHITECTURE=false
MUTATION_REQUIRES_OWNER_AND_WRITER_SCOPE=true
UNKNOWN != PASS
```
