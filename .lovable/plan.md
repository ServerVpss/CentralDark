## Objetivo
Fechar o desacoplamento total: as 39 edge functions rodam **dentro do teu Supabase (lyoig)**, com todos os secrets replicados, e os webhooks externos apontando pro domínio novo.

## Passo 1 — Localizar credenciais na VPS (autônomo)
Rodar na VPS via `vps_run_once_script` uma varredura **read-only** em `/root/CentralDark/secrets/` e `/root/CentralDark/.env*` procurando:

- `SUPABASE_ACCESS_TOKEN` (token `sbp_...` da Management API, obrigatório pro CLI)
- Confirmação de que `HUB_SUPABASE_SERVICE_ROLE_KEY`, `HUB_SUPABASE_DB_URL` batem com o que já tenho nos secrets do Lovable
- Presença do CLI `supabase` (`which supabase`)

Se o `SUPABASE_ACCESS_TOKEN` não existir na VPS, aí sim eu abro o form seguro pra você colar uma vez. Sem esse token, o CLI não deploya.

## Passo 2 — Preparar staging na VPS
Script na VPS que:

1. Cria pasta temporária `/root/CentralDark/deploy-hub-fns/`.
2. Faz `git pull` do repo `CentralDark` (que tem o `supabase/functions/` atualizado com refs `HUB_*`).
3. Roda `supabase link --project-ref lyoigsqluyktoclwdaft` usando o access token.
4. Valida com `supabase functions list` que conecta no projeto certo.

## Passo 3 — Injetar secrets no HUB (paralelo, enxame)
Antes de deployar, popular os secrets no Supabase novo. Uso `supabase secrets set` em lote. Lista mínima obrigatória:

- **Consultas/APIs**: `CONSULTAS_API_KEY`, `ISEEK_API_KEY`, `ISEEK_API_BASE`
- **Pagamento**: `EFI_CLIENT_ID`, `EFI_CLIENT_SECRET`, `EFI_PIX_KEY`
- **Telegram**: `TELEGRAM_API_KEY` (via connector — leio via gateway)
- **Cloudflare**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CF_API_TOKEN`
- **GitHub**: `GH_TOKEN`, `GITHUB_TOKEN`, `GH_APP_*`, `GITHUB_CLIENT_*`
- **Notion**: `NOTION_API_TOKEN`
- **VPS**: `VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE`, `VPS_SSH_KEY_LOVABLE`, `VPS_REPO_PATH`
- **Vault/Internos**: `VAULT_MASTER_KEY`, `MCP_SESSION_SECRET`, `AGENT_LOG_SECRET`, `NOTIFY_API_KEY`, `PM2_ALLOWED_RESTART`, `LOG_LEVEL`, `LOG_DIR`
- **Lovable AI Gateway**: `LOVABLE_API_KEY` (pra função `ai-proxy` continuar funcionando)

Puxo os valores atuais do ambiente do sandbox (todos já estão como env vars) e envio via `supabase secrets set --project-ref lyoig`. Total: ~30 secrets.

## Passo 4 — Deploy das 39 funções no HUB (enxame paralelo)
Script paralelo na VPS deployando em 3 lotes simultâneos (via `&` + `wait`):

- **Lote A** (13 funções — consultas/painel): `api-query`, `admin-users`, `agent-log`, `dev-test-modules`, `graph-data`, `graph-mapper`, `hub-services-check`, `health-check`, `module-health-calc`, `provider-ping`, `receive-graph-run`, `data-backup`, `plugin-release`.
- **Lote B** (13 funções — Telegram): `telegram-bot`, `telegram-webhook`, `telegram-format-result`, `telegram-payment-handler`, `telegram-retry-queue`, `telegram-unmute-user`, `telegram-update-group-photo`, `auto-unmute-active-subscribers`, `bot-telegram-proxy`, `fake-engagement`, `scheduled-broadcasts`, `test-message-effect`, `notify-telegram`.
- **Lote C** (13 funções — pagamento/infra): `efi-check-status`, `efi-generate-pix`, `efi-poll-pending`, `efi-register-webhook`, `efi-webhook`, `misticpay-generate-pix`, `misticpay-verify`, `misticpay-webhook`, `pix-payment`, `vault`, `vps-exec`, `mcp-call`, `mcp-status-notify`, `mcp-status-proxy`, `ponte-mcp`, `ponte-mcp-admin`, `ponte-mcp-oauth-github`, `webapp-format-ai`, `webapp-get-result`, `generate-pdf`, `notify-event`, `notify-self-test`, `ai-proxy`.

Cada `supabase functions deploy <nome> --project-ref lyoig --no-verify-jwt` (quando aplicável). Log em `/root/CentralDark/deploy-hub-fns/deploy.log`.

`migrar-auth-users` **não deploya no HUB** (é migração de origem→destino, faz sentido só no Lovable).

## Passo 5 — Smoke test das funções no HUB
Curl em 5 funções críticas direto no domínio novo:

- `https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/health-check`
- `.../ai-proxy` (POST com prompt teste)
- `.../telegram-webhook` (GET → 405 esperado, prova que subiu)
- `.../efi-check-status` (GET status)
- `.../admin-users` (401 esperado sem auth)

Relatório em `/mnt/documents/hub-fns-smoke.md`.

## Passo 6 — Virada dos webhooks
Só depois dos passos 1-5 OK:

- **Telegram** (todos os bots ativos em `telegram_bots`): loop chamando `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/telegram-webhook`. Pego os tokens da tabela `telegram_bots` no HUB.
- **EFI Pay**: invocar `efi-register-webhook` direto no HUB pra ele registrar a URL nova na EFI.
- **MistcPay**: se tiver endpoint de update de webhook (função `misticpay-webhook`), disparo — senão registro na doc pra você fazer manual no painel deles.

Log da virada em `/mnt/documents/webhooks-flip.md` com URL antiga → URL nova por bot/gateway.

## Passo 7 — Publish do frontend
`preview_ui--publish` pra que o frontend refatorado (já apontando pro HUB) vá pro ar em `centraldark.lovable.app`. A partir daqui, usuário final conversa 100% com o teu Supabase.

## Enxame (Swarm Mode oficial)
Uso 3 `spawn_agent` em paralelo:

- **Agente Auditor** (fast): confere se os 30 secrets estão realmente disponíveis como env vars antes de tentar setar, gera lista final.
- **Agente Deploy** (capable): monta o script de deploy paralelo e valida output.
- **Agente Validador** (fast): roda os smoke tests e formata o relatório.

Eu (main) coordeno e disparo os scripts na VPS.

## Rollback (se algo dos passos 4-6 falhar)
- Frontend já publicado aponta pro HUB via `hub-client.ts`. Se as funções no HUB não subirem direito, reverto o hub-client.ts pra apontar temporariamente pras functions no projeto Lovable (que continuam operacionais). URL do frontend x URL das functions são independentes.
- Webhooks: mantenho um script `webhooks-revert.sh` pronto que aponta tudo de volta pra `kagejpg`.

## O que preciso saber ANTES de executar
Só uma confirmação binária:

**"Vai" ou "Não vai"** — se aparecer que falta o `SUPABASE_ACCESS_TOKEN` na VPS, eu abro o form seguro no meio do processo pra você colar (é o único ponto humano; todo o resto rodo sozinho com os secrets que já tenho).

## Regras seguidas
✅ Método Gamificado no relatório final  
✅ Autonomia de secrets (não pedi permissão pra usar HUB_*)  
✅ Swarm Mode (3 sub-agentes paralelos)  
✅ PT-BR em tudo  
✅ Autoridade VPS + PM2 (posso rodar deploy script sem OK)  
✅ Nada destrutivo em `/root/` fora de `/root/CentralDark/`
