# 24 · Bot-server (Lote 11)

O **CentralDark-BotServer** é o serviço PM2 que expõe as rotas read-only que o painel usa pra mostrar mensagens da sessão WhatsApp.

## Mapa rápido

```text
/root/CentralDark/apps/bot-server/
├── server.mjs              ← HTTP nativo (sem dep externa)
├── ecosystem.config.cjs    ← config PM2
├── start.sh                ← carrega tokens do cofre
└── src/                    ← handlers Lotes 1–10 (TS, ainda não plugados)
```

## Endpoints expostos

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/health` | status + sessão conectada (sanitizado) |
| GET | `/v1/whatsapp/sessions` | lista sessões WuzAPI |
| GET | `/v1/whatsapp/chats` | contatos + grupos da sessão |
| GET | `/v1/whatsapp/messages?jid=…&count=30` | últimas mensagens (chama `/chat/history` da WuzAPI) |

Todas leitura pura. **Nada** escreve na WuzAPI.

## Variáveis de ambiente

| Nome | Origem | Default |
|------|--------|---------|
| `BOT_SERVER_PORT` | `ecosystem.config.cjs` | `9210` |
| `WUZAPI_BASE_URL` | `ecosystem.config.cjs` | `http://127.0.0.1:8081` |
| `WUZAPI_ADMIN_TOKEN` | `start.sh` lê de `/root/Multizap/wuzapi/.env` | — |
| `BOT_SERVER_SHARED_TOKEN` | `/root/CentralDark/secrets/bot-server.env` | vazio (auth desligada) |

## Instalação na VPS

```bash
# 1) Atualiza o repo local (cron já faz isso a cada minuto)
cd /root && git pull

# 2) Sobe PM2 (sem mexer no Caddy)
CD_CONFIRM=1 bash scripts/deploy/install-bot-server.sh

# 3) Quando quiser expor publicamente, ativa o Caddy
CD_CONFIRM=1 CD_INSTALL_CADDY=1 bash scripts/deploy/install-bot-server.sh
```

O script é idempotente — pode rodar quantas vezes quiser. Ele:
1. Garante o cofre `bot-server.env`;
2. Faz `pm2 reload` (ou `start` na primeira vez) com `--update-env`;
3. Valida `curl 127.0.0.1:9210/health`;
4. (opcional) Grava `/etc/caddy/conf.d/bot-server.caddy` apontando `bot.centralldark.com → 127.0.0.1:9210` e roda `caddy validate` + `systemctl reload caddy`.

## Snippet Caddy aplicado

```caddyfile
bot.centralldark.com {
    encode zstd gzip
    @api path /v1/* /health
    handle @api {
        reverse_proxy 127.0.0.1:9210
    }
    respond 404
    log {
        output file /var/log/caddy/bot-server.log
    }
}
```

## Checklist de validação (regra inquebrável: 7 passos)

1. commit no repo ✅
2. `cd /root && git log -1` HEAD bate com o GitHub
3. `pm2 describe CentralDark-BotServer` mostra `script: server.mjs`
4. `ss -tlnp | grep 9210` confirma o processo
5. `curl 127.0.0.1:9210/health` = 200
6. `/etc/caddy/Caddyfile` (ATIVO) importa `conf.d/*.caddy`
7. `curl https://bot.centralldark.com/health` = 200 com `version: 0.1.0-lote11`
