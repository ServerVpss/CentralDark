# Micro-deploy — alias MCP admin híbrido para Lovable

Data: 2026-09-25
PR_MOTHER=#1562
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true

## Intenção

Evitar 404 quando um cliente informa a rota invertida `/mcp/admin`, sem criar segundo MCP.

Rota canônica preservada:
`https://mcp.centralldark.com/admin/mcp`

Compatibilidade:
`https://mcp.centralldark.com/mcp/admin`

## Implementação

O alias reutiliza exatamente o mesmo `requireAdminScope` e `handleMcpRequest` do endpoint admin canônico.

Não foi usado redirect HTTP para POST porque clientes MCP/OAuth podem não preservar método/corpo/Authorization durante redirecionamento.

Foram adicionadas rotas de discovery compatíveis que devolvem o resource canônico `/admin/mcp`.

## Provas runtime

Antes:
- GET público `/mcp/admin` = HTTP 404.
- GET público `/admin/mcp` = HTTP 401 com challenge OAuth admin.

Depois do micro-deploy:
- `npm run build` = PASS.
- `node --check dist/index.js` = PASS.
- PM2 `CentralDark-MCP` = online.
- `GET /health` = HTTP 200, service=mcp-centraldark, version=0.4.0, toolCount=126.
- GET local `/mcp/admin` = HTTP 401 + WWW-Authenticate.
- GET local `/admin/mcp` = HTTP 401 + WWW-Authenticate.
- GET público `https://mcp.centralldark.com/mcp/admin` = HTTP/2 401 + WWW-Authenticate.
- GET público `https://mcp.centralldark.com/admin/mcp` = HTTP/2 401 + WWW-Authenticate.
- discovery público compatível devolve `resource=https://mcp.centralldark.com/admin/mcp` e `scopes_supported=[mcp,admin]`.

## Lovable CURRENT

Consulta ao workspace CentralDark via conector Lovable mostrou:
- CentralDark `https://mcp.centralldark.com/admin/mcp`: OAuth, connected=true.
- CentralDark `https://mcp.centralldark.com/mcp`: OAuth, connected=true.

Logo, a rota correta já está conectada na Lovable; este delta apenas torna a rota invertida tolerante e convergente.

## Contraprova

`/mcp/admin` não vira segundo endpoint lógico, segundo MCP ou segunda arquitetura. Ele é somente alias de compatibilidade para o handler admin existente.

UNKNOWN != PASS.
ACTION != PROOF.
FIXED_POINT_GLOBAL=false.

NEXT_CURSOR=PR_CHILD_CI_THEN_PR1562_RECEIPT
