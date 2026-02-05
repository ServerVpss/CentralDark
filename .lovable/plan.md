
# Plano: Corrigir Deleção Automática da Mensagem PIX após Pagamento

## Diagnóstico

### Problema Identificado
A mensagem do QR Code PIX não está sendo deletada automaticamente após o pagamento ser confirmado porque o campo `telegram_chat_id` está **NULL** no banco de dados.

### Causa Raiz
Existe um **conflito de inserção dupla** na tabela `pending_payments`:

| Ordem | Origem | Inclui `telegram_chat_id`? |
|-------|--------|---------------------------|
| 1º | `efi-generate-pix` (linha 173-190) | ❌ NÃO |
| 2º | `telegram-webhook` (linha 2852-2867) | ✅ SIM |

O `efi-generate-pix` insere primeiro (sem o `chat_id`), e quando o `telegram-webhook` tenta inserir o segundo registro, ele falha silenciosamente devido ao TXID duplicado.

### Evidência no Banco
```
telegram_message_id: 24966  ✅ (atualizado corretamente depois)
telegram_chat_id: null      ❌ (nunca foi inserido)
```

---

## Solução

### Opção Escolhida: Modificar `efi-generate-pix`
Adicionar o parâmetro `telegram_chat_id` que é passado pelo `telegram-webhook` e incluí-lo no INSERT.

### Alterações Necessárias

#### 1. Arquivo: `supabase/functions/efi-generate-pix/index.ts`

**Modificação A** - Receber `telegram_chat_id` nos parâmetros (linha ~52-60):

```typescript
const { 
  amount, 
  user_id, 
  telegram_user_id,
  telegram_chat_id,  // ADICIONAR
  bot_id, 
  plan_name,
  plan_code,
  plan_days 
} = await req.json()
```

**Modificação B** - Incluir no INSERT de `pending_payments` (linha ~176-189):

```typescript
await supabase.from('pending_payments').insert({
  user_id,
  bot_id,
  telegram_user_id,
  telegram_chat_id,  // ADICIONAR
  txid: efiTxid,
  value: amount,
  plan_name: plan_name || 'Recarga',
  plan_code: plan_code || 'custom',
  plan_days: plan_days || 30,
  pix_copy_paste: proxyData.data?.pixCopiaECola,
  pix_qrcode: proxyData.data?.qrcode,
  expires_at: expiresAt.toISOString(),
  status: 'PENDING'
})
```

#### 2. Arquivo: `supabase/functions/telegram-webhook/index.ts`

**Modificação A** - Passar `telegram_chat_id` na chamada ao `efi-generate-pix` (linha ~2830-2838):

```typescript
body: JSON.stringify({
  amount: plan.price,
  user_id: this.bot.user_id,
  telegram_user_id: telegramUserId,
  telegram_chat_id: chatId,  // ADICIONAR
  bot_id: this.bot.id,
  plan_name: plan.name,
  plan_code: plan.code,
  plan_days: plan.days,
}),
```

**Modificação B** - Remover INSERT duplicado em `pending_payments` (linhas 2851-2867):

Como o `efi-generate-pix` já faz o INSERT, o código do `telegram-webhook` que insere em `pending_payments` deve ser **REMOVIDO** para evitar duplicação.

---

## Fluxo Corrigido

```text
1. Usuário clica em um plano no Telegram
       ↓
2. telegram-webhook chama efi-generate-pix com telegram_chat_id
       ↓
3. efi-generate-pix:
   - Gera o PIX via proxy PHP
   - Insere em pix_transactions
   - Insere em pending_payments COM telegram_chat_id ← CORRIGIDO
       ↓
4. telegram-webhook:
   - Recebe resposta do PIX
   - Envia mensagem com QR Code
   - Atualiza telegram_message_id no pending_payments
       ↓
5. Pagamento confirmado via webhook (efi-webhook):
   - Busca pending_payment com telegram_chat_id e telegram_message_id
   - DELETA a mensagem do QR Code ← AGORA FUNCIONA!
   - Envia mensagem de confirmação com confete
```

---

## Detalhes Técnicos

### Arquivos a Modificar
| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `supabase/functions/efi-generate-pix/index.ts` | Adicionar parâmetro + incluir no INSERT |
| `supabase/functions/telegram-webhook/index.ts` | Passar chatId + remover INSERT duplicado |

### Deploy Necessário
- `efi-generate-pix`
- `telegram-webhook`

### Teste Recomendado
1. Gerar um novo PIX pelo bot
2. Verificar no banco se `telegram_chat_id` está preenchido
3. Realizar o pagamento
4. Confirmar que a mensagem do QR foi deletada automaticamente
