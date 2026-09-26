# COMANDO - BROWSER-EVENT-V1.yml
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\BROWSER-EVENT-V1.yml
**SHA:** 54ff1d3238880c73
**Timestamp:** 2026-08-26T19:43:48.496920
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- internal_chat_api_is_contract: false

### Ouro Bruto (primeiros 5000 chars)
```
schema_version: 1
protocol: CENTRALDARK_BROWSER_EVENT_V1

required:
  - event_id
  - observed_at
  - operation
  - producer
  - transport
  - result
  - privacy_mode

fields:
  event_id: string
  mission_id: string_or_null
  session_id: string_or_null
  trace_id: string_or_null
  correlation_id: string_or_null
  request_id: string_or_null
  span_id: string_or_null

  observed_at: iso8601
  event_time: iso8601_or_null

  operation:
    enum:
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
      - navigate
      - click
      - type
      - submit
      - upload
      - download

  producer:
    enum:
      - chrome-devtools-mcp
      - zendriver
      - browser-user-adapter
      - unknown

  transport:
    enum:
      - foreground
      - background
      - auto

  source_app: string_or_null
  browser_profile_ref: string_or_null
  tab_id: string_or_null
  url: string_or_null
  origin: string_or_null
  title: string_or_null

  target: string_or_null
  operational_scope: string_or_null
  writer_scope: string_or_null
  repo_head_sha: sha40_or_unknown

  privacy_mode:
    enum:
      - PUBLIC_PAGE
      - AUTHORIZED_PRIVATE_PAGE
      - SENSITIVE_REDACTED

  result:
    enum:
      - PASS
      - FAIL
      - BLOCKED
      - UNKNOWN

  evidence:
    type: array
    items:
      fields:
        type:
          enum:
            - DOM
            - ACCESSIBILITY
            - CONSOLE
            - NETWORK
            - PERFORMANCE
            - LIGHTHOUSE
            - SCREENSHOT
            - TRANSCRIPT
            - SELECTION
            - ACTION_RECEIPT
        ref: string
        sha256: string_or_null
        summary: string_or_null

  context:
    type: object
    secret_fields_forbidden: true

invariants:
  browser_event_is_evidence_input: true
  browser_event_is_authority: false
  raw_cookie_forbidden: true
  raw_authorization_header_forbidden: true
  internal_chat_api_is_contract: false
  unknown_is_pass: false

```