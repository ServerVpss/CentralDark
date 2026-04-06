

# Novidades da API 9.4 e 9.6 no Telegram Webhook

## O que será implementado

### 1. Custom Emoji Icons nos Botões (API 9.4)
O campo `icon_custom_emoji_id` permite exibir um emoji customizado no botão. Atualizar a função `btn()` para aceitar esse parâmetro opcional.

```ts
function btn(text: string, callback_data: string, style?: string, iconCustomEmojiId?: string): InlineButton {
  const b: any = { text, callback_data };
  if (style) b.style = style;
  if (iconCustomEmojiId) b.icon_custom_emoji_id = iconCustomEmojiId;
  return b;
}
```

**Nota importante:** Custom emojis em botões só funcionam se o bot tem permissão para usar custom emojis (geralmente bots com Telegram Premium ou em chats onde o bot pode enviar custom emojis). Se o bot não tiver essa permissão, o Telegram ignora o campo silenciosamente.

### 2. Suporte a `sender_tag` (API 9.6)
Adicionar o campo `sender_tag` na interface `TelegramMessage` e logar/armazenar quando presente. O `sender_tag` é uma tag opcional que identifica o remetente — útil para rastreamento e logs.

### 3. Suporte a Managed Bots (API 9.6)
Adicionar campo `managed_bot_created` na interface `TelegramMessage` para detectar quando um bot gerenciado é criado. Adicionar `can_manage_bots` na interface `TelegramUser`.

## Alterações no arquivo

### `supabase/functions/telegram-webhook/index.ts`

1. **Interface `TelegramUser`** — adicionar `can_manage_bots?: boolean`
2. **Interface `TelegramMessage`** — adicionar `sender_tag?: string` e `managed_bot_created?: unknown`
3. **Função `btn()`** — adicionar parâmetro `iconCustomEmojiId`
4. **Função `btnUrl()`** — adicionar parâmetros `style` e `iconCustomEmojiId`
5. **Logs** — incluir `sender_tag` nos logs de mensagem quando presente
6. **Aplicar custom emojis** em botões estratégicos do menu (onde fizer sentido visual)

## Deploy
Deploy automático da edge function `telegram-webhook`.

