

# Plano: Refatoração Completa do TelePanel para Admin Único

## Visão Geral

Este plano recria o sistema do zero, focado em um **único administrador** que gerencia seu bot de consultas. Eliminamos toda a complexidade de multi-usuário e consolidamos as tabelas de dados.

## Problemas Identificados

1. **Dashboard busca tabela errada** - `user_subscriptions` em vez de `telegram_subscriptions`
2. **Duas tabelas de assinaturas** - Confusão entre `user_subscriptions` e `telegram_subscriptions`
3. **Sem bots no banco** - Sistema não tem dados configurados
4. **RLS policies permissivas** - Avisos de segurança
5. **Hooks fragmentados** - Muitos hooks fazendo consultas separadas
6. **Páginas desnecessárias** - Assinantes, Gamificação, etc. que não fazem sentido para admin único

---

## Arquitetura Simplificada

```text
+------------------+     +-------------------+     +------------------+
|  Painel Web      | --> |  Edge Functions   | --> |   Telegram Bot   |
|  (Admin único)   |     |  - telegram-bot   |     |   (Consultas)    |
+------------------+     |  - telegram-webhook|     +------------------+
        |                |  - pix-payment    |             |
        v                +-------------------+             v
+---------------------------------------------------+
|                    Supabase                       |
|  - telegram_bots (1 bot do admin)                 |
|  - telegram_subscriptions (assinaturas unificadas)|
|  - subscription_plans (planos do admin)           |
|  - query_history (logs de consultas)              |
|  - pending_payments (pagamentos pendentes)        |
|  - bot_settings (configurações do bot)            |
+---------------------------------------------------+
```

---

## Fase 1: Limpeza do Banco de Dados

### 1.1 Remover tabela duplicada
```sql
-- Mover dados de user_subscriptions para telegram_subscriptions (se houver)
-- Depois remover user_subscriptions
DROP TABLE IF EXISTS user_subscriptions CASCADE;
```

### 1.2 Corrigir RLS Policies
- Remover policies `USING (true)` para INSERT/UPDATE/DELETE
- Criar policies baseadas em `auth.uid()` para tabelas sensíveis
- Manter SELECT público apenas onde necessário

---

## Fase 2: Simplificação do Frontend

### 2.1 Remover páginas desnecessárias
- `src/pages/Subscribers.tsx` - Não necessário (usar TelegramUsers)
- `src/pages/Gamification.tsx` - Não aplicável a admin único

### 2.2 Atualizar Sidebar
```typescript
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Bot, label: "Meu Bot", path: "/bots" },
  { icon: Users, label: "Usuários", path: "/telegram-users" },
  { icon: CreditCard, label: "Planos", path: "/plans" },
  { icon: History, label: "Consultas", path: "/logs" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];
```

### 2.3 Corrigir Dashboard (Index.tsx)
- Buscar de `telegram_subscriptions` em vez de `user_subscriptions`
- Simplificar cards de estatísticas
- Adicionar realtime para atualização automática

---

## Fase 3: Novo Hook Centralizado

### 3.1 Criar `useAdminData.ts`
Hook único que gerencia todos os dados do admin:

```typescript
// src/hooks/useAdminData.ts
interface AdminData {
  bot: TelegramBot | null;
  subscriptions: TelegramSubscription[];
  plans: SubscriptionPlan[];
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    queriesTotal: number;
    queriesToday: number;
  };
  loading: boolean;
  refresh: () => Promise<void>;
}
```

### 3.2 Implementar Realtime
- Subscription para `telegram_subscriptions`
- Subscription para `telegram_bots`
- Atualização automática de contadores

---

## Fase 4: Refatoração de Páginas

### 4.1 Dashboard Simplificado
```text
+----------------------------------+
|  Dashboard                       |
+----------------------------------+
|  [Stats Cards - 4 cards]         |
|  - Usuários Ativos               |
|  - Receita do Mês                |
|  - Consultas Hoje                |
|  - Status do Bot                 |
+----------------------------------+
|  [Status do Bot]   [Ações]       |
|  - Online/Offline  - Sync        |
|  - Webhook ativo   - Configurar  |
+----------------------------------+
|  [Últimas Assinaturas]           |
|  - Lista das 5 últimas           |
+----------------------------------+
```

### 4.2 Página de Bot Única
- Configuração centralizada do único bot
- Não permitir múltiplos bots
- Wizard de setup se não houver bot

### 4.3 Usuários Telegram (já existe)
- Manter funcionalidade atual
- Corrigir busca de dados

### 4.4 Planos (já existe)
- Manter funcionalidade atual
- Corrigir estatísticas

---

## Fase 5: Edge Functions

### 5.1 telegram-webhook (já funcional)
- Apenas verificar se está respondendo
- Adicionar health check periódico

### 5.2 telegram-bot (já funcional)
- Manter como está

### 5.3 pix-payment (já funcional)
- Manter como está

---

## Fase 6: Setup Inicial

### 6.1 Criar planos padrão (se não existirem)
```sql
INSERT INTO subscription_plans (user_id, code, name, title, price, days, is_active)
VALUES 
  ('admin-user-id', 'diario', 'Diário', 'Acesso Diário', 5.00, 1, true),
  ('admin-user-id', 'semanal', 'Semanal', 'Acesso Semanal', 15.00, 7, true),
  ('admin-user-id', 'mensal', 'Mensal', 'Acesso Mensal', 35.00, 30, true)
ON CONFLICT (code) DO NOTHING;
```

---

## Arquivos a Criar/Modificar

### Criar:
1. `src/hooks/useAdminData.ts` - Hook centralizado

### Modificar:
1. `src/pages/Index.tsx` - Dashboard simplificado com dados corretos
2. `src/pages/Bots.tsx` - Página única de bot (não lista)
3. `src/components/layout/Sidebar.tsx` - Menu simplificado
4. `src/App.tsx` - Remover rotas desnecessárias

### Remover:
1. `src/pages/Subscribers.tsx`
2. `src/pages/Gamification.tsx`

### Banco de Dados:
1. Migration para remover `user_subscriptions`
2. Migration para corrigir RLS policies

---

## Ordem de Implementação

1. **Migração do banco** - Corrigir tabelas e RLS
2. **Hook centralizado** - `useAdminData.ts`
3. **Dashboard** - Corrigir estatísticas
4. **Sidebar** - Simplificar menu
5. **Bots** - Página única de configuração
6. **Limpeza** - Remover páginas e rotas desnecessárias
7. **Testes** - Verificar fluxo completo

---

## Seção Técnica

### Consultas Corrigidas

**Dashboard Stats:**
```typescript
// ANTES (errado):
const { count } = await supabase
  .from("user_subscriptions")  // Tabela errada!
  .select("*", { count: "exact", head: true })
  .eq("status", "active");

// DEPOIS (correto):
const { count } = await supabase
  .from("telegram_subscriptions")
  .select("*", { count: "exact", head: true })
  .gte("expires_at", new Date().toISOString());
```

### Realtime Setup
```typescript
const channel = supabase
  .channel('admin-realtime')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'telegram_subscriptions' },
    () => refetch()
  )
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'telegram_bots' },
    () => refetch()
  )
  .subscribe();
```

### RLS Policies Corrigidas
```sql
-- Política correta para telegram_subscriptions
CREATE POLICY "Admin can manage subscriptions"
ON telegram_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

