# Browser → Evidência → Dream Review

## Reuso obrigatório

Não criar banco/event bus para browser.

Usar:

```text
Browser Event
→ supabase/functions/agent-log
→ evidence-envelope
→ public.agent_events
```

## Identidade causal

Reutilizar a identidade existente:

```text
event
+ producer
+ target
+ mission_id
+ writer_scope
+ sha
+ cause_key
```

Não usar timestamp para multiplicar evidência.

## Mapping

```yaml
BROWSER_EVENT_V1:
  event: operation
  producer: chrome-devtools-mcp|zendriver
  target: url/origin/semantic-target
  mission_id: mission_id
  writer_scope: browser-read|browser-action:<scope>
  sha: repo_head_or_unknown
  trace_id: trace_id
  timestamp: observed_at
  result: result
  context:
    source_app: source_app
    transport: transport
    tab_id: tab_id
    url: url
    title: title
    evidence: evidence
```

## Artifact Capability

Quando a observação for material para aprendizado:

```text
BROWSER_EVENT
→ metadata.browser_observation=true
→ artifact-capability.mjs
→ class=BROWSER_OBSERVATION
```

Sinais existentes são reaproveitados.

## Dream

Somente depois:

```text
Browser Observation
→ Dream Review
→ Candidate
→ Pattern
→ Counterproof
→ Owner
→ Crystal
```

Nunca:

```text
browser observed
→ memory canonical directly
```
