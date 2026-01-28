

# Plano: Corrigir Expiração de Pagamentos PIX Pendentes

## Problema Identificado

Atualmente o sistema tem as seguintes configuracoes:

1. **PIX expira em 10 minutos** - tempo muito curto para o usuario pagar
2. **Transacoes expiradas nao sao atualizadas** - ficam eternamente com status "pending" no banco
3. **Polling ignora expiradas** - a funcao `efi-poll-pending` so verifica transacoes que ainda nao expiraram

## Solucao Proposta

### 1. Aumentar tempo de expiracao para 1 hora

Modificar `supabase/functions/efi-generate-pix/index.ts`:
- Linha 101: Mudar de `10 * 60 * 1000` (10 min) para `60 * 60 * 1000` (60 min)
- Linha 110: Mudar `expiracao: 600` para `expiracao: 3600`

### 2. Marcar automaticamente como expirado

Adicionar logica no `efi-poll-pending` para atualizar transacoes expiradas:

```typescript
// Atualizar transacoes expiradas para status "expired"
await supabase
  .from('pix_transactions')
  .update({ status: 'expired' })
  .eq('status', 'pending')
  .lt('expires_at', new Date().toISOString())
```

### 3. Continuar mostrando na tabela

As transacoes expiradas continuarao visiveis na tabela do relatorio mas com badge "Expirado" (ja existe suporte para isso no componente `PixTransactionsTable`).

---

## Detalhes Tecnicos

### Arquivo: `supabase/functions/efi-generate-pix/index.ts`

**Linha 101:**
```typescript
// ANTES
const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

// DEPOIS
const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
```

**Linha 110:**
```typescript
// ANTES
expiracao: 600, // 10 minutos em segundos

// DEPOIS
expiracao: 3600, // 1 hora em segundos
```

### Arquivo: `supabase/functions/efi-poll-pending/index.ts`

**Adicionar apos linha 18 (apos o console.log inicial):**

```typescript
// Primeiro, marcar transacoes expiradas
const { data: expiredCount } = await supabase
  .from('pix_transactions')
  .update({ status: 'expired' })
  .eq('gateway', 'efi')
  .eq('status', 'pending')
  .lt('expires_at', new Date().toISOString())
  .select('id')

if (expiredCount && expiredCount.length > 0) {
  console.log(`${expiredCount.length} transacoes marcadas como expiradas`)
  
  // Atualizar tambem em pending_payments
  for (const tx of expiredCount) {
    await supabase
      .from('pending_payments')
      .update({ status: 'EXPIRED' })
      .eq('txid', tx.external_id)
  }
}
```

## Resultado Esperado

- Usuarios terao **1 hora** para completar o pagamento PIX (em vez de 10 minutos)
- Transacoes que passarem do prazo serao automaticamente marcadas como "expired"
- O relatorio de lucros continuara mostrando todas as transacoes com o status correto
- O polling focara apenas em transacoes validas

