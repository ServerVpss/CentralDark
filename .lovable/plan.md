# Sincronizar DarkAI nos processos PM2

## Situação

O DarkAI já responde certinho na edge function (chave nova `DARKAI_CLI_KEY` aceita) e o binário `darkai` funciona pra shell nova. Mas os processos PM2 que estavam rodando ANTES da troca da chave (Hermes, ArsenalAdapter, LovableBridge, GuardiaoConsciencia, HubBot, etc) carregaram o env antigo em memória e vão continuar apanhando `chave_invalida` até serem reiniciados.

Confirmei olhando `/proc/<pid>/environ` do Hermes: ele ainda tem a `DARKAI_ANON_KEY` velha.

## O que vou fazer

1. **Descobrir quem usa** — listar processos PM2 cujo env atual contém `DARKAI_` (comparar valor em memória com o novo `/etc/profile.d/darkai.sh`).
2. **Recarregar env dos serviços afetados** com `pm2 restart <nome> --update-env`. Isso reinicia SÓ os processos identificados, um por um, sem tocar em nada não relacionado.
3. **Ordem segura** (menos crítico → mais crítico):
   - `CentralDark-ArsenalAdapter`
   - `CentralDark-LovableBridge`
   - `CentralDark-GuardiaoConsciencia`
   - `CentralDark-Hermes` (por último, é o orquestrador)
   - qualquer outro que apareça no scan
4. **`pm2 save`** pra fixar o estado no dump.
5. **Validação**: pra cada serviço, checar que voltou `online` e uptime resetou. Depois disparar 1 chamada de teste no Hermes (via `hermes_dispatch_mission` com missão fake tipo "responda pong via darkai") pra confirmar que a cadeia inteira responde.
6. **Notificar no Telegram** o resultado, no padrão Card Hermes.

## Detalhes técnicos

- Não vou mexer em `whatsapp-server` (id 1, estado `stopped` é intencional).
- Nada de `pm2 restart all` — cada processo por nome.
- Se o restart do Hermes falhar, rollback imediato: reiniciar de novo lendo o dump anterior.
- Backup do `/etc/profile.d/darkai.sh` já existe (`.bak.<timestamp>`) do turno passado.

## Risco

Baixo. Restart controlado, um serviço por vez, com validação após cada um. Downtime esperado por serviço: 2-5 segundos.
