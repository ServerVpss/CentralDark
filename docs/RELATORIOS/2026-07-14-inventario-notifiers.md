# Inventário de notifiers CentralDark (sanitizado)

**Data:** 2026-07-14 · **Missão:** visão+tele (PERMITO Pivete)  
**Sem valores de token/chat no documento.**

## Produtores → caminho de envio

| Origem | Path / processo | Via atual | Loop ou movimento? |
|--------|-----------------|-----------|---------------------|
| Guardião Consciência | `infra/guardiao/notifier.py` → `scripts/notify-claude/notify-telegram.sh` | Bot API direta | **Movimento** (inotify + reconcile 5min) |
| Hermes | `apps/modulos/HERMES-CORE/utils/notify.mjs` | Bot API `@srver1bot` (env secrets) | Evento Hermes |
| agent-notify | `scripts/agent-notify.mjs` | telegram-alerts.env | Sob demanda (CLI) |
| notify-claude scripts | `scripts/notify-claude/*.sh` | shell | Sob demanda |
| infra/notify | `infra/notify/notify.py` / `.sh` | legado/exemplo | Verificar uso |
| Edge notify-telegram | Supabase (Lovable mem) | edge + log painel | Preferência Lovable |
| Webhook deploy | `scripts/webhook/...` | 🔒 notify area | Evento deploy |
| Issues scanner | agent-notify `--issues` | sob cron/agent | Periódico (relatório) |
| **infra-vivo (novo)** | `scripts/vps/infra-movimento-watch.mjs` | agent-notify **só em delta** | **Movimento** (fingerprint) |

## Alvo Pivete (hub central)

```text
produtor → HUB notificação (origem=nome) → Telegram / painel
```

Hoje: canais podem coincidir (Guardião ≈ Hermes) — **ok provisório**.  
Não consolidar motor único sem estrutura definitiva (trava Central de Notificações 🔒).

## UI visão simples

| URL | Função |
|-----|--------|
| https://status.centralldark.com/infra.html | Monitor mínimo (PM2/disco/RAM/MCP/f2b) |
| https://status.centralldark.com/infra-vivo.json | JSON estado (sem secrets) |
| https://status.centralldark.com/ | Mega Painel (já existia) |

## Cron movimento

```cron
*/3 * * * * root /usr/bin/node /root/CentralDark/scripts/vps/infra-movimento-watch.mjs >> /var/log/infra-movimento.log 2>&1
```

Poll a cada 3 min **no host**; Telegram **só se fingerprint mudou**.
