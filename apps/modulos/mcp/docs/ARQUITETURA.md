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
- Saída sanitizada (IPs, chaves, tokens, paths `<caminho-vps>`).
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


---

## 9. Dispatcher admin: classificação interna e resultado bloqueado

**Contrato vigente (2026-10-24):** a anotação MCP `destructiveHint` é uma dica estática apresentada ao cliente, não é o guard de autorização. `mcp_admin_call` permanece não-read-only (`readOnlyHint=false`), mas sua dica externa `destructiveHint=false` evita que toda chamada — inclusive leituras — seja tratada como destrutiva pela interface. O dispatcher continua resolvendo a ferramenta interna, validando os argumentos e passando cada operação destrutiva pelo guard canônico; isso não concede permissão às ferramentas internas por si só.

`execute_command` continua marcado como destrutivo no catálogo público e não é exposto como capacidade read-only. Apenas dentro do dispatcher, um classificador de allowlist exata aceita os seguintes comandos semânticos de leitura: `hostname`, `pwd`, `git status`, `git status --short`, `git log --oneline`, `git log --oneline -n 1..50`, `ls`, `ls -l` e `echo` com literal simples limitado. Shell composto, expansão, redirecionamento, glob, comando com caminho/argumentos fora da lista e qualquer entrada não reconhecida permanecem destrutivos e seguem o guard. A classificação também é usada na preflight do dispatcher; um `readOnlyHint` conflitante com `destructiveHint=true` não libera a operação.

A proveniência aceita em contexto é uma lista fechada: `verified_oauth_admin` ou `verified_hub_admin`, somente quando fornecida pelo servidor/rota autenticada. Qualquer valor diferente vira `null`; argumentos do cliente não podem fabricar essa procedência.

O envelope causal lê o resultado interno dentro do `content` JSON legado. Quando o handler declara `executionStatus=blocked`, `decision=blocked` ou um status explícito de bloqueio, o envelope externo registra `state=BLOCKED`, `ok=false` e `error_state=BLOCKED`. O logger preserva `status=BLOCKED` em vez de converter um bloqueio funcional em `PASS`; falhas de aplicação não classificadas como bloqueio resultam em `ERROR/FAIL`. A semântica MCP de `isError` continua separada do resultado da operação.

**Owner / rastro**

```text
@owner=apps/modulos/mcp
@code_ref=apps/modulos/mcp/src/tools/core/mcp-admin.js, apps/modulos/mcp/src/tools/vps/vps-lazy.js, apps/modulos/mcp/src/mcp-server.js, apps/modulos/mcp/src/tool-result-envelope.js, apps/modulos/mcp/src/audit-logger.js
@last_updated=2026-10-24T07:49:48.830Z
@estado=IMPLEMENTADO_NA_BRANCH_FIX_MCP_ADMIN_CONFIRMATION_LOOP
@pendente=TARGETED_CI_AND_PR_READBACK
@next_cursor=VERIFY_TESTS_SAME_HEAD_THEN_RECONCILE_RUNTIME_SEPARATELY
```

O teste direcionado é `npm run test:admin-confirmation` dentro de `apps/modulos/mcp`. A mudança é apenas fonte/contrato em branch de PR: não reinstala nem reinicia o serviço, não altera a VPS suja e não afirma que o runtime já consome o novo SHA.
