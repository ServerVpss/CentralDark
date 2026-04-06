
# Sistema de Assinatura Grupo vs Privado

## 1. Migração — Adicionar coluna `context` na tabela `telegram_subscriptions`
- Adicionar coluna `context` (text, default `'group'`) para distinguir assinaturas de grupo e privado
- Adicionar coluna `context` na tabela `pending_payments` também
- Índice no par (telegram_user_id, context) para consultas rápidas

## 2. Lógica de Assinatura no Webhook
- **`getSubscription(telegramUserId, context)`** — passa o contexto (group/private)
- **`isSubscriptionActive(telegramUserId, context)`** — verifica por contexto
- No **grupo**: verifica assinatura com `context = 'group'`
- No **privado**: verifica assinatura com `context = 'private'`
- Acesso separado: assinatura do grupo NÃO vale no privado e vice-versa

## 3. Menu de Planos com Preço Diferenciado
- **`showPlansMenu`** recebe o contexto (group/private)
- No privado, todos os preços são exibidos com +R$1
- O callback do botão indica o contexto: `plan:diaria:private` ou `plan:diaria:group`
- **`generatePixPayment`** recebe o contexto e aplica o markup de R$1 quando `context = 'private'`

## 4. Confirmação de Pagamento
- Ao confirmar pagamento, salvar o `context` na assinatura criada
- O valor salvo já reflete o preço com markup

## 5. Consistência de Comandos
- Comandos de consulta (`/cpf`, `/cpffull`, etc.) já funcionam no grupo via `handleGroupCommand`
- No privado, a lógica adicionada na mensagem anterior já processa via `parseMultipleCommands`
- Ambos passam pelo mesmo `processQuery` → mesmo backend `api-query`
- Verificação de assinatura usa o contexto correto em cada canal

## 6. Menu Principal no Privado
- Mostrar status da assinatura do privado
- Botão "💳 Assinar Privado" → abre planos com preço +R$1
- Separar visualmente os planos

## Resultado
- Assinaturas independentes para grupo e privado
- Preço do privado = preço base + R$1
- Mesma lógica de consulta em ambos os canais
- Sem quebrar fluxo existente de grupo
