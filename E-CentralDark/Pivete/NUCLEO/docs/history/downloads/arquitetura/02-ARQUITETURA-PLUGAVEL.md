# Arquitetura plugável completa

## Um adapter, duas lanes

```text
                        BROWSER BRIDGE V1
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       FOREGROUND / CHEFE          BACKGROUND / HERMES
       Chrome visível              Chrome automatizado
       DevTools / MCP              Zendriver
```

As duas lanes produzem o MESMO contrato.

Nunca permitir:

```text
FOREGROUND_SCHEMA != BACKGROUND_SCHEMA
```

## Lane A — Foreground

Usa a sessão de navegador que o CHEFE realmente está vendo.

Possíveis capacidades quando medidas:

```text
status
page snapshot
DOM/accessibility
url/title
selection
console
network
performance
Lighthouse
screenshot reference
caption/transcript reference
```

Transport preferido:

`Chrome DevTools MCP`

O adapter não deve depender do console interno do ChatGPT.

## Lane B — Background

Reutiliza `elite-gateway` + Zendriver.

Função:

```text
abrir/manter perfil autorizado
→ navegar
→ observar DOM
→ executar ação de browser autorizada
→ retornar resultado normalizado
```

A lane background nunca é fonte de verdade maior que a lane foreground.

## Browser Bridge V1

Único papel:

```text
TRANSPORT-SPECIFIC INPUT
→ NORMALIZE
→ POLICY
→ TRACE
→ BROWSER_EVENT_V1
```

E na direção contrária:

```text
BROWSER_COMMAND_V1
→ POLICY
→ TRANSPORT
→ RESULT
→ BROWSER_EVENT_V1
```

## Fluxo de observação

```text
Browser
→ transport
→ Browser Bridge
→ BROWSER_EVENT_V1
→ resposta síncrona para Hermes
→ evidence envelope
→ agent-log
→ agent_events
```

Quando a observação contém matéria útil para aprendizado:

```text
BROWSER_EVENT_V1
→ artifact-capability
  material_class=BROWSER_OBSERVATION
→ Dream Review
→ CANDIDATE
```

## Fluxo de comando

```text
Hermes
→ handler/http
→ Browser Bridge
→ validate BROWSER_COMMAND_V1
→ route transport
→ browser
→ observe result
→ normalize event
→ Hermes
```

## Separação de lanes

```text
STUDY_LANE
→ transcript/page/content
→ read-only
→ Memory/Dream candidate

WORK_LANE
→ missão ativa
→ browser observation/action
→ operational evidence

STUDY_LANE != WRITER
WORK_LANE mutation requires mission scope
```

## Contexto da sessão atual

Cada evento carrega:

```text
mission_id
session_id
trace_id
correlation_id
request_id
span_id
source_app
transport
browser_profile
tab_id
url
title
observed_at
```

Assim Zendriver, Chrome MCP, Hermes e Evidence Envelope podem ser correlacionados sem fingir que timestamps iguais são causa.
