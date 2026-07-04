# PIVETE-16 · SECRETS & CONNECTORS

⚠️ **Nunca expor valores.** Este arquivo lista **só os nomes** dos secrets e connectors que o pivete pode usar via MCP/Gateway. Os valores vivem em Lovable Cloud (secret manager) e/ou `/root/CentralDark/secrets/` na VPS.

## Secrets Lovable Cloud (agrupados)

### Supabase (Lovable atual + HUB)
- `SUPABASE_URL` · `SUPABASE_ANON_KEY` · `SUPABASE_PUBLISHABLE_KEY` · `SUPABASE_PUBLISHABLE_KEYS` · `SUPABASE_SERVICE_ROLE_KEY` · `SUPABASE_JWKS` · `SUPABASE_SECRET_KEYS` · `SUPABASE_DB_URL`
- `HUB_SUPABASE_URL` · `HUB_SUPABASE_ANON_KEY` · `HUB_SUPABASE_SERVICE_ROLE_KEY` · `HUB_SUPABASE_DB_URL` · `HUB_SUPABASE_PROJECT_REF` · `HUB_SUPABASE_PAT`

### Telegram
- `TELEGRAM_API_KEY` (managed por connector — Central `@srver1bot`)
- `TELEGRAM_APP_API_ID` · `TELEGRAM_APP_API_HASH`
- `TELEGRAM_ADMIN_CHAT_ID` (`1901426549`)
- `TELEGRAM_STATUS_CHANNEL_ID` (`-1003669176367`)

### GitHub
- `GITHUB_TOKEN` · `GH_TOKEN`
- `GH_APP_TOKEN` · `GH_APP_CLIENT_ID` · `GH_APP_CLIENT_SECRET` · `GH_APP_OWNER` · `GH_APP_REPO`
- `GITHUB_CLIENT_ID` · `GITHUB_CLIENT_SECRET` · `GITHUB_OAUTH_SCOPES` · `GITHUB_OAUTH_CALLBACK`
- `GITHUB_OWNER` · `GITHUB_REPO`

### Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` · `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_EMAIL` · `CLOUDFLARE_GLOBAL_API_KEY` · `CF_API_TOKEN`

### EFI / PIX
- `EFI_CLIENT_ID` · `EFI_CLIENT_SECRET` · `EFI_PIX_KEY`

### VPS / SSH
- `VPS_HOST_LOVABLE` · `VPS_USER_LOVABLE` · `VPS_SSH_KEY_LOVABLE` · `VPS_REPO_PATH`

### APIs de consulta (bot)
- `ISEEK_API_BASE` · `ISEEK_API_KEY` · `CONSULTAS_API_KEY`

### Cofre / segurança interna
- `VAULT_MASTER_KEY` · `MCP_SESSION_SECRET` · `CENTRALDARK_MCP_SESSION` · `AGENT_LOG_SECRET`

### AI / MCP
- `LOVABLE_API_KEY` (managed — rotate via tool próprio)
- `WEBUI_LOVABLE_KEY`
- `PM2_ALLOWED_RESTART`

### Notificação / notion
- `NOTIFY_API_KEY` · `NOTION_API_TOKEN`

### Diagnóstico
- `LOG_DIR` · `LOG_LEVEL`

## Connectors ativos (3)

### CentralDark (custom · `mcp_custom_4aHUa`)
**~120 tools.** Categorias principais:
- `github_*` (40+) — repos, PRs, issues, workflows, commits, secrets names, releases
- `vps_*` (7) — status, diff, read/write file safe, list dir, tree, run-once script
- `mcp_admin_*` (6) — catalog, status, call dispatcher, policy, audit logs
- `linear_*` (5) — issues, equipes, ciclos
- `notion_*` (4) — buscar, ler, criar, anexar
- `sentry_*` (4) — listar, detalhe, resolver, status credenciais
- `supabase_*` (4) — projects, project_status, schema_check, contacts_check
- `elite_gateway_*` (3) — chat com Fabler, status, logs
- `gemini_*` (2) — analisar, status
- `pendencias_*` (3) — list, add, close
- Conscienciais: `ler_consciencia`, `atualizar_consciencia`, `puxar_aprendizados`, `registrar_aprendizado`, `consolidar_pensamento`, `consultar_memoria_reserva`, `analise_de_estado_cognitivo`, `injetar_consciencia_centraldark`, `skill_listar/instalar/status/atualizar`
- Operacionais: `execute_command`, `search_files`, `read_file`, `deploy_status`, `atualizar_painel`, `code_reviewer`

### Linear (`mcp_linear_y6ixo`)
~40 tools de projeto: issues, ciclos, docs, releases, milestones, teams, users, comments, attachments.

### Notion (`mcp_notion_a9vlA`)
~15 tools de doc: search, fetch, create pages/databases/attachments, update, move, duplicate, comments.

## Como o pivete usa

### Chamada via WebUI → gateway → MCP local
```
POST https://api.centralldark.com/pivete/mcp/call/<tool>
Body: {"input": {...}}
```

### Chamada direta (dev/debug)
Via `mcp_custom_4aHUa--mcp_admin_call` no próprio Lovable.

### Regra de segurança
- Nunca copiar valor de secret pra prompt/log/arquivo.
- Sempre referenciar pelo **nome** (o backend resolve).
- Se ver `@secret:NOME` em mensagem → já tá salvo, nunca pedir de novo.

## Como sync com o HUB
- Secrets **não** viajam pro HUB Supabase. Ficam locais.
- A tabela `hub.pivete_consciencia` guarda **apenas os 17 arquivos .md**.
- Cron `pivete-sync` (PM2) roda a cada 5min.
