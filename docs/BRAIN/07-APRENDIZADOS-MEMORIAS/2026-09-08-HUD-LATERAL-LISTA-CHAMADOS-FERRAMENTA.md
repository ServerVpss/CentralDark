---
title: "HUD lateral — lista de chamados de ferramenta"
status: KNOWLEDGE_ONLY
date: 2026-09-08
updated: 2026-09-08T00:00:00-03:00
tags: [hud, tool-call-ledger, lista, ferramentas, centraldark]
category: BRAIN-APRENDIZADOS
sensitivity: INTERNAL
source: "screenshot de sessão viva e contrato de consumo do live JSON"
source_class: HUMAN_AUTHORITY
source_rule: "VISUAL_SNAPSHOT_IS_INTAKE; ACTION_IS_NOT_PROOF; NO_SECRET_IN_UI_LOG_OR_RECEIPT"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/"
---
# 🧿 HUD LATERAL · LISTA DE CHAMADOS DE FERRAMENTA

Data: 2026-09-08

Refs #1444 #1463

```text
PR_MAE=#1444
FEATURE=TOOL_CALL_LEDGER_HUD
SOURCE=SCREENSHOT_LIVE_SESSION
STATUS=CAPABILITY_INTAKE_COMMITTED
LIVE_JSON_CONSUMPTION_CONTRACT=COMMITTED
MODEL_PARALLEL_READER=REQUIRED
MAIN_TOUCH=false
MERGE=false
DEPLOY=false
UNKNOWN_IS_NOT_PASS=true
```

## 1. Intenção do CHEFE

Adicionar na lateral do CentralDark/App/.exe um painel equivalente à **Lista de chamados de ferramenta** observada na interface viva, para que o CHEFE veja quais ferramentas foram chamadas, em que ordem, quanto contexto/tokens apareceram na medição visual, se houve resposta, erro, espera e qual foi o resultado.

Além da projeção humana, o mesmo ledger deve ser consumível pelo próprio modelo/agente em tempo real, em paralelo e sob demanda, sem depender da leitura visual do HUD.

A função entra no HUD existente. **Não criar um segundo painel, segundo monitor, segundo cérebro ou segundo sistema.**

```text
EXISTING_HUD
+ TOOL_CALL_LEDGER
+ LIVE_JSON_PROJECTION
+ MODEL_READ_INTERFACE
= ONE_HUD + ONE_CORE
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
├── 🧰 Chamados de ferramenta
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
│   ├── expandir detalhes
│   ├── 📄 Abrir JSON
│   ├── ⬇️ Baixar JSON
│   ├── 📡 Seguir ao vivo
│   └── 🤖 Consultar pelo agente
├── 🧿 Queue Fabric 00..12
├── 🏠 Casa
├── 🖥️ VPS
├── 🐙 GitHub
├── 🌐 Site
└── 🧾 Receipts
```

A opção de download observada na interface externa vira uma capacidade da CentralDark, não uma cópia visual da interface externa.

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
  schema: centraldark.tool-call-ledger.v1
  call_id: null
  session_id: null
  sequence: 1
  tool: list_resources
  connector: plugin-management
  operation_class: READ
  source_ref: null
  phase: connector
  started_at: null
  finished_at: null
  latency_ms: null
  freshness_at: null
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
  result_summary: null
  evidence_refs: []
  redacted: true
```

Nunca armazenar segredo bruto em input/output do HUD ou no JSON entregue ao modelo.

```text
TOKEN/API_KEY/OAUTH_CODE/COOKIE/SECRET/PASSWORD -> REDACT BEFORE PERSIST
NO_SECRET_IN_HUD=true
NO_SECRET_IN_JSON=true
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
centraldark proof calls --json
centraldark proof calls --jsonl --live
centraldark proof calls --latest --json
centraldark proof calls --pr 1444
centraldark proof calls --phase connector
centraldark proof calls --status failed
centraldark proof calls --connector github
```

Saída estrutural:

```text
JSON snapshot   -> consulta pontual humana/modelo
JSONL append    -> histórico/eventos
live stream     -> projeção incremental quando transport disponível
Markdown        -> receipt humano
HUD             -> projeção lateral
CLI/TUI         -> projeção terminal
```

Não duplicar coleta por superfície.

## 10. JSON vivo consultável pelo modelo

O delta desta rodada é explícito: o modelo não deve depender de olhar a tela para saber o que as ferramentas fizeram. O core deve publicar uma projeção estruturada e redigida do ledger.

```text
TOOL EXECUTION
  ↓
NORMALIZE EVENT
  ↓
REDACT SECRETS
  ↓
APPEND LEDGER JSONL
  ├──→ HUD
  ├──→ CLI/TUI
  ├──→ EXPORT tool-call-data.json
  └──→ MODEL READ INTERFACE
```

### Snapshot consultável sob demanda

Nome de exportação humana compatível com a ideia observada na tela:

```text
tool-call-data.json
```

Estrutura mínima:

```json
{
  "schema": "centraldark.tool-call-ledger.v1",
  "generated_at": "<timestamp>",
  "freshness": "LIVE|SNAPSHOT|STALE|UNKNOWN",
  "session_id": "<id-redigido>",
  "filters": {
    "connector": null,
    "tool": null,
    "status": null,
    "phase": null,
    "since": null
  },
  "calls": []
}
```

### Leitura paralela pelo agente

```text
MISSION LOOP
├── eixo A: ação principal
├── eixo B: leitura live do Tool Call Ledger
├── eixo C: Connection Fabric / health
└── eixo D: receipts / Reality Judge
```

A leitura paralela é percepção. Ela não cria Writer extra.

```text
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION_PER_SCOPE=true
MODEL_READS_LEDGER_AUTONOMOUSLY=true
MODEL_WRITES_REQUIRE_EXISTING_AUTHORITY=true
```

O agente pode consultar o ledger automaticamente quando isso reduzir dúvida material, por exemplo:

```text
antes de repetir uma chamada
antes de afirmar que uma ferramenta respondeu
quando um conector parece travado
quando o output visual foi truncado
quando precisa descobrir o último erro causal
quando precisa comparar passado x estado atual
quando um workflow/receipt depende de tool result
```

## 11. Freshness, cursor e consumo incremental

Para não reler o arquivo inteiro a cada ciclo, cada consumer mantém cursor próprio.

```yaml
consumer_cursor:
  consumer: hermes|sol|jarvis|hud|cli
  session_id: null
  last_call_id: null
  last_sequence: null
  last_seen_at: null
```

Fluxo:

```text
READ(last_cursor)
→ GET only events after cursor
→ classify CURRENT vs HISTORICAL
→ update local consumer cursor
→ do not delete canonical ledger
```

Regras:

```text
OLD_EVENT != CURRENT_STATE
NEW_EVENT != PROOF_BY_ITSELF
TRUNCATED_UI != TRUNCATED_LEDGER
MODEL_CONTEXT_LIMIT != EVENT_LOSS
CURSOR_ADVANCE_REQUIRES_EVENT_READ=true
```

## 12. Opções visíveis no HUD

O bloco lateral deve oferecer no mesmo owner:

```text
[ Abrir JSON ]
[ Baixar JSON ]
[ Copiar resumo redigido ]
[ Seguir ao vivo ON/OFF ]
[ Consultar agora pelo agente ]
[ Filtrar conector ]
[ Filtrar ferramenta ]
[ Filtrar status ]
[ Filtrar fase ]
```

`Seguir ao vivo` pode usar SSE/WebSocket/event-stream ou transporte equivalente somente quando um owner existente provar esse transporte. O contrato não obriga tecnologia nova.

```text
LIVE_TRANSPORT_IMPL=OWNER_DECISION
SSE_OR_WEBSOCKET != NEW_CORE
CREATE_SECOND_EVENT_BUS=false
```

## 13. Segurança e autonomia

O modelo pode consumir automaticamente somente projeção redigida e dentro das fontes/conectores já autorizados.

```text
READ_AUTH_ALREADY_GRANTED -> AUTONOMOUS_QUERY_ALLOWED
WRITE/EXEC -> EXISTING_AUTHORITY_POLICY
SECRET_VALUE -> NEVER_EXPOSE_TO_MODEL_LEDGER
RAW_TOOL_PAYLOAD -> STORE_ONLY_IF_SAFE_AND_NEEDED
```

Campos sensíveis devem virar metadados seguros:

```text
secret_present=true|false|unknown
secret_name_class=<redacted-class>
secret_value=FORBIDDEN
```

Isso permite ao agente saber, por exemplo, que uma credencial necessária está ausente sem enxergar a credencial.

## 14. Relação com Sources / Results / Reality Judge

```text
SOURCE
→ CONNECTOR
→ TOOL CALL
→ TOOL RESULT JSON
→ EVIDENCE REF
→ REALITY JUDGE
→ RESULT TARGET
→ RECEIPT
```

O modelo pode usar `TOOL RESULT JSON` para raciocinar sobre o próximo passo, mas continua proibido de transformar mera resposta de ferramenta em verde final.

```text
JSON_PRESENT != PASS
JSON_STATUS_RESPONDED != CLAIM_PROVED
MODEL_READ_JSON != EXECUTION
```

## 15. Next cursor

```text
NEXT_CURSOR_1=FIND_EXISTING_APP_HUD_OWNER
NEXT_CURSOR_2=FIND_EXISTING_TOOL_CALL_TELEMETRY_OR_RECEIPT_SOURCE
NEXT_CURSOR_3=BIND_NORMALIZED_EVENT_TO_EXISTING_TOOL_WRAPPER
NEXT_CURSOR_4=ADD_REDACTION_TESTS
NEXT_CURSOR_5=ADD_NO_RESPONSE_TIMEOUT_CANCELLED_STATES
NEXT_CURSOR_6=ADD_JSON_SNAPSHOT_EXPORT_TOOL_CALL_DATA
NEXT_CURSOR_7=ADD_CURSOR_INCREMENTAL_READ_FOR_MODEL
NEXT_CURSOR_8=BIND_CALL_TO_QUEUE_PHASE_SOURCE_RESULT_RECEIPT
NEXT_CURSOR_9=PROVE_IN_APP_CLI_MODEL_FROM_SAME_SOURCE
NEXT_CURSOR_10=RETURN_RECEIPT_TO_PR1444
```

## 16. Fixed point

```text
TOOL_CALL_LEDGER_DESIGN=COMMITTED
LIVE_JSON_CONSUMPTION_CONTRACT=COMMITTED
MODEL_PARALLEL_READER_CONTRACT=COMMITTED
JSON_EXPORT_OPTION_CONTRACT=COMMITTED
TOOL_CALL_LEDGER_IMPLEMENTED=UNKNOWN
HUD_RENDERED_IN_APP=UNKNOWN
CLI_RENDERED=UNKNOWN
MODEL_LIVE_CONSUMER_RUNTIME=UNKNOWN
LIVE_TELEMETRY_BOUND=UNKNOWN
FIXED_POINT=false
```

> A lista de ferramenta não é só para o olho humano. O mesmo evento deve alimentar HUD, CLI e agente a partir de uma fonte estruturada única, redigida, consultável por cursor e capaz de distinguir `CURRENT` de `HISTORICAL`.