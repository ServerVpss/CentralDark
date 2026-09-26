# 👑🪬 Receipt — Tool Call ↔ Receipt ↔ Intenção Resiliente

Data: 2026-09-16
Status: SOURCE_CRYSTALLIZED / RUNTIME_BINDING_UNKNOWN

## Intenção

Preservar a intenção operacional através das Tool Calls dos braços que atravessam a fronteira CentralDark, reutilizando os owners existentes e sem criar segundo bus, segundo logger, segundo cérebro ou segundo sistema de receipts.

## Descoberta

A capacidade já existiu e foi promovida:

- PR #1494 — `MCP: AMARRAR TOOL CALL AO RASTRO VIVO SEM NOVO BARRAMENTO`;
- merge commit `95139ea4a6677bb4eeef9c4030fcd8cca8c74176`;
- envelope `centraldark.mcp.tool-call.v1`;
- `AsyncLocalStorage` para preservar contexto de request/mission/trace;
- `subscribeAuditEvents()` para observação em tempo real sem novo barramento;
- `mcp_tool_execution_live` sobre o log/SSE já existente.

A `main` medida em `38ce303f645552e9bfea16c0df32d82dc51847a3` não continha mais esse delta em `audit-logger.js`, `correlation.js`, `log.js` e no teste agregador. Esta lane restaura exatamente a capacidade previamente mergeada, em vez de criar uma implementação paralela.

## Owners interligados já existentes

```text
TOOL CALL / MCP
→ apps/modulos/mcp/src/audit-logger.js
→ apps/modulos/mcp/src/correlation.js
→ apps/modulos/mcp/src/log.js
→ /admin/logs/stream

EVIDENCE / CROSS-AGENT INGEST
→ supabase/functions/agent-log/index.ts
→ supabase/functions/_shared/evidence-envelope.mjs
→ public.agent_events

CONTINUIDADE / RUNTIME SWAP
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml
→ scripts/trigger-fabric/runtime_plug_conformance.py
```

## Contrato de intenção resiliente

O contrato de runtime existente preserva:

```text
INTENT
STATE
EVIDENCE_REFS
WRITER_SCOPE
PROOF_TARGET
RECEIPT
NEXT_CURSOR
SPIRAL_CURSOR
UNRESOLVED_SET
```

A Tool Call observável carrega identidade causal (`mission_id`, `request_id`, `correlation_id`, `trace_id`, `span_id`, `parent_span_id`, `call_id`) e deve ser reconciliada com esse envelope de continuidade, não virar nova autoridade.

## Costura canônica

```text
INTENÇÃO
→ RUNTIME/AGENTE
→ TOOL CALL
→ centraldark.mcp.tool-call.v1
→ AUDIT EXISTENTE
→ LOG/SSE EXISTENTE
→ EVIDENCE ENVELOPE / AGENT-LOG EXISTENTE
→ RECEIPT CANDIDATE
→ MEMORY LINKER / DREAM REVIEW quando aplicável
→ META-LUPA / CONTRAPROVA
→ REALIDADE
→ RECEIPT
→ NEXT_CURSOR
```

## Fronteira honesta

```text
ALL_AGENTS_THAT_CROSS_CENTRALDARK_MCP_OR_AGENT_LOG = COVERABLE_BY_EXISTING_OWNERS
AGENT_BYPASSING_CENTRALDARK_BOUNDARY = UNOBSERVED
MCP_TO_AGENT_LOG_RUNTIME_BINDING_NOW = UNKNOWN
VPS_LIVE_INTERCEPTION_NOW = UNKNOWN
```

A presença do source não prova que a VPS esteja executando esses bytes. Durante a remedição, o Remote Desktop Commander deixou de responder; portanto a ligação runtime não foi promovida a PASS.

## Cadeados

```text
NEW_BUS=false
NEW_LOGGER=false
NEW_BRAIN=false
NEW_RECEIPT_SYSTEM=false
INTERCEPTED_TOOL_CALL != AUTHORIZED_ACTION
TOOL_CALL_EVENT != ACTION_PROOF
RECEIPT != AUTHORITY
HISTORY != CURRENT_RUNTIME
MERGED != DEPLOYED
UNKNOWN != PASS
REALIDADE = JUIZ
```

## Próximo cursor

```text
SAME_HEAD_CI
→ confirmar restauração do envelope e testes
→ medir VPS atual
→ provar uma Tool Call real em mcp_tool_execution_live
→ provar/medir a ponte para Evidence Envelope / agent-log
→ confirmar preservação de mission + writer_scope + receipt/next_cursor no handoff aplicável
→ contraprová-la com agente/rota que bypassa a fronteira
→ somente então RUNTIME_BINDING=PASS
```
