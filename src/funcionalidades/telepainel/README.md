# telepainel — Painel administrativo do bot Telegram

**Destino na VPS:** `/root/CentralDark/apps/modulos/telepainel/`

Status: ✅ **Produto real, em produção.**

É o módulo mais robusto do ecossistema. Cuida do bot de consultas no Telegram, planos/assinaturas, pagamentos PIX, analytics, segurança, broadcasts, backup, e por aí vai.

## Rotas

A landing pública (`/telepainel`) é aberta. Tudo abaixo de `/telepainel/*` exige login; rotas marcadas com 🔒 exigem `role=admin`.

| Rota | Página | Acesso |
|---|---|---|
| `/telepainel` | `LandingTelePainel` | Público |
| `/telepainel/dashboard` | `Index` | Logado |
| `/telepainel/consultas` | `Consultas` | Logado |
| `/telepainel/bots` | `Bots` | 🔒 Admin |
| `/telepainel/bots/:botId/settings` | `BotSettings` | 🔒 Admin |
| `/telepainel/bots/:botId/migrate` | `MigrateSubscriptions` | 🔒 Admin |
| `/telepainel/telegram-users` | `TelegramUsers` | 🔒 Admin |
| `/telepainel/logs` | `QueryLogs` | 🔒 Admin |
| `/telepainel/plans` | `Plans` | 🔒 Admin |
| `/telepainel/pix` | `PixTransactions` | 🔒 Admin |
| `/telepainel/settings` | `Settings` | 🔒 Admin |
| `/telepainel/security` | `Security` | 🔒 Admin |
| `/telepainel/audit` | `SubscriptionAudit` | 🔒 Admin |
| `/telepainel/menu-tips` | `MenuTips` | 🔒 Admin |
| `/telepainel/database` | `DatabaseInfo` | 🔒 Admin |
| `/telepainel/status` | `Status` | 🔒 Admin |
| `/telepainel/teste-modulos` | `TesteModulos` | 🔒 Admin |
| `/telepainel/usuarios-painel` | `UsuariosPainel` | 🔒 Admin |
| `/telepainel/usuarios-painel/:id` | `UsuarioPerfil` | 🔒 Admin |

## Componentes próprios (`components/`)

`admin`, `backup`, `bots`, `consultas`, `consultation`, `dashboard`, `devops`, `gamification`, `landing`, `payments`, `pix`, `search`, `security`, `settings`, `webapp`.

Esses só são usados aqui dentro. Coisas reutilizáveis (UI shadcn, layout, auth, theme, transitions, pwa) ficam em `src/shared/`.

## Backend

- **Edge functions** (em `supabase/functions/`): webhook do Telegram, geração de PIX, broadcasts, analytics, ping de providers, etc.
- **Tabelas principais**: `bots`, `bot_settings`, `telegram_users`, `subscriptions`, `query_logs`, `pix_transactions`, `api_providers`, `user_roles`.
- **Realtime**: várias telas usam Supabase Realtime pra atualização ao vivo.

## Dependências externas

- Telegram Bot API
- Provedor PIX (EFI via proxy PHP mTLS)
- Mercado Pago, Binance Pay (opcionais)
- VeiculosAPI / iSeek (consultas)

## Como instalar / atualizar na VPS

1. Build do projeto inteiro: `bun run build` (na raiz do repo).
2. Copiar a pasta `dist/` correspondente pra `/root/CentralDark/apps/modulos/telepainel/dist/`.
3. Caddy serve direto a partir de `dist/` no domínio configurado.
4. Edge functions são deployadas pelo Lovable Cloud automaticamente.

> Detalhes completos no `docs/INSTALADOR/`.
