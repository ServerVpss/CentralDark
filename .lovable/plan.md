
# Plano: Corrigir deleção automática da mensagem PIX após confirmação de pagamento

## Problema Identificado

O pagamento PIX foi confirmado corretamente, mas a mensagem com o QR Code não foi deletada automaticamente. Isso ocorreu porque:

1. **O polling automático (`efi-poll-pending`) não deleta a mensagem** - Esta edge function confirma pagamentos via cron job a cada minuto, mas não tem código para deletar a mensagem do QR Code
2. **O `telegram_chat_id` está NULL** no registro do `pending_payments`, o que impossibilitaria a deleção mesmo se o código existisse

## Análise Técnica

### Fluxos de Confirmação de Pagamento

| Método | Deleta Mensagem? |
|--------|-----------------|
| Botão "Já Paguei" no chat | ✅ Sim |
| Webhook da Efí (tempo real) | ✅ Sim |
| Polling automático (cron) | ❌ **NÃO** |

### Problema no `efi-poll-pending`

1. A busca no `pending_payments` (linha 165) não inclui `telegram_message_id`:
```typescript
.select('plan_days, plan_name, plan_code, plan_id, telegram_chat_id')
```

2. Não existe código para chamar `deleteMessage` após confirmar o pagamento

---

## Solução Proposta

### Modificar `supabase/functions/efi-poll-pending/index.ts`

1. **Incluir `telegram_message_id` na query** do `pending_payments`

2. **Adicionar lógica de deleção da mensagem** antes de enviar a confirmação:

```typescript
// Após buscar o bot e antes de enviar notificação:
if (pendingPayment?.telegram_message_id && chatId) {
  try {
    await fetch(`${TELEGRAM_API}${bot.token}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: pendingPayment.telegram_message_id
      }),
    })
    console.log(`Mensagem PIX deletada: ${pendingPayment.telegram_message_id}`)
  } catch (e) {
    console.error("Erro ao deletar mensagem PIX:", e)
  }
}
```

### Correção do `telegram_chat_id` NULL

Verificar se a função que gera o PIX está salvando corretamente o `telegram_chat_id`. Pelo código analisado, o insert parece correto (linha 2856 do webhook), então pode ser um caso isolado ou uma race condition.

---

## Mudanças Necessárias

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/efi-poll-pending/index.ts` | Adicionar `telegram_message_id` no select e lógica de deleção |

## Resultado Esperado

Após a implementação, quando o polling confirmar um pagamento:
1. A mensagem do QR Code PIX será deletada automaticamente
2. Apenas a mensagem de confirmação "PAGAMENTO CONFIRMADO!" permanecerá no chat
