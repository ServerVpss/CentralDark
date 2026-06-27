# 🔔 Guardião-Notificações  (o bot do Telegram)

**O que faz:** te avisa no Telegram quando algo importante acontece.

## Onde o código roda HOJE (não mexer sem migração controlada)
- Código ativo: `/root/CentralDark/apps/bot-telegram/bot.cjs`
- Processo PM2: `CentralDark-TelegramBot` (online)
- Logs: `/var/log/centraldark-telegram-bot-out.log` e `...-error.log`
- Token do Telegram: lido de fora do repo (não versionado).

## Status da consolidação
Esta pasta é a **casa oficial** deste agente no Monitoramento 24h. O código ativo será
**migrado pra cá** num passo controlado (copiar → re-apontar PM2 → validar → remover o
antigo), pra **não derrubar** o bot que já roda. Até lá, este README aponta pro lugar certo.

## Permissões (consciência)
ler ✅ · notificar ✅ · **agir sozinho ❌** (precisa da sua aprovação no painel).
