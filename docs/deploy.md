<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Deploy — MultiZap

## Fluxo automático

```
Push na main → GitHub webhook → VPS pull → post-deploy.sh
  → Build frontend
  → Restart serviços PM2
  → Sync conexões WuzAPI
  → Migrations Supabase (via GitHub Actions)
```

## Serviços PM2

| Processo | Função |
|----------|--------|
| MultiZap-Gateway | Gateway WhatsApp (:3100) |
| CloneDeck-GitHub-Webhook | Webhook deploy (:9003) |
| CloneDeck-Receiver | Webhook receiver (:5000) |
| CloneDeck-Supabase-Sync | Sync WuzAPI→Supabase |
| MultiZap-TelegramBot | Bot Telegram |
| CloneDeck-CRM | Preview/SSR CRM (:3010) |

## Domínios (Caddy)

```
multizap.dev       → /apps/web/dist
bot.multizap.dev   → /apps/bot/dist
crm.multizap.dev   → CloneDeck-CRM (:3010)
hook.multizap.dev  → :9003
proxy.multizap.dev → :3100
```

## Migrations

```
infra/supabase/migrations/YYYYMMDDHHMMSS_descricao.sql
```

Aplicadas automaticamente pelo GitHub Actions após merge na main.

## Rotas Caddy dos apps

`post-deploy.sh` executa `scripts/fix-caddy-ssl.sh` para manter `multizap.dev`, `bot.multizap.dev`, `crm.multizap.dev` e `proxy.multizap.dev` alinhados. O CRM usa porta isolada `3010` para evitar conflito com serviços legados na porta 3000.
