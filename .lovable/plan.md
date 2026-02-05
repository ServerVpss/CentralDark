

# Plano: Correção do Sistema de Pagamento PIX + Unmute Manual

## Problema Identificado

O sistema falha ao desmutar usuários porque a condição na **linha 206** do `pix-payment/index.ts` requer `telegram_chat_id`:

```typescript
if (bot?.token && payment.telegram_chat_id) {
  // Todo o bloco de unmute e notificação está aqui
}
```

**Impacto**: 12 pagamentos concluídos não desmutaram os usuários (incluindo o ID `7982456451`).

---

## Correções Necessárias

### 1. Corrigir `pix-payment/index.ts`

Separar a lógica de **unmute** da lógica de **notificação**:

```text
ANTES:
┌─────────────────────────────────────────┐
│ if (bot?.token && telegram_chat_id) {   │
│   ├── deleteTelegramMessage()           │
│   ├── unmuteTelegramUser()  ← PROBLEMA  │
│   ├── sendTelegramMessage()             │
│   └── announceInGroup()                 │
│ }                                        │
└─────────────────────────────────────────┘

DEPOIS:
┌─────────────────────────────────────────┐
│ if (bot?.token) {                       │
│   ├── unmuteTelegramUser() ← SEMPRE     │
│   │                                     │
│   └── if (telegram_chat_id) {           │
│       ├── deleteTelegramMessage()       │
│       ├── sendTelegramMessage()         │
│       └── announceInGroup()             │
│   }                                     │
│ }                                        │
└─────────────────────────────────────────┘
```

### 2. Corrigir `telegram-payment-handler/index.ts`

O arquivo tem um **bug crítico**: a variável `payment` é usada na linha 96 mas nunca foi declarada:

```typescript
if (isPaid) {
  if (payment) {  // ← 'payment' não existe!
```

Precisa adicionar a consulta ao banco antes de usar.

### 3. Criar Action de Unmute Manual

Para corrigir os 12 usuários afetados e casos futuros, criar uma nova action no `pix-payment`:

```typescript
if (action === 'unmute') {
  // Desmutar usuário manualmente pelo telegram_user_id e bot_id
}
```

### 4. Desmutar Usuário 7982456451

Após as correções, executar o unmute do usuário específico que está mutado.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/pix-payment/index.ts` | Separar lógica de unmute da notificação |
| `supabase/functions/telegram-payment-handler/index.ts` | Corrigir bug da variável `payment` não declarada |

---

## Código Detalhado

### pix-payment/index.ts - Função `processConfirmedPayment`

A lógica atual (linhas 193-276) será refatorada para:

1. **Sempre tentar desmutar** quando há `bot.token` e `settings.group_chat_id`
2. **Notificações no privado** apenas se `telegram_chat_id` existir
3. **Usar `telegram_user_id` como fallback** para o chat privado

### telegram-payment-handler/index.ts - Correção do bug

Adicionar antes da linha 96:

```typescript
const { data: payment } = await supabase
  .from('pending_payments')
  .select('*')
  .eq('txid', txid)
  .single();
```

---

## Ação Imediata para o Usuário 7982456451

Após deploy, executar unmute via API do Telegram diretamente ou via nova action.

---

## Resumo das Mudanças

1. Refatorar `processConfirmedPayment()` para desmutar independente do `telegram_chat_id`
2. Corrigir bug crítico no `telegram-payment-handler`
3. Usar `telegram_user_id` como fallback para enviar mensagem de confirmação
4. Desmutar manualmente o usuário `7982456451`

