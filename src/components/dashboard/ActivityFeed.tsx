import { AlertTriangle, CheckCircle, CreditCard, MessageSquare, Search, Shield, RefreshCw, Clock } from "lucide-react";
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
      className="group flex items-start gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-muted/50 animate-slide-in-right"
      style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
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
      <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-md shrink-0">
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
      <div className="rounded-2xl border border-border/50 p-6 bg-card">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
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
    <div className="rounded-2xl border border-border/50 p-6 bg-card">
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

      {memoizedActivities.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-border">
          <div className="relative mx-auto mb-4 w-fit">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground mt-1">
            As atividades aparecerão aqui em tempo real
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[320px] -mx-2 px-2">
          <div className="space-y-3 pr-4">
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
