
# Plano: Corrigir Confirmação de Pagamentos PIX em Tempo Real

## Problemas Identificados

1. **TXID da Efí é diferente do TXID gerado** - A Efí usa um TXID interno próprio que não corresponde ao que geramos
2. **Webhook não encontra transações expiradas** - O fallback por valor só busca transações não expiradas
3. **Polling usa endpoint inexistente** - O `efi-check-status.php` não existe, retornando HTML

## Solução Proposta

### Parte 1: Corrigir Webhook (efi-webhook)

Remover a restrição de `expires_at > now()` na busca por valor para que transações expiradas também sejam encontradas:

```text
Linha 86: Remover .gt('expires_at', new Date().toISOString())
```

Adicionar busca também pelo `external_id` da transação no `pending_payments`:

```typescript
// Buscar pelo pending_payments que tem o txid correto
const result4 = await supabase
  .from('pending_payments')
  .select('*')
  .eq('status', 'PENDING')
  .eq('amount', parseFloat(valor))
  .order('created_at', { ascending: false })
  .limit(1)
  .single()

if (result4.data) {
  // Buscar a transação correspondente
  const result5 = await supabase
    .from('pix_transactions')
    .select('*')
    .eq('telegram_user_id', result4.data.telegram_user_id)
    .in('status', ['pending', 'expired'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (result5.data) {
    transaction = result5.data
  }
}
```

### Parte 2: Corrigir Polling (efi-poll-pending)

Usar o endpoint unificado `efi-pix-proxy.php` com a action `check_status`:

```typescript
// Linha 72-73: Mudar de
const proxyUrl = gateway.proxy_url?.replace('generate', 'check-status') 
  || 'https://api.segredounlock.com/efi-check-status.php'

// Para
const proxyUrl = 'https://api.segredounlock.com/efi-pix-proxy.php'

// E na chamada (linha 84):
body: JSON.stringify({
  action: 'check_status',
  client_id: config.client_id,
  client_secret: config.client_secret,
  txid: tx.external_id
})
```

Também adicionar tratamento de erro para respostas HTML:

```typescript
const responseText = await proxyResponse.text()
let proxyData
try {
  proxyData = JSON.parse(responseText)
} catch (e) {
  console.error(`Resposta inválida do proxy para ${tx.external_id}: ${responseText.substring(0, 100)}`)
  results.push({ txid: tx.external_id, error: 'Resposta inválida do proxy' })
  continue
}
```

### Parte 3: Adicionar Verificação em Tempo Real no Frontend

Criar um polling no frontend que verifica o status a cada 5 segundos enquanto o modal de pagamento está aberto. Isso será um novo componente chamado `PixPaymentPolling`.

---

## Arquivos a Modificar

1. `supabase/functions/efi-webhook/index.ts` - Melhorar busca de transações
2. `supabase/functions/efi-poll-pending/index.ts` - Usar proxy correto com tratamento de erro
3. `src/components/payments/PixPaymentDialog.tsx` - Adicionar polling em tempo real (se existir)

## Resultado Esperado

- Webhook encontrará a transação mesmo com TXID diferente ou expirada
- Polling funcionará corretamente verificando status na Efí
- Frontend verificará pagamento a cada 5 segundos mostrando confirmação imediata
