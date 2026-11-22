# 01 — Arquitetura

> Preencher conforme cada componente for revisado. Esta página é o mapa do sistema vista de cima.

## Componentes principais (estado conhecido em 2026-06-03)

| Componente | Pasta no repo | Pasta na VPS | Função |
|---|---|---|---|
| `apps/clone-deck` | `apps/clone-deck` | `/root/Multizap/apps/clone-deck` | Frontend principal (este projeto Lovable) |
| `apps/bot` | `apps/bot` | `/root/Multizap/apps/bot` | Bot WhatsApp (PM2) |
| `apps/crm` | `apps/crm` | `/root/Multizap/apps/crm` | CRM multicanal |
| `apps/portal` | `apps/portal` | `/root/Multizap/apps/portal` | Portal |
| `apps/web` | `apps/web` | `/root/Multizap/apps/web` | Landing page |
| `api/gateway` | `api/gateway` | `/root/Multizap/api/gateway` | Gateway de APIs |
| `api/whatsapp/qrcode` | `api/whatsapp/qrcode` | mesmo | Geração QR Code |
| `api/webhooks` | `api/webhooks` | mesmo | Endpoints de webhook |
| `api/integrations` | `api/integrations` | mesmo | Conectores externos |
| WuzAPI | (externo, Docker) | `/root/Multizap/wuzapi` | API WhatsApp em Docker |
| Caddy | (sistema) | `/etc/caddy/Caddyfile` | Reverse proxy + TLS |
| Webhook listener | (sistema) | `webhook.service` (porta 9000) | Recebe push do GitHub |
| Cron `gh-pull` | (sistema) | `/usr/local/bin/gh-pull` a cada 5min | Backup do webhook |
| Supabase Sync | `apps/bot/...` | PM2 `CloneDeck-Supabase-Sync` | Sincroniza conexões com tabela `whatsapp_connections` |
| Telegram Bot | `apps/bot/...` | PM2 `MultiZap-TelegramBot` | Bot operacional Telegram |

## Fluxo de deploy

```
Lovable (edição) ──commit──▶ GitHub (main)
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
          webhook.service                cron */5min gh-pull
          (instantâneo, hoje              (sempre, fallback)
           QUEBRADO — porta
           9000 vs 9002 Caddy)
                  │                               │
                  └───────────► git pull ◀────────┘
                                     │
                              post-deploy.sh
                                     │
                              PM2 restart serviços alterados
```

## Pendência ativa

Webhook instantâneo está com porta errada no Caddy (9002 → deveria ser 9000). Hoje o sistema fica sincronizado apenas via cron de 5min. Pendência registrada em `docs/PENDENCIAS.md`.
