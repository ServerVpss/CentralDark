# CentralDark — Monitor / Watchdog

Vigia o MCP público (`mcp.centralldark.com`), o install público
(`install.centralldark.com`) e o Caddy. Alerta no Telegram em caso de queda,
gera `status.json` consumido pela página pública em
[https://install.centralldark.com/status](https://install.centralldark.com/status).

## Arquivos

| Arquivo | O que faz |
|---|---|
| `mcp-watchdog.sh` | Script que roda a cada minuto via cron; checa /health, envia alerta no Telegram (curl direto na Bot API, não depende do MultiZap-TelegramBot), grava `status.json`. |
| `install-watchdog.sh` | Instalador idempotente — copia pra `/usr/local/bin`, registra cron e logrotate. |

## Instalação (na VPS)

```bash
cd /root/CentralDark/scripts/monitor
bash install-watchdog.sh
mcp-watchdog.sh  # roda 1x pra criar status.json
```

## Credenciais

Lê de `/root/CentralDark/secrets/telegram-alerts.env`:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Sem isso, o watchdog continua rodando (gera status.json) mas não manda alerta.

## O que detecta

- MCP local fora (PM2 caiu, porta 9100 não responde)
- MCP público fora (`mcp.centralldark.com/health` ≠ 200)
- **Cloudflare 521** (origem inacessível pra CF) — mensagem específica
- Caddy `502/504` (backend MCP fora)
- Caddy systemd `failed/inactive`
- Install público fora

## Debounce

1 alerta por incidente (grava `/var/lib/mcp-watchdog/current-incident`).
Quando volta, manda mensagem de recovery e limpa o arquivo.

## Logs

- `/var/log/mcp-watchdog.log` — log do próprio watchdog (rotacionado)
- `/var/lib/mcp-watchdog/status.json` — snapshot atual
- `/var/lib/mcp-watchdog/history.jsonl` — histórico de incidentes (últimos 500)
