# 03 — Portas e rede

> Toda nova porta usada pelo sistema entra aqui. Sem isto, o instalador não sabe o que liberar nem o que validar.

## Portas externas (expostas via Caddy)
| Porta | Protocolo | Serviço |
|---|---|---|
| 80 | HTTP | Caddy (redirect para 443) |
| 443 | HTTPS | Caddy (todas as rotas) |

## Portas internas (loopback 127.0.0.1)
| Porta | Serviço PM2 | Repo / função |
|---|---|---|
| 3000 | `CloneDeck-CRM` | CRM (proxy de `crm.multizap.dev`) |
| 3100 | `MultiZap-Gateway` | gateway do clone-deck (proxy raiz de `proxy.multizap.dev`) |
| 9000 | `webhook` (binário Go) | hook do `whatsapp-server` — NÃO mexer |
| 9001 | `github-webhook` | hook do Recargas — NÃO mexer |
| 9002 | `MultiZap-GitHub-Webhook` | hook do repo `segredounlock/atendimentoo`, rota `proxy.multizap.dev/webhook` |
| 9003 | `webhook-bot` | **hook do clone-deck** — rota `hook.multizap.dev/webhook` ← é onde o GitHub do clone-deck bate |
| 9100 | `MCP-CentralDark` | MCP em `mcp.centralldark.com` |

## Rotas Caddy do webhook clone-deck (camada 1 do deploy)
```
hook.multizap.dev {
  reverse_proxy 127.0.0.1:9003
}
```

## Deploy em 3 camadas (redundância)
1. **Webhook GitHub→VPS (~5s):** GitHub bate em `hook.multizap.dev/webhook` → `webhook-bot` (9003) → `scripts/clone-deck-gh-pull-with-deploy.sh` → `scripts/post-deploy.sh`.
2. **GitHub Actions fallback (~40s):** `.github/workflows/deploy-fallback.yml` espera 30s e roda o mesmo script via SSH idempotente usando `VPS_SSH_KEY_LOVABLE` reconstruída em `/tmp/vps_key` (mesmo padrão do `setup-vps-ssh.sh`).
3. **Cron 1 min:** `* * * * * /root/Multizap/apps/clone-deck/scripts/clone-deck-gh-pull-with-deploy.sh` (com `flock`, idempotente).

## Domínios
| Domínio | Rota |
|---|---|
| `multizap.dev` | site estático `/var/www/multizap/dist` |
| `bot.multizap.dev` | site estático `apps/bot/dist` |
| `crm.multizap.dev` | proxy → 3000 |
| `proxy.multizap.dev` | proxy raiz → 3100, com rotas extras `/webhook` e `/github/multizap/webhook` → 9002 |
| `hook.multizap.dev` | proxy → 9003 (deploy do clone-deck) |
| `mcp.centralldark.com` | proxy → 9100 (MCP) |

### Domínios CentralDark (instalador definitivo — pendência #14)
Lista oficial registrada via `./install.sh --cloudflare-apply`:

| Domínio | Função |
|---|---|
| `centralldark.com` / `www` | site / landing |
| `app.centralldark.com` | painel principal (login) |
| `api.centralldark.com` | gateway de API |
| `bot.centralldark.com` | bot Telegram (painel + webhook) |
| `crm.centralldark.com` | CRM |
| `mcp.centralldark.com` | MCP (IA externa) + `/status` |
| `gateway.centralldark.com` | gateway alternativo / proxy raiz |
| `webhook.centralldark.com` | webhook GitHub → VPS |
| `status.centralldark.com` | página pública de status |

## API oficial CentralDark

Base planejada:

```txt
https://api.centralldark.com
```

Esta documentação registra o domínio oficial da API. Alterar Caddy, DNS/Cloudflare, SSL ou proxy reverso continua sendo ação sensível e exige confirmação explícita.
