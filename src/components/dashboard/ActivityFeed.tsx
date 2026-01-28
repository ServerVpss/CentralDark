import { AlertTriangle, CheckCircle, CreditCard, MessageSquare, Search, Shield, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const iconMap = {
  payment: CreditCard,
  subscription: CreditCard,
  query: Search,
  security: Shield,
  message: MessageSquare,
  success: CheckCircle,
  warning: AlertTriangle,
};

const gradientMap = {
  payment: "from-emerald-500 to-green-500",
  subscription: "from-emerald-500 to-green-500",
  query: "from-cyan-500 to-blue-500",
  security: "from-amber-500 to-orange-500",
  message: "from-violet-500 to-purple-500",
  success: "from-emerald-500 to-green-500",
  warning: "from-amber-500 to-orange-500",
};

export function ActivityFeed() {
  const { activities, loading, refresh } = useNotifications();

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 p-6" style={{
        background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
      }}>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-40 bg-white/5" />
          <Skeleton className="h-4 w-16 bg-white/5" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2 bg-white/5" />
                <Skeleton className="h-3 w-48 bg-white/5" />
              </div>
              <Skeleton className="h-3 w-16 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 p-6" style={{
      background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
    }}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Atividade Recente</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={refresh}
          className="gap-2 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-white/10">
          <div className="relative mx-auto mb-4 w-fit">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-amber-600/10 blur-xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground mt-1">
            As atividades aparecerão aqui em tempo real
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.type] || MessageSquare;
            const gradient = gradientMap[activity.type] || "from-primary to-amber-600";
            
            return (
              <div
                key={activity.id}
                className="group flex items-start gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-white/5 animate-slide-in-right"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                  gradient
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-1 rounded-md">
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