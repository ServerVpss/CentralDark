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

## Intake incremental — projetos MCP externos (2026-10-21)

A pedido do CHEFE, seis fontes externas verificadas no GitHub foram **catalogadas como candidatos de capacidade** no owner existente `apps/modulos/mcp/src/tools/core/mcp-admin.js` e no artefato `dist` correspondente, sem segundo MCP, sem instalação de código externo e sem autorização implícita. São entradas `INVENTORY_ONLY_NOT_INSTALLED`, não ferramentas executáveis. Não entram na contagem das 141 tools internas do dispatcher.

- `MCP_REGISTRY_DISCOVERY` — [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry): Descobrir servidores MCP publicados; fonte de inventário, não instalador.
- `MCP_REFERENCE_SERVERS` — [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers): Referências de implementação MCP para reaproveitar contratos; não são serviços de produção.
- `PLAYWRIGHT_MCP_BROWSER` — [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp): Automação web por snapshots de acessibilidade; comparar com Zendrive e browser existentes antes de incorporar.
- `PLAYWRIGHT_CLI_FASTPATH` — [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli): Automação browser por CLI/skills para jobs com menor overhead de schemas; alternativa a medir, não substituição automática.
- `CONTEXT7_DOCS_MCP` — [upstash/context7](https://github.com/upstash/context7): Consulta de documentação de bibliotecas por MCP/CLI; conexão e autorização próprias ainda não medidas.
- `MARKITDOWN_MCP` — [microsoft/markitdown](https://github.com/microsoft/markitdown): Converter documentos e arquivos para Markdown; validar fronteira de arquivos/URLs antes de executar.

```text
EXTERNAL_PROJECT_DISCOVERED != CONNECTOR_INSTALLED
CATALOG_ENTRY != TOOL_EXECUTION
SOURCE_AND_DIST_UPDATED != VPS_RUNTIME_RELOADED
NO_NEW_ROUTER=true
ONE_MCP_CATALOG=true
FAST_PATH_REUSE_BEFORE_NEW_INSTALL=true
```

O `catalogFingerprint` das rotas autorizadas não foi alterado: este delta é somente metadado de candidatos externos e não altera `AUTHORIZED_ROUTE_CATALOG` nem `ROUTE_LAWS`. Runtime atual medido antes deste delta: `141` tools, `13` rotas, fingerprint `80f0a0fab518ab8d15bbf6651b5471813369c53e56902d905883caa97c7405c7`. Fonte CURRENT declarava outro conjunto/fingerprint; a convergência do processo VPS requer readback próprio e não é inferida de Git.
