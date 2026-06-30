# 🏗️ Arquitetura do MCP CentralDark

> Documentação técnica para **recriar ou aprender** com esta estrutura no futuro.
> Levantada em 30/06/2026 a partir do código vivo (`dist/`). Mantém-se junto com o código.

---

## 1. Visão geral

Servidor **Express** (Node 20, ES Modules) que implementa o **Model Context Protocol** sobre
HTTP, com autenticação **OAuth 2.1 + ponte GitHub**. Expõe **100 tools** para IAs externas.

- **Porta:** `9100` (bind `127.0.0.1` — exposto ao mundo via Caddy em `mcp.centralldark.com`)
- **Processo:** PM2 `CentralDark-MCP`
- **SDK:** `@modelcontextprotocol/sdk` (transport `StreamableHTTPServerTransport`, stateless por request)
- **Validação:** `zod` em toda entrada de tool
- **Versão:** 0.4.0

---

## 2. Boot / entrypoint — `dist/index.js`

Sobe o Express, desabilita `x-powered-by`, aplica CORS com allowlist estrita
(`Authorization`, `MCP-Session-Id`, etc.) e limites de corpo (2MB JSON). Rotas montadas:

| Rota | Função |
|------|--------|
| `GET /health` | status + `catalogVersion` + `toolCount` |
| `GET /tools.json` | manifesto público do catálogo |
| `GET /openapi.json` | spec OpenAPI 3.1 (Open WebUI Tool Servers) |
| `GET /status`, `/status.json` | dashboard + JSON de status |
| `GET /skills`, `/skills/:nome[/...]` | skills públicas (mirror `segredounlock/clone-deck`) |
| `/.well-known/oauth-*`, `/register`, `/authorize`, `/token` | OAuth 2.1 (MCP) |
| `/oauth/start`, `/oauth/callback` | ponte OAuth com o GitHub |
| `POST /mcp` | **handler MCP principal** (exige Bearer ou sessão) |
| `GET /mcp` | retorna 401 + `WWW-Authenticate` (clientes pingam pra checar OAuth) |
| `POST /api/telemetry-ingest` | métricas da VPS (admin-only) |

> **Histórico:** a rota `/mcp-public` (escrita sem auth) foi **removida em 30/06/2026** por
> segurança (pendência #8). Toda chamada agora exige OAuth via `/mcp`.

**Resolução de token (`resolveGhToken`):** Bearer → se bate com `MCP_TOKEN` retorna o token
GitHub interno; senão trata como access token OAuth e busca na store de sessões; fallback
legado por `x-mcp-session`; senão 401.

---

## 3. Protocolo MCP — `dist/mcp-server.js`

- `buildServer({ label, token, visibleTools, callableTools })` instancia um MCP server
  **efêmero por request**.
- Registra `ListToolsRequestSchema` (lista tools visíveis) e `CallToolRequestSchema`
  (valida args com `inputSchema.safeParse`, chama `handler`, audita).
- Saída passa por `sanitizeOutgoingDeep` (remove segredos).
- `PUBLIC_CALLABLE_MCP_TOOLS` = vazio (nada é chamável sem OAuth).

---

## 4. OAuth + sessões — `dist/oauth.js`, `dist/sessions.js`

- OAuth 2.1 com **Dynamic Client Registration**; ponte pro GitHub (`/login/oauth/authorize`).
- Allowlist de logins via `MCP_ALLOWED_GH_LOGINS`.
- Store **persistente** em `secrets/mcp-state.json` (perms 0600, escrita debounced):
  clients, authCodes (TTL 5min), accessTokens, refreshTokens, sessions (legado).

---

## 5. Catálogo de tools — `dist/tools/core/tools-catalog.js`

Junta os arrays de cada módulo em `RAW_TOOLS`, filtra por shape válido (`ALL_TOOLS`) e gera
`CATALOG_VERSION = "<count>-<hash>"`. O `/health` expõe essa versão (detecta cache velho no
cliente).

**Shape de uma tool** (padrão a seguir SEMPRE):
```js
{
  name: "minha_tool",                 // [a-zA-Z0-9_-]{1,64}, único
  description: "O que faz, quando usar.",
  annotations: { readOnlyHint, destructiveHint, idempotentHint, openWorldHint, title },
  inputSchema: z.object({ ... }),     // Zod — validado antes do handler
  handler: async (input, ctx) => {    // ctx.token = token GitHub resolvido
    return { content: [{ type: "text", text: "..." }] };
  },
}
```

Módulos em `dist/tools/`: `github/` (read/write/admin/tools), `vps/` (files/run-once/lazy),
`consciencia/`, `pendencias/`, `aprendizado/`, `skills/`, `supabase/`, `deploy/`, `elite/`,
`painel/`, `core/` (admin/diagnostics/policy), `pivete/`, `integrations.js`,
`code-reviewer.js`, e **`cognitivo/`** (as 4 tools cognitivas — ver `TOOLS-COGNITIVAS.md`).

---

## 6. Por que NÃO há `src/` — e como reconstruir

O módulo **não tem código-fonte TypeScript versionado**: só o `dist/` compilado, que era
gitignored e é a única cópia viva. Em 30/06/2026 o `dist/` passou a ser versionado (ver o
`.gitignore` local) para eliminar o risco de perda.

**Reconstrução futura do `src/` (etapa planejada):** espelhar a árvore do `dist/` em
TypeScript (cada `.js` → `.ts`), validar que `tsc` recompila para um `dist/` equivalente,
rodar testes, e então passar a editar o `src/`. O `package.json` já aponta `build: tsc` e
`dev: tsx watch src/index.ts` — só falta o `src/` existir.

**Rodar localmente:** `npm install` → (hoje) `npm start` (`node dist/index.js`). Precisa do
`.env` com `GITHUB_CLIENT_ID`, `GITHUB_OAUTH_CALLBACK`, `MCP_SESSION_SECRET`, etc.

---

## 7. Segurança (resumo)

- `.env`, `node_modules`, `logs`, `*.map`, `*.bak*` fora do Git.
- Saída sanitizada (IPs, chaves, tokens, paths `/root/...`).
- Log auditado por chamada em `audit-logger.js` (perms 0600, redação de segredos).
- Ações sensíveis (PM2, deploy, escrita) exigem autorização explícita.
