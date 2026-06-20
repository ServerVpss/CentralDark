import { CreditCard, MessageSquare, Search, Shield, CheckCircle, AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
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

const colorMap = {
  payment: "text-emerald-500 bg-emerald-500/10",
  subscription: "text-emerald-500 bg-emerald-500/10",
  query: "text-cyan-500 bg-cyan-500/10",
  security: "text-amber-500 bg-amber-500/10",
  message: "text-violet-500 bg-violet-500/10",
  success: "text-emerald-500 bg-emerald-500/10",
  warning: "text-amber-500 bg-amber-500/10",
};

interface ActivityItemProps {
  activity: {
    id: string;
    type: "payment" | "subscription" | "security" | "message" | "query" | "success" | "warning";
    title: string;
    description: string;
    time: string;
  };
}

const ActivityItem = memo(({ activity }: ActivityItemProps) => {
  const Icon = iconMap[activity.type] || MessageSquare;
  const color = colorMap[activity.type] || "text-primary bg-primary/10";

  return (
    <div className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-foreground leading-tight">{activity.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 self-center">
        {activity.time}
      </span>
    </div>
  );
});

ActivityItem.displayName = "ActivityItem";

export function ActivityFeed() {
  const { activities, loading, refresh } = useNotifications();
  const list = useMemo(() => activities, [activities]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 p-2.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground">Atividade Recente</h3>
        <Button variant="ghost" size="sm" onClick={refresh} className="h-7 px-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 mr-1" />
          Atualizar
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-10 px-4">
          <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-0.5">
            {list.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
