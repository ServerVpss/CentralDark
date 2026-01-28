
# Plano: Sistema de Notificações de Compras em Tempo Real

## Problema Identificado

O sistema de notificações atual tem as seguintes falhas:
1. **ActivityFeed usa dados mockados** - Os dados de atividade no dashboard são estáticos (hardcoded)
2. **Sem notificações push no painel** - Quando uma compra é confirmada, o admin não recebe notificação visual
3. **Realtime não conectado ao ActivityFeed** - Não há subscription para novas assinaturas/pagamentos

## Arquitetura da Solução

```text
+--------------------+     +---------------------+     +------------------+
|  Telegram Bot      | --> |  telegram_webhook   | --> |  Supabase DB     |
|  (Pagamento PIX)   |     |  confirmPayment()   |     |  - subscriptions |
+--------------------+     +---------------------+     |  - payments      |
                                                       +------------------+
                                                              |
                                    Realtime Channel (postgres_changes)
                                                              |
                                                              v
                                                       +------------------+
                                                       |  Painel Web      |
                                                       |  - ActivityFeed  |
                                                       |  - Toast notif   |
                                                       +------------------+
```

## Componentes a Implementar

### 1. Tabela de Notificações (opcional, mas recomendado)
Criar uma tabela `admin_notifications` para armazenar histórico:

```sql
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'payment', 'subscription', 'security', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Hook de Notificações (`useNotifications.ts`)

Novo hook centralizado para:
- Buscar notificações do banco (ou montar a partir de telegram_subscriptions)
- Escutar eventos realtime de novas assinaturas
- Disparar toast sonner quando nova compra for detectada
- Marcar notificações como lidas

```typescript
// Estrutura básica
interface Notification {
  id: string;
  type: 'payment' | 'subscription' | 'security' | 'message';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  data?: Record<string, unknown>;
}

export function useNotifications() {
  // 1. Buscar últimas assinaturas como "atividades"
  // 2. Subscription realtime para telegram_subscriptions
  // 3. Quando nova assinatura chegar, disparar toast
  // 4. Retornar lista de atividades formatadas
}
```

### 3. ActivityFeed Refatorado

Modificar `ActivityFeed.tsx` para:
- Usar o novo hook `useNotifications`
- Exibir dados reais em vez de mockados
- Mostrar últimas 10 atividades (compras, consultas, etc.)
- Atualizar em tempo real

### 4. Sistema de Toast para Novas Compras

Quando uma nova assinatura for inserida no banco:
- O hook detecta via realtime
- Dispara um toast success com som (opcional)
- Adiciona à lista de atividades

## Arquivos a Criar/Modificar

### Criar:
1. `src/hooks/useNotifications.ts` - Hook centralizado de notificações
2. Migration para tabela `admin_notifications` (opcional)

### Modificar:
1. `src/components/dashboard/ActivityFeed.tsx` - Usar dados reais
2. `src/pages/Index.tsx` - Integrar notificações toast

---

## Seção Técnica

### Hook useNotifications.ts

```typescript
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: "payment" | "subscription" | "security" | "message" | "query";
  title: string;
  description: string;
  time: string;
  data?: Record<string, unknown>;
}

export function useNotifications() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    // Buscar últimas 20 assinaturas
    const { data: subs } = await supabase
      .from("telegram_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    // Buscar últimas 10 consultas
    const { data: queries } = await supabase
      .from("query_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // Formatar como atividades
    const formattedActivities: Activity[] = [
      ...(subs || []).map((s) => ({
        id: s.id,
        type: "payment" as const,
        title: "Nova Assinatura",
        description: `${s.plan_name} - R$ ${s.value?.toFixed(2)}`,
        time: formatTimeAgo(s.created_at),
        data: s,
      })),
      ...(queries || []).map((q) => ({
        id: q.id,
        type: "query" as const,
        title: `Consulta ${q.query_type.toUpperCase()}`,
        description: q.query_input,
        time: formatTimeAgo(q.created_at),
      })),
    ].sort((a, b) => /* ordenar por data */).slice(0, 15);

    setActivities(formattedActivities);
    setLoading(false);
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_subscriptions" },
        (payload) => {
          const newSub = payload.new;
          // Disparar toast
          toast.success("💰 Nova Compra!", {
            description: `${newSub.plan_name} - R$ ${newSub.value?.toFixed(2)}`,
            duration: 5000,
          });
          // Atualizar lista
          fetchActivities();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "query_history" },
        () => fetchActivities()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchActivities]);

  return { activities, loading, refresh: fetchActivities };
}
```

### ActivityFeed Modificado

```typescript
import { useNotifications } from "@/hooks/useNotifications";
import { CreditCard, Search, Shield, Clock } from "lucide-react";

const iconMap = {
  payment: CreditCard,
  query: Search,
  security: Shield,
  subscription: CreditCard,
  message: MessageSquare,
};

export function ActivityFeed() {
  const { activities, loading } = useNotifications();

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
      {activities.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma atividade recente
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### Função formatTimeAgo

```typescript
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}
```

---

## Ordem de Implementação

1. **Criar hook `useNotifications.ts`** - Lógica centralizada
2. **Atualizar `ActivityFeed.tsx`** - Consumir dados reais
3. **Testar realtime** - Adicionar assinatura via bot e ver toast
4. (Opcional) Criar tabela `admin_notifications` para persistência

## Resultado Esperado

- Quando um usuário pagar via PIX e a assinatura for confirmada:
  1. Toast aparece no canto da tela: "💰 Nova Compra! Plano Mensal - R$ 35.00"
  2. ActivityFeed atualiza automaticamente com a nova entrada
  3. Stats do dashboard (receita, assinantes) atualizam em tempo real
