# COMANDO - BROWSER-COMMAND-V1.yml
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\BROWSER-COMMAND-V1.yml
**SHA:** 841445e2cd396125
**Timestamp:** 2026-08-26T19:43:48.491390
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- undocumented_chat_api_as_contract: BLOCK

### Ouro Bruto (primeiros 5000 chars)
```
schema_version: 1
protocol: CENTRALDARK_BROWSER_COMMAND_V1

operations:
  read_only:
    - status
    - observe
    - context
    - selection
    - console
    - network
    - performance
    - lighthouse
    - screenshot
    - transcript

  mutating:
    - navigate
    - click
    - type
    - submit
    - upload
    - download

required:
  all:
    - command_id
    - operation
    - transport
  mutating:
    - mission_id
    - human_intent_ref
    - allowed_origin
    - target

fields:
  command_id: string
  mission_id: string_or_null
  trace_id: string_or_null
  operation: string
  transport: foreground|background|auto
  allowed_origin: string_or_null
  target: string_or_null
  selector_or_ref: string_or_null
  value: string_or_null
  human_intent_ref: string_or_null
  timeout_ms: integer
  privacy_mode: PUBLIC_PAGE|AUTHORIZED_PRIVATE_PAGE|SENSITIVE_REDACTED

policy:
  default_mode: READ_ONLY
  cross_origin_mutation_default: BLOCK
  secrets_in_value: BLOCK
  cookies_in_payload: BLOCK
  authorization_headers_in_payload: BLOCK
  internal_private_api_use: BLOCK
  undocumented_chat_api_as_contract: BLOCK

```