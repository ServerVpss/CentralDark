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

## Contraprova bancada (executada)

Source pin: `7f9d03e59dc60a2349c9b2ec5aac12f5845637`. Checkout limpo (sparse) em `E:\\CentralDark\\_cache\\cf-openapi-mcp-20261009`, no dispositivo SEGREDO (sem mudar checkout produtivo da Casa ou VPS).

- `npm ci --ignore-scripts --no-audit --no-fund`: PASS.
- `node --test tests/provider-control.test.mjs`: 16 testes, 16 PASS, 0 FAIL.
- `npm run build`: PASS (`tsc -p tsconfig.json --noResolve`).
- `dist/modes/admin/tools/cloudflare-openapi-catalog.js` presente após build; importação Node no `dist`: 3670 operações, 2303 paths, 745 tags, todas `INVENTORY_ONLY`.
- Fingerprint SHA-256 do JSON extraído: `70a3df4ccec5e8c0fd3a6e5f2219fbc4e6b160248d8248bf118b5e01bbe9ef08`.
- Readback dos quatro arquivos no SHA `7f9d03e59dc60a2349c9b2ec5aac12f5845637`: PASS.

**Não provado**: catálogo exposto no runtime real (`mcp_admin_call(provider_capabilities view=openapi)`), promoção de mesmo SHA para a VPS, integração de credencial e execução E2E com a Cloudflare. O snapshot representa a especificação OpenAPI obtida nesta medição; não promete cobrir alterações posteriores da API.

Nunca confundir COMMIT, BUILD ou 16 testes locais com deploy/funcionamento.
