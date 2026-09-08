# 🧿 HUD LATERAL · LISTA DE CHAMADOS DE FERRAMENTA

Data: 2026-09-08

Refs #1444 #1463

```text
PR_MAE=#1444
FEATURE=TOOL_CALL_LEDGER_HUD
SOURCE=SCREENSHOT_LIVE_SESSION
STATUS=CAPABILITY_INTAKE_COMMITTED
MAIN_TOUCH=false
MERGE=false
DEPLOY=false
UNKNOWN_IS_NOT_PASS=true
```

## 1. Intenção do CHEFE

Adicionar na lateral do CentralDark/App/.exe um painel equivalente à **Lista de chamados de ferramenta** observada na interface viva, para que o CHEFE veja quais ferramentas foram chamadas, em que ordem, quanto contexto/tokens apareceram na medição visual, se houve resposta, erro, espera e qual foi o resultado.

A função entra no HUD existente. **Não criar um segundo painel, segundo monitor ou segundo sistema.**

```text
EXISTING_HUD
+ TOOL_CALL_LEDGER
= ONE_HUD
```

## 2. Snapshot visual recebido

A tela enviada mostrou chamadas como:

```text
Chamada de ferramenta 1: list_resources
  entrada visual: 1 tokens
  resultado visual: 1 tokens
  estado visível: Sem resposta de ferramenta

Chamada de ferramenta 2: search
  valor visual observado: 890 tokens

Chamada de ferramenta 3: list_resources
  valor visual observado: 1 tokens

Chamada de ferramenta 4: get_pr_info
  valor visual observado: 4.131 tokens

Chamada de ferramenta 5: search
  valor visual observado: 989 tokens

Chamada de ferramenta 6: fetch
  valor visual observado: 4.100 tokens

Chamada de ferramenta 7: search
  valor visual observado: 107 tokens

Chamada de ferramenta 8: search
  valor visual observado: 107 tokens
```

Esses números são `VISUAL_SNAPSHOT`, não contrato de billing nem telemetria oficial permanente.

```text
SCREEN_TOKEN_COUNT != BILLING_PROOF
SCREEN_TOOL_RESULT != RUNTIME_RECEIPT
VISUAL_SNAPSHOT != CURRENT_API_STATE
```

## 3. Posição no HUD lateral

Adicionar dentro do HUD já planejado:

```text
CENTRALDARK HUD
├── 🤖 Providers / modelos / limites
├── 🔌 Conectores
├── 🧰 Chamados de ferramenta          ← NOVO BLOCO
│   ├── # sequência
│   ├── ferramenta
│   ├── conector/provider
│   ├── READ | WRITE | EXEC
│   ├── input/resumo
│   ├── tokens/uso quando observável
│   ├── latência quando observável
│   ├── status
│   ├── resposta presente?
│   ├── erro/código
│   ├── receipt/id
│   └── expandir detalhes
├── 🧿 Queue Fabric 00..12
├── 🏠 Casa
├── 🖥️ VPS
├── 🐙 GitHub
├── 🌐 Site
└── 🧾 Receipts
```

## 4. Estados canônicos

```text
TOOL_CALL_STATE=
  QUEUED
  RUNNING
  RESPONDED
  NO_RESPONSE
  FAILED
  BLOCKED
  TIMEOUT
  CANCELLED
  UNKNOWN
```

Cores são projeção visual, nunca prova isolada:

```text
🟢 RESPONDED + receipt/evidence quando aplicável
🟡 QUEUED | RUNNING | NO_RESPONSE | UNKNOWN
🔴 FAILED | BLOCKED | TIMEOUT
```

## 5. Campos mínimos por chamado

```yaml
tool_call:
  sequence: 1
  tool: list_resources
  connector: plugin-management
  operation_class: READ
  started_at: null
  finished_at: null
  latency_ms: null
  input_summary: null
  input_tokens_observed: null
  output_tokens_observed: null
  response_present: false
  status: NO_RESPONSE
  error_code: null
  error_message: null
  receipt_ref: null
  head_sha: null
  target: null
```

Nunca armazenar segredo bruto em input/output do HUD.

```text
TOKEN/API_KEY/OAUTH_CODE/SECRET -> REDACT
NO_SECRET_IN_HUD=true
NO_SECRET_IN_RECEIPT=true
```

## 6. Relação com Connection Fabric

O bloco não substitui o Connection Fabric.

```text
CONNECTION_FABRIC
= estado do conector

TOOL_CALL_LEDGER
= histórico/estado das chamadas feitas através dos conectores
```

Exemplo:

```text
GitHub connector = RESPONDING
  ↓
get_pr_info #1444 = RESPONDED
  ↓
fetch_file receipt = RESPONDED
  ↓
create/update file = RESPONDED ou FAILED
```

Assim fica visível **onde exatamente uma missão andou ou travou**.

## 7. Relação com Queue Fabric

Cada chamada pode apontar para uma fase da fila:

```text
00 🧿 BOOT
01 🏷️ LABEL
02 🧾 HANDOFF
03 🧪 TEST
04 🦌 HORN
05 🔌 CONNECTOR
06 🤖 VALIDATE
07 📦 ARTIFACT
08 🚀 MICRO DEPLOY
09 🌐 SITE
10 🏠 CASA
11 🧷 MAIN
12 🔁 DEPENDABOT
```

Exemplo:

```text
PHASE=05 🔌 CONNECTOR
TOOL=Remote Desktop Commander.ping
STATE=TIMEOUT
NEXT_CURSOR=SESSION_STALE_REPAIR
```

## 8. Regra de prova

```text
TOOL_CALLED != TOOL_SUCCEEDED
TOOL_RESPONDED != ACTION_SUCCEEDED
READ_SUCCESS != WRITE_SUCCESS
WRITE_SUCCESS != CI_PASS
CI_PASS != DEPLOYED
NO_RESPONSE != PASS
UNKNOWN != PASS
```

O painel mostra a caminhada. O Reality Judge continua decidindo o veredito.

## 9. App/.exe + CLI

A mesma informação deve sair de um contrato único para CLI e UI:

```text
centraldark proof calls
centraldark proof calls --live
centraldark proof calls --pr 1444
centraldark proof calls --phase connector
```

Saída estrutural candidata:

```text
JSON/JSONL -> núcleo
Markdown   -> receipt
HUD        -> projeção lateral
CLI/TUI    -> projeção terminal
```

Não duplicar coleta por superfície.

## 10. Next cursor

```text
NEXT_CURSOR_1=FIND_EXISTING_APP_HUD_OWNER
NEXT_CURSOR_2=FIND_EXISTING_TOOL_CALL_TELEMETRY_OR_RECEIPT_SOURCE
NEXT_CURSOR_3=EXTEND_EXISTING_HUD_WITH_TOOL_CALL_LEDGER
NEXT_CURSOR_4=ADD_REDACTION_TESTS
NEXT_CURSOR_5=ADD_NO_RESPONSE_AND_TIMEOUT_STATES
NEXT_CURSOR_6=BIND_CALL_TO_QUEUE_PHASE_AND_RECEIPT
NEXT_CURSOR_7=PROVE_IN_APP_AND_CLI_FROM_SAME_SOURCE
NEXT_CURSOR_8=RETURN_RECEIPT_TO_PR1444
```

## 11. Fixed point

```text
TOOL_CALL_LEDGER_DESIGN=COMMITTED
TOOL_CALL_LEDGER_IMPLEMENTED=UNKNOWN
HUD_RENDERED_IN_APP=UNKNOWN
CLI_RENDERED=UNKNOWN
LIVE_TELEMETRY_BOUND=UNKNOWN
FIXED_POINT=false
```

> A lista já existe como informação observável na sessão; o delta agora é incorporá-la ao HUD único da CentralDark sem transformar visualização em juiz.