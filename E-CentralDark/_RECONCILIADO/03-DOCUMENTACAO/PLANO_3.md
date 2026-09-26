# Plano — apps/modulos/telepainel

## Para que serve
Módulo TelePainel — painel de controle por Telegram (bot + comandos administrativos).

## ✅ Feito
- Pasta criada com README
- Bot Telegram já existe em `apps/bot-telegram/` (legado), futuro destino é aqui

## 🟡 Em andamento
- Nada ainda

## 🔴 A fazer
- Migrar `apps/bot-telegram/` para cá
- Definir comandos suportados
- Integrar com PM2 e alertas

## 🛡️ Regras de segurança
- Token do bot só em `/root/CentralDark/secrets/`
- Comandos sensíveis (restart, deploy) só para chat_id autorizado
- Nunca logar token

## 🚀 Próximo passo
Planejar migração do bot Telegram atual.
