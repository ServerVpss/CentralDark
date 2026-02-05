import { AlertTriangle, CheckCircle, CreditCard, MessageSquare, Search, Shield, RefreshCw, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo, memo } from "react";

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

interface ActivityItemProps {
  activity: {
    id: string;
    type: "payment" | "subscription" | "security" | "message" | "query" | "success" | "warning";
    title: string;
    description: string;
    time: string;
  };
  index: number;
}

const ActivityItem = memo(({ activity, index }: ActivityItemProps) => {
  const Icon = iconMap[activity.type] || MessageSquare;
  const gradient = gradientMap[activity.type] || "from-primary to-amber-600";

  return (
    <div
      className="group flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-muted/30 animate-slide-in-right"
      style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
    >
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm",
        "transition-transform duration-200 group-hover:scale-105",
        gradient
      )}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className="font-medium text-sm text-foreground leading-tight">{activity.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {activity.description}
        </p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap px-2 py-0.5 rounded-md bg-muted/50 shrink-0 self-center">
        {activity.time}
      </span>
    </div>
  );
});

ActivityItem.displayName = "ActivityItem";

export function ActivityFeed() {
  const { activities, loading, refresh } = useNotifications();

  const memoizedActivities = useMemo(() => activities, [activities]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/20">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Atividade Recente</h2>
            <p className="text-xs text-muted-foreground">Atualizações em tempo real</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={refresh}
          className="gap-1.5 text-xs h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>

      {/* Content */}
      {memoizedActivities.length === 0 ? (
        <div className="text-center py-12 px-6">
          <div className="relative mx-auto mb-4 w-fit">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted to-muted/50 blur-xl opacity-50" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-muted border border-border/50">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
            As atividades do sistema aparecerão aqui em tempo real
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[340px]">
          <div className="p-2 space-y-1">
            {memoizedActivities.map((activity, index) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                index={index} 
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
