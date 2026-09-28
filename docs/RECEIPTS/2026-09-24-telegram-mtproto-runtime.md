# Receipt — Telegram MTProto runtime ligado

Data: 2026-09-24
Owner: `scripts/telegram-mtproto/server.js`
Serviço PM2: `mtproto-service`
Porta local: `127.0.0.1:8790`

## Fato confirmado

- O código MTProto/GramJS já existia no owner `scripts/telegram-mtproto/server.js`.
- O runtime estava DOWN: `127.0.0.1:8790` recusava conexão.
- Não havia `TELEGRAM_APP_API_ID` nem `TELEGRAM_APP_API_HASH` nos secrets medidos.
- O servidor foi ajustado para subir em modo `CONFIG_BLOCKED` quando as chaves de app ainda não existem.
- `CONFIG_BLOCKED` permite health/status sem fingir que a conta pessoal já conectou.
- `/start` e `/confirm` continuam bloqueados até configuração das chaves MTProto.

## Provas T0/T1

- `node --check scripts/telegram-mtproto/server.js`: PASS
- PM2 `mtproto-service`: online
- `GET http://127.0.0.1:8790/health`: `ok=true`, `configured=false`, `status=CONFIG_BLOCKED`, `hasSession=false`
- `GET http://127.0.0.1:8790/status`: `connected=false`, `status=CONFIG_BLOCKED`
- `POST /start`: bloqueia com `CONFIG_BLOCKED` enquanto as chaves estão ausentes

## Pendência honesta

- `CONTA_PESSOAL_TELEGRAM_CONECTADA=UNKNOWN` até preencher `TELEGRAM_APP_API_ID` e `TELEGRAM_APP_API_HASH` em `/root/CentralDark/secrets/telegram-mtproto.env` e completar telefone/código/2FA.
- O serviço está local-only por design: `127.0.0.1:8790`.
- Integração Hub/Card `/api/telegram/mtproto` ainda precisa ser reconciliada/provada.

## Próximo cursor

Preencher `/root/CentralDark/secrets/telegram-mtproto.env` fora do Git → restart `mtproto-service` → `/health configured=true` → iniciar `/start` com telefone → confirmar código/2FA → `/status connected=true` → ligar SOL/Capability Router aos agentes Telegram.
