# 🧿 CENTRALDARK · HUD MCP + MULTICONTAS + GATILHOS BÍBLICOS

Data: 2026-09-08

Refs #1444 #1463 #1458

```text
PR_MAE=#1444
ONE_SYSTEM_ONLY=true
ONE_CORE=true
REUSE_BEFORE_CREATE=true
NO_SECRET_IN_UI_OR_RECEIPT=true
UNKNOWN_IS_NOT_PASS=true
VISUAL_SNAPSHOT_IS_INTAKE=true
```

## 1. Intenção consolidada

O aplicativo `CentralDark.exe` deve reunir, no mesmo HUD lateral, as capacidades que hoje aparecem espalhadas entre chat, MCP, seletor de modelo/provider, múltiplas contas pessoais autorizadas, limites/quota, fila de ferramentas, Casa, VPS, GitHub, Site e receipts.

Não criar outro cérebro nem outro painel paralelo. O HUD é uma projeção do mesmo core.

## 2. HUD lateral canônico

```text
CENTRALDARK HUD
├── 🤖 PROVIDER / MODEL PICKER
│   ├── provider
│   ├── modelo
│   ├── capacidade
│   ├── disponibilidade
│   └── último erro
├── 👥 CONTAS AUTORIZADAS
│   ├── account_alias
│   ├── provider
│   ├── auth_state
│   ├── quota_observed
│   ├── reset_observed
│   ├── requests_remaining_when_known
│   └── last_probe
├── 🔌 MCP / CONNECTORS
│   ├── INSTALLED
│   ├── CONNECTED
│   ├── AUTHORIZED
│   ├── READ
│   ├── WRITE
│   ├── RESPONDING
│   ├── LATENCY
│   └── LAST_CHECK
├── 🧰 TOOL CALL LEDGER
│   ├── call_index
│   ├── tool_name
│   ├── connector
│   ├── READ|WRITE|EXEC
│   ├── status
│   ├── response_present
│   ├── usage_observed
│   ├── latency
│   ├── error_class
│   └── receipt
├── 🧿 QUEUE FABRIC
├── 🏠 CASA
├── 🖥️ VPS
├── 🐙 GITHUB
├── 🌐 SITE
└── 🧾 RECEIPTS
```

## 3. Multicontas

A sessão atual mostra o uso real de mais de uma conta pessoal autorizada em superfícies de IA. Isso entra como requisito de produto sem registrar e-mail, token, cookie, senha ou refresh token.

```text
MULTI_ACCOUNT_SUPPORT=true
ACCOUNT_ID_IN_UI=ALIAS_ONLY
RAW_EMAIL_IN_RECEIPT=false
TOKEN_IN_RECEIPT=false
COOKIE_IN_RECEIPT=false
REFRESH_TOKEN_IN_RECEIPT=false
```

Cada conta é uma capacidade medida, não uma autoridade:

```text
ACCOUNT
→ provider
→ auth state
→ models visible
→ limits/quota when measurable
→ health
→ last error
→ route eligibility
```

O roteador pode escolher entre contas/provedores somente quando a política permitir e sem esconder a origem da execução.

```text
FALLBACK_ACCOUNT_USED -> RECEIPT_MUST_NAME_ACCOUNT_ALIAS
QUOTA_EXHAUSTED != AUTH_FAILED
AUTH_FAILED != PROVIDER_DOWN
PROVIDER_DOWN != MODEL_UNAVAILABLE
UNKNOWN != PASS
```

## 4. Limites e quota no HUD

A interface pode mostrar limites observados, contadores e reset quando a própria superfície/API fornecer esses dados.

```text
SCREENSHOT_LIMIT=VISUAL_SNAPSHOT
SCREENSHOT_LIMIT!=BILLING_PROOF
SCREENSHOT_LIMIT!=LIVE_PROVIDER_API
```

O HUD deve distinguir:

```text
OBSERVED_FROM_UI
MEASURED_FROM_API
INFERRED
UNKNOWN
```

Nunca transformar número visto uma vez em quota eterna.

## 5. MCP + Tool Call Ledger

A lista de chamados de ferramenta deve ficar junto da saúde dos conectores.

```text
CONNECTION_FABRIC
= quem está disponível / autorizado / respondendo

TOOL_CALL_LEDGER
= o que foi chamado / respondeu / falhou / demorou / gerou receipt
```

Fluxo:

```text
INTENT
→ CONNECTOR ROUTER
→ TOOL CALL
→ TOOL RESPONSE OR NAMED FAILURE
→ CLAIM CLASSIFICATION
→ RECEIPT
→ HUD
```

`Sem resposta de ferramenta` deve virar estado nomeado, por exemplo:

```text
TOOL_RESPONSE_MISSING
TOOL_TIMEOUT
TOOL_FORBIDDEN
TOOL_AUTH_REQUIRED
TOOL_ERROR
```

Nunca `PASS` por ausência de resposta.

## 6. Continuidade do chat “Padronizar gatilhos bíblicos”

Material recuperado da conversa histórica deve ser preservado como regra de comunicação e boot, sem duplicar o motor que já existe na `main`.

Decisões recuperadas:

```text
STYLE_LAYER=BIBLICAL_CHRONICLE_PLUS_EASY_BAIANES
PROTOCOL_LAYER=STRUCTURED_LANGUAGE_NEUTRAL
STYLE_MUST_NOT_CHANGE_PROTOCOL=true
```

Gatilho mestre:

```text
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBÚSSOLA
→ !META_LUPA
→ !RECONCILIAR
→ !CONTRAPROVA
→ !REMEDIÇÃO
→ !FIXED_POINT
→ !REGISTRA
→ !BOOT
```

Regras da conversa histórica:

```text
TRIGGERS_PERSIST_AT_CONVERSATION_START=true
FUTURE_TRIGGERS_ENTER_REGISTRY=true
MASTER_TRIGGER_EXPANDS_FULL_CYCLE=true
ONE_COPILOT_COORDINATES_MULTIPLE_ENGINES=true
NARRATIVE_STYLE != MACHINE_PROTOCOL
```

A `main` já contém owners reais para isso, incluindo:

- `docs/CONSCIENCIA/centraldark-gpt-prompt.md`
- `scripts/trigger-fabric/centraldark_master_cycle.py`
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`
- `docs/ARQUITETURA/PROOF-ARCHITECTURE/MASTER_CYCLE.yml`

Portanto:

```text
CREATE_TRIGGER_FABRIC_V2=false
EXTEND_EXISTING_TRIGGER_OWNERS=true
```

## 7. Integração com APP / JARVIS / FRIDAY

```text
FRIDAY=VOICE_AND_CONVERSATION_SURFACE
JARVIS=INTENT_ORCHESTRATION
CENTRALDARK_CORE=STATE_CONTRACTS_PROOF
HERMES_PIVETE=EXECUTION_CONTINUITY
REALITY_JUDGE=VERDICT
```

O HUD não deve ser uma tela passiva. Ele deve projetar o mesmo estado que o core usa:

```text
VOICE / CHAT / CLI / UI
→ INTENT
→ MASTER TRIGGER WHEN EXPLICIT
→ ROUTER
→ ACCOUNT/PROVIDER CAPABILITY
→ CONNECTOR
→ QUEUE
→ TOOL CALL
→ EVIDENCE
→ REALITY JUDGE
→ RECEIPT
→ HUD UPDATE
```

## 8. Regras de segurança e privacidade

```text
NO_RAW_CREDENTIALS=true
NO_EMAIL_REQUIRED_FOR_ACCOUNT_DISPLAY=true
NO_TOKEN_IN_LOG=true
NO_COOKIE_IN_LOG=true
NO_REFRESH_TOKEN_IN_LOG=true
NO_SECRET_IN_GITHUB=true
ACCOUNT_ALIAS_ONLY=true
```

## 9. Estado e next cursor

```text
HUD_MCP_MULTICONTAS_REQUIREMENT=REGISTERED_IN_PR_MOTHER
BIBLICAL_TRIGGER_CHAT_CONTINUITY=REGISTERED_IN_PR_MOTHER
TRIGGER_ENGINE_ALREADY_EXISTS_ON_MAIN=true
MULTI_ACCOUNT_RUNTIME_BINDING=NOT_PROVED
HUD_RUNTIME_BINDING=NOT_PROVED
APP_EXE_RENDERING=NOT_PROVED
VOICE_END_TO_END=NOT_PROVED
```

Próximo caminho material:

```text
1. localizar o owner real do HUD existente no APP/.exe;
2. localizar o owner real do model/provider picker;
3. ligar aliases de contas ao provider lease/router existente;
4. ligar Connection Fabric + Tool Call Ledger ao mesmo HUD;
5. reaproveitar Trigger Fabric existente, sem V2;
6. provar no app: trigger → route → account/provider → tool call → receipt → HUD;
7. devolver receipt ao #1444.
```

> Crônica da Casa: a linguagem pode carregar passagem, resenha e baianês; quem julga a execução continua sendo a realidade.
