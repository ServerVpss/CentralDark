---
name: Bots oficiais do Telegram (CentralDark)
description: Mapeamento correto dos bots, canais e grupos do CentralDark no Telegram. Usar SEMPRE estes nomes/IDs.
type: reference
---
**Bot oficial de notificações do sistema (Mega Painel / status / deploys):**
- Nome: **CentralDark - BOT**
- Username: `@srver1bot`
- ID: `8057486730`
- Foto de perfil: igual à do canal `CentralDark — Status` (precisa ser definida manualmente via BotFather → Edit Bot → Edit Botpic, porque o gateway do Telegram aqui não suporta upload multipart de `setMyProfilePhoto`).

**Canal oficial de status:**
- Nome: `CentralDark — Status`
- ID: `-1003669176367`
- Linked group: `-1002783376580` (`CentralDark — Monitoramento`)

**Bot do módulo Fiscal do TelePainel (NÃO usar para notificações de sistema):**
- Username: `@SEGREDOPUXADASBOT`
- Está bloqueado no `notify-telegram` (BLOCKED_BOT_USERNAMES) — qualquer rota apontando pra ele é ignorada.

**Regra:** toda notificação de sistema (deploys, falhas, MCP, VPS, alertas) sai por `@srver1bot` via Edge Function `notify-telegram` (que escreve no `notifications_log` e aparece no Mega Painel). Nunca chamar o gateway direto.
