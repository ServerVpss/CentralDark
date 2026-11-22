# 03 — Portas e rede

> Toda nova porta usada pelo sistema entra aqui. Sem isto, o instalador não sabe o que liberar nem o que validar.

## Portas externas (expostas via Caddy)
| Porta | Protocolo | Serviço |
|---|---|---|
| 80 | HTTP | Caddy (redirect para 443) |
| 443 | HTTPS | Caddy (todas as rotas) |

## Portas internas (loopback 127.0.0.1)
| Porta | Serviço PM2/systemd | Repo / função |
|---|---|---|
| 3000 | `CloneDeck-CRM` | CRM |
| 3100 | `MultiZap-Gateway` | gateway clone-deck |
| 9000 | `webhook` (binário Go) | hook WhatsApp — NÃO mexer |
| 9001 | `github-webhook` | hook Recargas — NÃO mexer |
| 9002 | `MultiZap-GitHub-Webhook` | hook repo atendimentoo |
| 9003 | `webhook-bot` | hook clone-deck |
| 9100 | `MCP-CentralDark` | MCP em `mcp.centralldark.com` |
| 9119 | `centraldark-vps-heartbeat.service` | Fixed Point Fabric; **somente 127.0.0.1**, assinatura HMAC obrigatória |

### Regra da porta 9119

O instalador da Forja Total mede o owner antes de tocar. Se `9119` estiver em LISTEN e não pertencer a `centraldark-vps-heartbeat.service`, a instalação do heartbeat bloqueia fail-closed. Não matar, mover ou substituir automaticamente o consumidor existente.

## Rotas Caddy do webhook clone-deck (camada 1 do deploy)
```text
hook.multizap.dev {
  reverse_proxy 127.0.0.1:9003
}
```

## Deploy em 3 camadas (redundância)
1. Webhook GitHub→VPS.
2. GitHub Actions fallback.
3. Cron idempotente.

## Domínios CentralDark

| Domínio | Função |
|---|---|
| `centralldark.com` / `www` | site / landing |
| `app.centralldark.com` | painel principal |
| `api.centralldark.com` | gateway API |
| `bot.centralldark.com` | bot Telegram |
| `crm.centralldark.com` | CRM |
| `mcp.centralldark.com` | MCP + `/status` |
| `gateway.centralldark.com` | gateway alternativo |
| `webhook.centralldark.com` | webhook GitHub → VPS |
| `status.centralldark.com` | status público |

O heartbeat `9119` não deve ser exposto por Caddy/Cloudflare; ele é prova local de runtime.
