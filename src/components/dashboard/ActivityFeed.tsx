import { AlertTriangle, CheckCircle, CreditCard, MessageSquare, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  payment: CreditCard,
  subscription: CreditCard,
  query: Search,
  security: Shield,
  message: MessageSquare,
  success: CheckCircle,
  warning: AlertTriangle,
};

const colorMap = {
  payment: "text-success bg-success/10",
  subscription: "text-success bg-success/10",
  query: "text-accent bg-accent/10",
  security: "text-warning bg-warning/10",
  message: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
};

export function ActivityFeed() {
  const { activities, loading, refresh } = useNotifications();

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Atividade Recente</h2>
        <button 
          onClick={refresh}
          className="text-sm text-primary hover:underline"
        >
          Atualizar
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground mt-1">
            As atividades aparecerão aqui em tempo real
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type] || MessageSquare;
            const color = colorMap[activity.type] || "text-primary bg-primary/10";
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-secondary/30"
              >
                <div className={cn("rounded-lg p-2", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
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
