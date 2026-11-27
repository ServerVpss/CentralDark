# TOOL SURFACE PREFLIGHT — contrato da sessão

## Regra do CHEFE

Antes de analisar material novo, tentar primeiro as ferramentas relevantes disponíveis no turno.

```text
TOOL_PREFLIGHT_BEFORE_ANALYSIS=true
DISCOVER_RELEVANT_TOOLS=true
TRY_RELEVANT_LIVE_CALL=true
MEASURE_TOOL_STATUS=true

TOOL_SCHEMA_VISIBLE != TOOL_EXECUTION_PROVEN
TOOL_BLOCKED != SERVICE_OFFLINE
TOOL_DISABLED_THIS_CHAT != SERVICE_DEAD
UNKNOWN != FAIL
UNKNOWN != PASS
```

## Ordem

```text
USER_INPUT
→ DISCOVER TOOL SURFACES
→ SELECT RELEVANT TOOLS
→ ATTEMPT LIVE CALL
→ CLASSIFY:
   PASS
   BLOCKED
   FORBIDDEN
   DISABLED
   UNKNOWN
→ USE OBSERVABLE RESULTS
→ THEN ANALYZE
```

## Snapshot deste turno

```text
Personal Context     = PASS
Files / Library      = PASS
Container            = PASS
Web public research  = PASS

GitHub connector     = FORBIDDEN nesta conversa
CentralDark MCP      = chamada ficou DISABLED neste turno
```

GitHub FORBIDDEN aqui não prova GitHub offline.
CentralDark DISABLED aqui não prova MCP offline.

Esta regra é preflight operacional, não um segundo router.
