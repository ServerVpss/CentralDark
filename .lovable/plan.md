

# Conectar contagens reais de Mensagens e Usuarios nos cards de bots

## Problema
Os cards de bot no dashboard mostram sempre **0** para Mensagens e Usuarios porque os valores estao hardcoded no componente `BotsSection.tsx`.

## Solucao
Buscar os dados reais do banco de dados e passar para os cards.

## Fontes de dados
- **Mensagens**: tabela `bot_analytics` - somar `messages_received` por `bot_id`
- **Usuarios**: tabela `telegram_subscriptions` - contar usuarios unicos ativos por `bot_id`

## Implementacao

### 1. Atualizar `BotsSection.tsx`
- Adicionar queries ao banco para buscar totais por bot
- Consultar `bot_analytics` para somar todas as `messages_received` de cada bot
- Consultar `telegram_subscriptions` para contar `telegram_user_id` distintos com status `active` por bot
- Passar os valores reais para `BotStatusCard` em vez de `0`

### 2. Detalhes tecnicos

**Query de mensagens:**
```sql
SELECT bot_id, SUM(messages_received) as total
FROM bot_analytics
GROUP BY bot_id
```

**Query de usuarios ativos:**
```sql
SELECT bot_id, COUNT(DISTINCT telegram_user_id) as total
FROM telegram_subscriptions
WHERE status = 'active'
GROUP BY bot_id
```

As queries serao feitas via Supabase client dentro do `BotsSection` ou no hook `useBotAnalytics` existente, e mapeadas por `bot_id` para alimentar cada card individualmente.

### 3. Fallback
Se nao houver dados para um bot, continua mostrando 0 (comportamento atual).

