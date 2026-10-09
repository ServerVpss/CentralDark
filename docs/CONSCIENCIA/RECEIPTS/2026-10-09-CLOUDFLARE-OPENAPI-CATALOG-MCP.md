# Cloudflare OpenAPI — inventário integral de rotas no MCP CentralDark

Data: 2026-10-08 (BRT). Fonte: Cloudflare plugin conectado, operação de leitura da especificação OpenAPI.

## Intenção e owner

Um sistema / um MCP oficial: `apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js`. Expandir o catálogo existente, não criar segundo dispatcher, MCP, bridge, agente, segredo ou plano de controle.

## Cobertura da versão observada da especificação

- Caminhos únicos: **2303**.
- Operações HTTP: **3670**.
- GET **1798** · POST **782** · PUT **352** · PATCH **273** · DELETE **465**.
- Tags técnicas únicas: **745** (tags não equivalem necessariamente a produtos).
- Dados por operação: método, path, resumo, tags, path params obrigatórios, query params, header params, content types aceitos, requestBody obrigatório.
- Artefato no owner: `apps/modulos/mcp/src/modes/admin/tools/cloudflare-openapi-catalog.js` (snapshot comprimido gzip+base64 para preservar o catálogo integral sem exceder limites de payload). Reidratação local em Node `node:zlib`; fingerprint SHA-256 do JSON exposto no catálogo.
- Consulta pelo mesmo `provider_capabilities`: `{ "provider":"cloudflare", "view":"openapi", "limit":100, "offset":0 }`. Busca por `search`, `tag`, `method` e paginação.
- `view=curated` (default) mantém a matriz original e inclui resumo do catálogo.

## Contraprova de autoridade

Inventariado != autorizado. Todas as operações descobertas ficam `INVENTORY_ONLY` e não entram no allowlist executável de `provider_read`/`provider_mutate`. O allowlist histórico, `guardDestructive`, idempotência, controle de compensação e segredo server-side permanecem. A inclusão do inventário não cria nem transporta token Cloudflare.

`MCP_RUNTIME_CREDENTIAL=MISSING` na medição prévia. Depois da confirmação pelo CHEFE, disponibilização da credencial deverá ser no owner de segredo existente, nunca no repo ou chat.

## Teste e prova pendentes

Readback de commit + `node --test apps/modulos/mcp/tests/provider-control.test.mjs` sobre o mesmo SHA; catálogo visível em `mcp_admin_call(provider_capabilities)` somente após deploy comprovado; testes E2E de provider após credenciais. Nunca confundir commit/BUILD com deploy/funcionamento.
