import { Shield, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiStatus } from "@/hooks/useApiStatus";
import { cn } from "@/lib/utils";

export function ApiStatusCard() {
  const { data, loading, error, refresh } = useApiStatus();

  if (loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-4 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-3.5 w-3.5 text-destructive" />
          <span className="text-muted-foreground text-xs">API Offline</span>
        </div>
        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={refresh}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  const usagePercent = data.total_diario > 0
    ? Math.round((data.consumo_hoje / data.total_diario) * 100)
    : 0;
  const isCritical = usagePercent >= 95;
  const isHigh = usagePercent >= 80;

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 space-y-2",
      data.ativo ? "border-border/40" : "border-destructive/30"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Status API</span>
        <span className={cn(
          "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
          data.ativo ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"
        )}>
          {data.ativo ? "Online" : "Offline"}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{data.consumo_hoje}/{data.total_diario}</span>
          <span className={cn(
            "font-medium tabular-nums",
            isCritical ? "text-destructive" : isHigh ? "text-amber-500" : "text-foreground"
          )}>
            {usagePercent}%
          </span>
        </div>
        <Progress
          value={usagePercent}
          className={cn(
            "h-1.5",
            isCritical ? "[&>div]:bg-destructive" : isHigh ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
          )}
        />
      </div>
    </div>
  );
}
