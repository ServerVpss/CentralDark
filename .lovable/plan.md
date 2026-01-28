# Plano: Corrigir Confirmação de Pagamentos PIX em Tempo Real

## Status: ✅ IMPLEMENTADO

## Problemas Identificados (Resolvidos)

1. ✅ **TXID da Efí é diferente do TXID gerado** - Corrigido com busca via pending_payments
2. ✅ **Webhook não encontra transações expiradas** - Removida restrição de expires_at
3. ✅ **Polling usa endpoint inexistente** - Corrigido para usar efi-pix-proxy.php com action check_status

## Implementação Realizada

### Parte 1: efi-webhook ✅
- Removida restrição `.gt('expires_at', ...)` 
- Busca agora em transações 'pending' E 'expired' das últimas 24h
- Adicionada quarta tentativa via pending_payments para encontrar transação pelo telegram_user_id

### Parte 2: efi-poll-pending ✅
- Mudado proxy para `https://api.segredounlock.com/efi-pix-proxy.php`
- Adicionado `action: 'check_status'` na requisição
- Adicionado tratamento de erro para respostas HTML inválidas

### Parte 3: PixPaymentDialog ✅
- Adicionado polling automático a cada 5 segundos
- Verificação continua enquanto modal está aberto
- Mostra confetti automaticamente quando pagamento é confirmado

## Arquivos Modificados

1. `supabase/functions/efi-webhook/index.ts`
2. `supabase/functions/efi-poll-pending/index.ts` 
3. `src/components/payments/PixPaymentDialog.tsx`
