# CentralDark MCP Worker (Cloudflare)

Servidor MCP nativo para Cloudflare Workers, integrado ao site CentralDark existente.

## Estrutura

```
apps/modulos/mcp-worker/
├── src/index.ts          # Fetch handler (Cloudflare Workers)
├── src/mcp-server-workers.ts # Web Standards adapter
├── wrangler.toml         # Cloudflare Workers config
└── tsconfig.json         # TypeScript config
```

## Configuração

```bash
# Adicione no .env
CENTRALDARK_ADMIN_KEY=your-secret-admin-key
MCP_SESSION_SECRET=your-session-secret
```

## Deploy

```bash
cd apps/modulos/mcp-worker
npm install
npm run deploy
```

## Rota

- `https://centraldark-mcp.centraldark.workers.dev/mcp` - MCP streamable HTTP
- `https://centraldark-mcp.centraldark.workers.dev/health` - Health check

## Autenticação

Requer `Authorization: Bearer <token>` no header.

Sem token → 401 Unauthorized.

## Preservação

Não publica: segredos, tools administrativas, terminal remoto ou controle da Casa.
