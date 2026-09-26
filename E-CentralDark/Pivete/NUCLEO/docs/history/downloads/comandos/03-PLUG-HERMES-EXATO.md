# Plug exato no Hermes

## Não criar ferramenta nova na primeira costura

O ponto de conexão já existe:

```text
apps/modulos/HERMES-CORE/agents/Executor/agent.mjs
  case "handler"
        ↓
apps/modulos/HERMES-CORE/agents/Universal-Handler/agent.mjs
  action "http"
```

Logo o Hermes chama:

```json
{
  "ferramenta": "handler",
  "args": {
    "acao": "http",
    "metodo": "POST",
    "url": "http://127.0.0.1:<BROWSER_BRIDGE_PORT>/v1/browser/observe",
    "body": {
      "protocol": "CENTRALDARK_BROWSER_COMMAND_V1",
      "operation": "observe",
      "transport": "auto",
      "mission_id": "<mission>",
      "scope": {
        "mode": "READ_ONLY"
      }
    }
  }
}
```

Nenhuma alteração é necessária no switch do Executor para a primeira integração.

## O que deve ser adicionado ao contexto do Hermes

Em vez de alterar o motor:

```text
BROWSER_CAPABILITY
owner=Browser Bridge V1
transport=handler/http
endpoint=local measured endpoint
authority=NONE
writer=NONE by default
```

O Decisor recebe essa capacidade somente quando health check do bridge provar que está disponível.

## Capability discovery

Antes do Hermes planejar operação de browser:

```text
handler/ping Browser Bridge
→ PASS
→ browser capability AVAILABLE

falha/timeout
→ browser capability UNAVAILABLE
→ não inventar ferramenta
```

## Operações read-only

```text
status
observe
context
selection
console
network
performance
lighthouse
transcript
```

## Operações mutantes

```text
navigate
click
type
submit
upload
download
```

Mutação exige:

```text
mission_id
target
allowed_origin
action
human_intent_ref
write_requested=true
```

e policy aceita.

## Retorno ao Hermes

O retorno do bridge não deve ser prosa solta.

```yaml
protocol: CENTRALDARK_BROWSER_EVENT_V1
result: PASS|FAIL|BLOCKED|UNKNOWN
event_id: ""
trace_id: ""
operation: ""
transport: ""
target: ""
observed_at: ""
evidence:
  - type: DOM|CONSOLE|NETWORK|PERFORMANCE|SCREENSHOT|TRANSCRIPT|ACTION_RECEIPT
    ref: ""
context: {}
```

O Executor continuará redigindo segredos na saída como defesa adicional.

## Não usar

```text
ChatGPT internal conversation endpoint
private undocumented app APIs
browser localStorage token as contract
cookie copying
session exfiltration
```

O contrato é o Browser Bridge da Casa.
