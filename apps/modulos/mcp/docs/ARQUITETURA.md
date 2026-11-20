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

---

## 8. Tool Call Lens — observabilidade sem criar outra verdade

A interface de uma IA pode mostrar blocos de **tool call**, e um adaptador local pode expandir
esses blocos para facilitar leitura. Isso é uma **projeção visual**. Não é a autoridade da
execução.

O MCP já possui o trilho certo para transformar esse sinal em telemetria nativa da Casa:

```text
TOOL CALL
   │
   ├── UI / DOM / bookmarklet         → visualização observada
   │
   └── MCP CallToolRequestSchema
          → auditToolExecution(...)
          → audit-logger.js
          → log sanitizado
          → observabilidade ao vivo / receipt
          → CentralDark App / Obsidian / painel
```

Regras de autoridade:

```text
DOM_UI_OBSERVED          != EXECUTION_PROVEN
SCREENSHOT_OBSERVED      != EXECUTION_PROVEN
AUDIT_EVENT_RECORDED     = EXECUTION_BOUNDARY_OBSERVED
RECEIPT_MATCHED          = PROOF_FOR_THE_MATCHED_CLAIM
CENTRALDARK_APP_VIEW     = DERIVED_PROJECTION
OBSIDIAN_GRAPH_VIEW      = DERIVED_PROJECTION
UNKNOWN                  != PASS
```

`audit-logger.js` é o ponto de captura da execução MCP porque registra `method`, `toolName`,
entrada, resultado, duração, `exitCode` e `ok`, passando pelo mesmo mecanismo de redação de
segredos. A rota administrativa existente `/admin/logs/stream` fornece um canal SSE de
observabilidade ao vivo. Nenhuma UI precisa raspar HTML para virar fonte da verdade.

Uma projeção de Tool Inspector pode reutilizar os eventos existentes e apresentar, quando os
campos estiverem disponíveis:

```text
🔧 TOOL
🟢|🔴 RESULTADO
⏱ DURAÇÃO
📥 INPUT SANITIZADO
📤 OUTPUT SANITIZADO
🔒 readOnlyHint / destructiveHint / openWorldHint / idempotentHint
🎯 mission_id / correlation_id
🧾 receipt_ref
```

Modos de visualização recomendados, todos sobre a mesma telemetria:

```text
👁 AO_VIVO            → eventos entrando em ordem temporal
🧠 POR_MISSAO         → várias calls comprimidas sob um mission/correlation id
🔎 FORENSE            → entrada + saída + duração + erro + receipt + proveniência
```

O bookmarklet/DOM continua útil como **adaptador de visão** quando a interface externa esconde
blocos ou quando uma chamada não atravessa o MCP CentralDark. Nesses casos o evento deve ficar
rotulado como `UI_OBSERVED` até existir correlação com audit/receipt. Mudar o HTML do provedor
pode quebrar o adaptador visual sem quebrar o sistema de prova.

Integração arquitetural correta:

```text
DOM            = VISÃO
MCP AUDIT      = FATO OBSERVADO NA FRONTEIRA DE EXECUÇÃO
SCREENPIPE     = MEMÓRIA VISUAL
RECEIPT        = PROVA DO CLAIM CORRELACIONADO
CENTRALDARK APP= PAINEL/HUD
OBSIDIAN/GRAFO = PROJEÇÃO NAVEGÁVEL
```

Isso **não cria um segundo cérebro, dispatcher ou barramento**. Reutiliza `auditToolExecution`,
`audit-logger.js`, o stream administrativo já existente e as superfícies visuais existentes.
Qualquer evolução deve preservar `REUSE_BEFORE_CREATE`, `ONE_SYSTEM_ONLY`, sanitização,
autorização e a regra de que representação visual não substitui realidade medida.


## Receita e readback — 2026-10-17

O mapeamento integral Desktop Commander → auditoria MCP → Tool Call Lens → Cockpit, com os dois perfis systemd, a matriz de owners, a fronteira entre chamada externa e audit interno, testes, botões, PID/CID, gates e rollback, está registrado em [`2026-10-17-TOOL-CALL-LENS-DESKTOP-COMMANDER-RECEITA.md`](../../../../docs/CONSCIENCIA/RECEIPTS/2026-10-17-TOOL-CALL-LENS-DESKTOP-COMMANDER-RECEITA.md).

SOURCE_COMMITTED nos PRs #1842 e #1838 não é prova de runtime instalado.


## Convergência do `mcp-admin-ui` legado — 2026-11-07

**Owner técnico preservado:** `apps/modulos/mcp/`; endpoints OAuth, `/api/mcp`, audit-logger, SSE, logs, catálogo e políticas não são movidos. **Único owner visual:** `apps/instinto-superior/` (PR #1946, commit `922e1c6`).

| Capacidade do frontend independente | Destino canônico ou descarte justificado |
| --- | --- |
| `AuditTab` (consultas a `/admin/api/logs`) | `ObservabilidadeCentralDark.tsx` → Tool Call Lens, Central de Logs; filtragem backend `cid/rota/level/q` continua em `src/admin.js` |
| `OperationalHud` (timeline de amostra e botões sem handlers) | Instinto Superior: observabilidade real; **não** copiar timeline estática ou simular botões funcionais |
| `ToolsTab`, `MetricCard`, `OverviewTab` | `McpAdminIntegrado.tsx` + `McpConsoleCentralDark.tsx`; apenas métricas observadas, nunca `tools ativas = total` presumido |
| `ConnectorTab` | `McpConsoleCentralDark.tsx` documenta `https://mcp.centralldark.com/api/mcp`; snippets legados `/mcp` não são reintroduzidos |
| OAuthClientsTab e KeysTab | DCR /register é real, mas não há listagem de clientes; emissão por POST /admin/api/issue-key já existe no src/oauth.js:handleIssueKey com senha do admin; formulário/cópia temporária migrados ao McpConsoleCentralDark.tsx; listagem e revogação continuam não implementadas |
| `App`, páginas Login/Admin, componentes visuais e configuração Vite | Casca/entrada Admin únicas do Instinto Superior; sem servidor ou login duplicado |

**Condição de prova:** retirada do source em branch/commit não comprova deploy; E2E OAuth 404 e captura de Commander externo permanecem independentes. Preservar os recibos/lembranças históricas e validar consumidores antes de remover o diretório físico de checkouts divergentes. `UNKNOWN != PASS`.


### Migração fiel de capacidades antigas — 2026-11-07

Os componentes do aplicativo mcp-admin-ui existem desde julho de 2026. Os commits de setembro ampliaram o HUD, e o PR #1946 de outubro consolidou a superfície no Instinto Superior. Um botão/aba antigo não prova efeito real. Cada componente foi confrontado com o backend de apps/modulos/mcp/ e com o owner visual apps/instinto-superior/.

| UI, botão ou capacidade legada | Owner visual ou técnico existente | Estado de equivalência |
| --- | --- | --- |
| LoginPage, Entrar | McpConsoleCentralDark.tsx → POST /admin/login; cookie HTTP-only do MCP | Código integrado; autenticação pública E2E pendente |
| AdminPage Atualizar / atualização a cada 30 segundos | McpConsoleCentralDark.tsx e McpResumoVivo → /health, /health/deep e /admin/api/tools | Código integrado; runtime pendente |
| AdminPage Sair | McpConsoleCentralDark.tsx → /admin/logout e leitura protegida para contraprova de 401 | Código integrado; runtime pendente |
| Status, total de tools, ativas, bloqueadas, uptime e versão | McpResumoVivo no Instinto Superior | Seis cartões; ativas/bloqueadas NÃO MEDIDO, sem replicar números fictícios |
| ToolsTab: categorias, contagem, nome, descrição e filtro | McpFerramentasPorCategoria → /admin/api/tools | Código integrado; tool listada não prova execução |
| AuditTab: rota, CID, nível, texto, Buscar e Limpar | McpAuditoriaFiltrada e adminBuscarLogs; filtro usa cid ou correlation_id | Código integrado; audit buffer limitada |
| Tool Call Lens: calls, duração, correlação, PASS/FAIL, pausa, revisão | ObservabilidadeCentralDark.tsx, audit-logger.js, admin.js e SSE/Admin existentes | MCP nativo instrumentado; chamadas diretas ao Commander externo ainda não entram automaticamente |
| ConnectorTab: Claude Desktop, Cursor, Codex, outros, Copiar | McpConector, endereço canônico HTTPS com /api/mcp | Código integrado; exemplos não substituem teste de cliente |
| OAuthClientsTab | Descoberta OAuth no servidor + aviso de DCR sem API de listagem | Não simular clientes; listagem ainda ausente |
| KeysTab: Nova chave, token acesso, refresh, descartar | McpEmissaoChave → POST /admin/api/issue-key com senha explícita | Emissão existente exposta; listagem e revogação ausentes |
| OverviewTab: ligação OAuth e conectores | McpConsoleCentralDark.tsx, OAuth no src/oauth.js e Cockpit /mcp-autorizar | Entrada GitHub antiga não reativada: handleOAuthStart retorna 410; OpenAI legado era desabilitado |
| OperationalHud: snapshot, semáforo e sinal Hermes por estado | McpOperacionalLegado e ObservabilidadeCentralDark.tsx | Projeção com dados; movimento do Hermes não é prova de execução |
| OperationalHud: linha do tempo demonstrativa | Tool Call Lens e logs nativos substituem demonstração | Timeline fixa não é histórico real e não foi reproduzida como telemetria |
| Seis botões sem handler do OperationalHud | Expostos desabilitados, com ausência de execução declarada | Não criar executor falso nem declarar funcionalidade inexistente |
| Casca, tabs, componentes de estilo e roteamento React separados | Instinto Superior = único owner visual; apps/modulos/mcp = owner técnico | Remoção versionada no PR #1996 após testes, sem apagar receitas/histórico |

Critério para HAKAI: testes de sintaxe, tipagem, suíte do cone, comparação com os owners e readback de runtime; nenhuma aplicação antiga pode ser declarada dispensável apenas porque uma tela parece equivalente. PR/MERGED != DEPLOYED; F DIRTY não autoriza reset/clean; OAuth público 404 e tool calls externos são pendências independentes.
