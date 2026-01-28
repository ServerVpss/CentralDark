
# Plano: Adicionar Efeito de Confetti nas Mensagens de Resultado

## Visão Geral

Adicionar o efeito visual de **confetti/festa** (🎉) nas mensagens de resultado das consultas do Telegram, similar ao que já existe no sistema de pagamentos quando uma transação é confirmada.

O Telegram permite enviar mensagens com efeitos visuais especiais através do parâmetro `message_effect_id`. O ID do efeito de confetti é: `5046509860385561286`.

## O que será implementado

1. **Adicionar `message_effect_id` na função `sendLongMessagePaginated`** - Para resultados com dados paginados
2. **Adicionar `message_effect_id` no `sendPhoto`** - Para resultados com foto
3. **Tornar o efeito configurável** (opcional) - Adicionar campo na tabela `bot_settings` para ativar/desativar

## Localização dos arquivos

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/telegram-webhook/index.ts` | Adicionar parâmetro `message_effect_id` nos envios |

## Detalhes Técnicos

### 1. Constante do efeito
```typescript
// Efeitos visuais do Telegram
const CONFETTI_EFFECT_ID = '5046509860385561286';
```

### 2. Atualizar `sendLongMessagePaginated`
Adicionar parâmetro opcional `messageEffectId`:
```typescript
async function sendLongMessagePaginated(
  token: string, 
  chatId: number, 
  text: string, 
  supabase: SupabaseClient,
  replyToId?: number,
  messageEffectId?: string  // Novo parâmetro
) {
  // Na chamada telegramRequest:
  return telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_to_message_id: replyToId,
    message_effect_id: messageEffectId,  // Adicionar efeito
    reply_markup: keyboard,
  });
}
```

### 3. Atualizar `sendPhoto`
```typescript
const sentPhoto = await telegramRequest(this.token, "sendPhoto", {
  chat_id: chatId,
  photo: fotoUrl,
  caption: simpleCaption,
  parse_mode: "HTML",
  reply_to_message_id: replyToId,
  message_effect_id: CONFETTI_EFFECT_ID,  // Adicionar efeito
  reply_markup: keyboard([btn("🗑️ Apagar", "delete_msg")]),
});
```

### 4. Passar o efeito nas chamadas de consulta
Em `processQuery` e `handleGroupCommand`, quando o resultado for positivo:
```typescript
// Para foto
message_effect_id: CONFETTI_EFFECT_ID

// Para mensagem paginada
await sendLongMessagePaginated(
  this.token, 
  chatId, 
  formattedResult, 
  this.supabase, 
  replyToId,
  CONFETTI_EFFECT_ID  // Novo parâmetro
);
```

## Resultado esperado

Quando uma consulta retornar dados com sucesso:
- A mensagem de resultado exibirá o efeito de confetti 🎉
- A foto (se houver) também terá o efeito
- Combinado com as reações de emoji, cria uma experiência de celebração completa

## Próximos passos (opcional)

Futuramente, pode ser adicionado:
- Campo `message_effect_enabled` na tabela `bot_settings`
- Seleção de diferentes efeitos (fogo 🔥, coração ❤️, etc.)
