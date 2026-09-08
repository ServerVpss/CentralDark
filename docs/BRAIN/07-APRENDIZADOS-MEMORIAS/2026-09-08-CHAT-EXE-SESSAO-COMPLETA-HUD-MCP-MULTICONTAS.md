# 👑 !AUREULA · CENTRALDARK CHAT/.EXE · SESSÃO COMPLETA

Data: 2026-09-08

Refs #1444 #1463 #1458 #1454 #1447

```text
PR_MAE=#1444
DESTINO=CENTRALDARK_TERMINADA
SOURCE_SESSION=Chrome DevTools AI Assistance export + sessão viva do CHEFE
ONE_SYSTEM_ONLY=true
ONE_CORE=true
REUSE_BEFORE_CREATE=true
EXTEND_EXISTING_NOT_REPLACE=true
NO_V1_V2_V3_PARALLEL_SYSTEMS=true
NO_SECRET_IN_UI_LOG_OR_RECEIPT=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
```

## 1. Intenção cristalizada

O `CentralDark.exe` e o chat próprio devem concentrar, em uma superfície única, tudo que foi garimpado nesta sessão e tudo que já possui owner no repositório, sem criar cérebro, gateway, supervisor, memória ou painel paralelo só porque uma conversa externa sugeriu outra tecnologia.

A sessão exportada é `CAPABILITY_INTAKE + PROVENANCE`. O que já existe no repo deve ser reutilizado; o que ainda não existe entra como requisito/candidato até existir prova executável.

```text
SESSION_IDEA != IMPLEMENTED_CAPABILITY
SCREENSHOT != RUNTIME_PROOF
DOCUMENTED != EXECUTED
CURRENT > HISTORICAL
```

## 2. Topo obrigatório do agente

Quando o ciclo mestre estiver ativo, o agente operacional deve manter a auréola visível no topo:

```text
👑 !AUREULA · AGENTE=<IDENTIDADE> · CICLO=<CICLO> · ESTADO=<ESTADO> · PROVA=<CLASSE>
```

A camada humana pode usar crônica bíblico-baianesa; a máquina continua neutra e verificável.

```text
AUREULA != PROOF
BIBLE_REF != TECHNICAL_AUTHORITY
POESIA != ESTADO_REAL
```

## 3. Superfície única do chat/.exe

```text
CENTRALDARK.exe / CHAT
│
├── 👑 !AUREULA / identidade operacional
├── 🎙️ FRIDAY / voz e conversa
├── 🧠 JARVIS / intenção e orquestração
├── 🤖 PROVIDER + MODEL PICKER
├── 👥 MULTICONTAS AUTORIZADAS
├── 📊 LIMITES / QUOTA / USAGE
├── 🔌 MCP / CONNECTORS
├── 📚 SOURCES
├── 🧰 TOOL CALL LEDGER
├── 🎯 RESULTS
├── 🧿 QUEUE / CONCURRENCY
├── ⚙️ PROCESSOS / PM2 / WATCHDOG
├── 🧠 MEMÓRIA / BRAIN / OBSIDIAN
├── 🏠 CASA / REMOTE BRIDGE
├── 🖥️ VPS
├── 🐙 GITHUB / MAIN / PR / COMMIT / ISSUE
├── 🌐 SITE / DEPLOY / HEALTH
├── ⚖️ REALITY JUDGE
└── 🧾 RECEIPTS / NEXT_CURSOR
```

Não são painéis independentes. São projeções do mesmo core e do mesmo estado causal.

## 4. Multicontas: requisito explícito de duas contas

O CHEFE usa duas contas próprias/autorizadas e quer ambas visíveis/roteáveis no mesmo HUD, sem expor identidades ou credenciais no GitHub.

```text
MULTI_ACCOUNT_MINIMUM=2
ACCOUNT_DISPLAY=ALIAS_ONLY
RAW_EMAIL=false
RAW_TOKEN=false
RAW_COOKIE=false
RAW_REFRESH_TOKEN=false
```

Contrato por conta:

```text
ACCOUNT_ALIAS
→ provider
→ auth_state
→ models_visible
→ quota_observed
→ reset_observed
→ requests_remaining_when_known
→ health
→ last_error
→ route_eligible
```

Estados distintos:

```text
QUOTA_EXHAUSTED != AUTH_FAILED
AUTH_FAILED != PROVIDER_DOWN
PROVIDER_DOWN != MODEL_UNAVAILABLE
429 != 401
UNKNOWN != PASS
```

Fallback entre contas/provedores só pode ocorrer quando a política permitir e precisa aparecer no receipt pelo alias, nunca por segredo.

## 5. Model/provider routing e 429

A sessão propôs gateway, priority queue, retry/backoff, fallback, cache e balanceamento. O repo atual já possui owner material para roteamento multi-provider:

```text
apps/modulos/elite-gateway/scripts/centraldark_omni_router.py
public/central-dark-instinct-2/public/centraldark/router-capabilities.json
scripts/verify_centraldark_router_capabilities.py
```

A `main` também possui padrões reais de 429/retry em `supabase/functions/ai-proxy/index.ts` e `scripts/notion-sync/with-retry.mjs`.

Direção:

```text
CREATE_AI_GATEWAY_V2=false
EXTEND_EXISTING_OMNI_ROUTER=true
REUSE_EXISTING_RETRY_PATTERNS=true
```

Capacidades desejadas:

- limiter por provider/model/account alias;
- retry apenas em falha retryable;
- `Retry-After` quando fornecido;
- exponential backoff + jitter;
- priority/concurrency control;
- fallback auditável;
- cache/dedupe somente quando semanticamente seguro;
- quota/usage observável no HUD;
- fail-closed quando todas as rotas estiverem indisponíveis.

## 6. Connection Fabric + Sources + Tool Calls + Results

A lateral precisa responder quatro perguntas diferentes:

```text
SOURCE     = de onde veio?
CONNECTOR  = por onde acessou?
TOOL CALL  = o que foi chamado?
RESULT     = onde/como a saída foi materializada?
```

Contrato de conexão:

```text
INSTALLED
CONNECTED
AUTHORIZED
READ
WRITE
RESPONDING
LATENCY
LAST_CHECK
ERROR_CLASS
```

Contrato de tool call:

```text
CALL_INDEX
TOOL_NAME
CONNECTOR
READ|WRITE|EXEC
STARTED_AT
LATENCY
RESPONSE_PRESENT
USAGE_OBSERVED
STATUS
ERROR_CLASS
RECEIPT
```

Ausência de resposta nunca é verde:

```text
TOOL_RESPONSE_MISSING
TOOL_TIMEOUT
TOOL_FORBIDDEN
TOOL_AUTH_REQUIRED
TOOL_ERROR
```

## 7. PM2 / Supervisor / Watchdog: reutilizar o que já existe

A sessão sugeriu criar um novo Supervisor. O repo atual já possui infraestrutura real de PM2 e observação:

```text
apps/modulos/mcp/src/modes/admin/tools/admin-pm2.js
infra/guardiao/detectores/pm2_watcher.py
scripts/checker/04-pm2.sh
scripts/socorro-pm2.sh
```

Portanto:

```text
CREATE_SUPERVISOR_PARALLEL=false
EXTEND_PM2_ADMIN_AND_GUARDIAO_FIRST=true
```

O HUD deve projetar, quando medido:

```text
PROCESS
STATUS
PID
CPU
MEMORY
RESTARTS
UPTIME
LAST_EXIT
OWNER
HEALTH
```

Auto-recuperação não pode virar restart cego. Primeiro causa, lock, retry budget, rollback/recovery e receipt.

## 8. Queue / Redis / ACK

A sessão trouxe uma fila resiliente com `waiting -> processing -> ACK -> recovery` e locks para impedir escritores simultâneos. O repo possui referências/candidatos Redis, mas este receipt NÃO declara uma fila Redis canônica já implementada para todo o core.

O requisito funcional fica preservado sem escolher tecnologia à força:

```text
TASK
→ WAITING
→ LEASE/LOCK
→ PROCESSING
→ EXECUTION
→ EVIDENCE
→ ACK
→ DONE
```

Falha:

```text
PROCESSING + LEASE_EXPIRED
→ RECONCILE_OWNER
→ RETRY_BUDGET_CHECK
→ SAFE_REQUEUE or DEAD_LETTER
→ RECEIPT
```

Regras:

```text
ONE_WRITER_PER_SCOPE=true
ACK_REQUIRED_FOR_COMPLETION=true
TASK_LOSS_FORBIDDEN=true
DUPLICATE_EXECUTION_MUST_BE_IDEMPOTENT=true
```

Redis/NATS/RabbitMQ são implementação candidata. Primeiro medir owners existentes e absorver no menor ponto causal.

## 9. Obsidian / BRAIN / cache útil

A sessão pede que Hermes consulte, sob demanda e em paralelo, conhecimento útil da Casa/VPS, Obsidian e GitHub.

Owners já existentes na `main` incluem:

```text
docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md
scripts/grafo-vivo/obsidian-nota.mjs
apps/modulos/obsidian-plugin-grafo-vivo/
docs/BRAIN/
scripts/memory-linker/
```

Direção:

```text
CREATE_SECOND_BRAIN=false
OBSIDIAN=HUMAN_NAVIGATION_AND_DERIVED_MEMORY_SURFACE
GITHUB_MAIN=CANONICAL_STABLE_SOURCE
PR_COMMIT_ISSUE=LIVE_PROVENANCE_AND_WORKSTREAM
```

Persistência útil pode ter múltiplas projeções:

```text
JSONL  = eventos append-only
SQLite = consulta/index local quando owner justificar
Markdown/Obsidian = navegação humana e links
Vector/index = recuperação semântica derivada
```

Nenhuma projeção substitui a fonte canônica ou vira prova sozinha.

## 10. Remote Bridge / Casa

Owner real já existente:

```text
docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md
scripts/remote-bridge/CentralDark-Remote-Bridge.ps1
scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json
```

A sessão mediu:

```text
LOCAL_DESKTOP_COMMANDER_CONNECTED=true
REMOTE_MCP_CONNECTED=true
PERSISTED_SESSION_ERROR=Invalid Refresh Token: Already Used
WRAPPER_ERROR=empty Text argument
```

Direção:

```text
CREATE_REMOTE_BRIDGE_V2=false
CLASSIFY_SESSION_STALE=true
HANDLE_EMPTY_OUTPUT_WITHOUT_CRASH=true
OFFICIAL_REAUTH_FLOW=true
REPROVE_CHATGPT_TO_SEGREDO=true
```

## 11. Tabs / browser / DevTools / telemetria

A sessão propôs BroadcastChannel e streaming de logs entre abas. Isso entra como capacidade de transporte/telemetria, não como nova fonte da verdade.

```text
BROWSER_TAB != OWNER
DEVTOOLS_OUTPUT != MAIN
BROADCAST_EVENT != PROOF
```

Se o app usar WebView ou browser embutido, o objetivo é encaminhar eventos para o mesmo Tool Call Ledger/Connection Fabric, não criar memória paralela por aba.

## 12. Reality Judge e fala do agente

```text
INTENT != ACTION
OBSERVATION != ACTION
ACTION != PROOF
COMMIT_RECORDED != CI_PASSED
CI_PASSED != MAIN_PROMOTED
MAIN_PROMOTED != DEPLOYED
VNC_VIEW != PROOF
```

Antes de falar `feito`, o agente deve classificar a própria frase e apontar a prova correspondente.

## 13. Gatilhos canônicos

```text
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !AUREULA
→ !MULTIBÚSSOLA
→ !META_LUPA
→ !RECONCILIAR
→ !DELTAUTIL
→ !CONTRAPROVA
→ !REMEDIÇÃO
→ !FIXED_POINT
→ !REGISTRA
→ !BOOT
```

Não criar Trigger Fabric paralelo. Estender owners existentes.

## 14. Nome único de arquitetura

A sessão registra explicitamente a rejeição de nomes `-v1`, `-v2`, `-v3` para novas versões paralelas.

Se um manifesto agregado de produto for necessário, nome único:

```text
centraldark-architecture.json
```

O versionamento deve viver em schema/metadado/Git, não no nome criando famílias concorrentes.

## 15. O que está provado x o que é requisito

```text
PROVADO_NO_REPO:
- Omni Router multi-provider owner existe
- router-capabilities.json existe
- PM2 admin tool existe
- PM2 watcher/guardião existe
- Obsidian sync/docs/plugin owners existem
- Remote MCP Gateway/Bridge owners existem
- Trigger Fabric/Reality/receipts existem
- main atual foi medida antes deste receipt

REQUISITO_REGISTRADO_AINDA_NAO_PROVADO_END_TO_END:
- CentralDark.exe renderiza HUD completo acima
- duas contas aparecem e roteiam por alias no runtime
- quota/usage das contas é atualizada ao vivo
- Tool Call Ledger unifica todas as ferramentas
- Queue possui ACK/recovery end-to-end
- browser tabs alimentam ledger único
- voz FRIDAY → JARVIS → route → tool → proof → HUD
```

## 16. Owner map para implementação sem regressão

```text
PROVIDER/MODEL/QUOTA
→ elite-gateway / Omni Router / #1458

PR/TRIGGER/CLAIM/TOOL ROUTING
→ #1463 + Trigger Fabric + Horn/Reality owners

PM2/PROCESS HEALTH
→ admin-pm2.js + guardiao/pm2_watcher.py

OBSIDIAN/BRAIN
→ HERMES-CASA-OBSIDIAN-SYNC + grafo-vivo + memory-linker

REMOTE CASA
→ CENTRALDARK-REMOTE-MCP-GATEWAY + Remote Bridge existente

HUD/APP
→ localizar consumer atual do central-dark-instinct/desktop shell e estender, sem app V2

RENDEZVOUS
→ #1444
```

## 17. Next cursor

```text
NEXT_1=REMEASURE_PR1444_SAME_HEAD_AFTER_THIS_COMMIT
NEXT_2=LOCATE_CURRENT_APP_HUD_CONSUMER
NEXT_3=BIND_OMNI_ROUTER_PROVIDER_MODEL_ACCOUNT_ALIAS_TELEMETRY
NEXT_4=BIND_CONNECTION_FABRIC_TOOL_LEDGER_SOURCES_RESULTS
NEXT_5=REUSE_PM2_ADMIN_GUARDIAO_FOR_PROCESS_HUD
NEXT_6=DESIGN_ACK_LEASE_ON_EXISTING_QUEUE_OWNER_BEFORE_CHOOSING_REDIS
NEXT_7=BIND_OBSIDIAN_DERIVED_MEMORY_WITHOUT_SECOND_BRAIN
NEXT_8=FIX_REMOTE_BRIDGE_SESSION_STALE_IN_EXISTING_OWNER
NEXT_9=PROVE_VOICE_CHAT_CLI_UI_SAME_CORE
NEXT_10=RETURN_RECEIPTS_TO_PR1444
```

## 18. Fixed point

```text
FIXED_POINT=false
REGISTERED_IN_PR_MOTHER=true
IMPLEMENTED_IN_EXE=UNKNOWN
TWO_ACCOUNTS_RUNTIME=UNKNOWN
HUD_END_TO_END=UNKNOWN
QUEUE_ACK_RUNTIME=UNKNOWN
VOICE_END_TO_END=UNKNOWN
CASA_REMOTE=BLOCKED_UNTIL_REPROVED
```

📖 Sentido da passagem: examinar o minério inteiro, conservar o ouro e não confundir mapa com estrada pronta.

🏺 Verso da Casa: “Ôxente, a uvinha apontou a janela; agora cada luz do painel tem dono, caminho, ferramenta, resultado e recibo.” 🍇
