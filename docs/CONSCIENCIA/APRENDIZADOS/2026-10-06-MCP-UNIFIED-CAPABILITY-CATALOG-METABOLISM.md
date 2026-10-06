# Aprendizado #168 — Catálogo unificado de capabilities e rotas MCP

Data: 2026-10-06
Status: CURRENT / MATERIALIZED_IN_MAIN
Owner executável: `apps/modulos/mcp/src/tools/core/mcp-admin.js`
Owner de rota: `.agents/skills/centraldark-unified-surface-parity/SKILL.md`
Receita herdada/evoluída: `HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`
PR-mãe viva: #1757
PR-mãe legado: #1562

## Ferida encontrada

A CentralDark já possuía o metabolismo multirota (#146/#147), Remote Desktop Commander e Screenpipe em owners existentes, mas o catálogo MCP novo havia cristalizado rotas sem fechar todas as camadas da peneira. Screenpipe não estava no mesmo catálogo e o filtro de `mcp_admin_catalog` filtrava tools, não rotas.

## Delta útil

O mesmo `mcp_admin_catalog` passou a ser o catálogo unificado de tools + rotas/capabilities externas, sem criar segundo MCP, dispatcher, router ou owner. Remote Desktop Commander e Screenpipe ficam no mesmo catálogo, com binding e estado de runtime medidos separadamente.

## Invariantes

```text
LEARNING_168_MCP_UNIFIED_CAPABILITY_CATALOG=true
ONE_MCP_CATALOG=true
SCREENPIPE_AND_RDC_SHARE_ONE_MCP_CATALOG=true
TOOL_CATALOG != TOOL_EXECUTION
DOCUMENTED_ROUTE_IS_NOT_RUNTIME_PROOF=true
ONE_ROUTE_FAILED_IS_NOT_SYSTEM_FAILED=true
NEXT_AUTHORIZED_ROUTE_AUTO_CONTINUE=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
```

## Fingerprint

`42c132bf864a3a82b16495bc6109a2d09c90e7c0806988fb389103e021011bd5`

Esse fingerprint cobre a composição lógica atual das 11 rotas + leis do catálogo unificado. Mudança material de rotas/leis exige novo fingerprint e revalidação apenas do cone afetado.

## Metabolismo

```text
PERCEBER
→ COMPARAR COM CATÁLOGO/CURRENT
→ GAP
→ REUSE HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH
→ EVOLVE mcp_admin_catalog
→ PROVA DE SOURCE
→ VERIFIER
→ RUNTIME READBACK
→ RECEIPT
→ #1757
→ REPLAY
```

O hook real continua sendo o já existente `CAPABILITY_GAP/TERRITORY_ROUTE_CHANGE → system_sentinel.py → HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`. Nenhum hook novo é necessário para este delta.

## Fronteira

Source/main materializado não prova reload do processo MCP na VPS. `LIVE_MCP_CATALOG_RELOAD` permanece UNKNOWN até `mcp_admin_catalog` vivo devolver o fingerprint e as rotas novas.


## Ferida adicional encontrada no metabolismo

O runtime real executa `dist/mcp-server.js`, e a primeira cristalização havia alterado apenas `src/tools/core/mcp-admin.js`. Portanto:

```text
SOURCE_UPDATED != DIST_RUNTIME_UPDATED
SOURCE_DIST_PARITY_REQUIRED=true
BUILD_ARTIFACT_IS_PART_OF_RUNTIME_PROOF=true
```

A correção compilou o MCP com o build oficial e promoveu também `dist/tools/core/mcp-admin.js`; o verifier passou a fiscalizar os dois lados.
