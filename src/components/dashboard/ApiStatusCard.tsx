import { useState } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useApiUsageHistory, type ApiUsagePeriod } from "@/hooks/useApiUsageHistory";
import { cn } from "@/lib/utils";

const PERIODS: { key: ApiUsagePeriod; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7d" },
  { key: "15d", label: "15d" },
  { key: "30d", label: "30d" },
];

export function ApiStatusCard() {
  const { data, loading, error, refresh } = useApiStatus();
  const [period, setPeriod] = useState<ApiUsagePeriod>("today");
  const { data: history, isLoading: historyLoading } = useApiUsageHistory(period);

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

  // Valor exibido conforme filtro
  const displayValue = period === "today"
    ? data.consumo_hoje
    : history?.total ?? 0;
  const displayLabel = period === "today"
    ? `${data.consumo_hoje}/${data.total_diario}`
    : `${displayValue.toLocaleString("pt-BR")} consultas`;

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

      {/* Filtros de período */}
      <div className="flex gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              "flex-1 text-[10px] font-medium px-1.5 py-1 rounded-md transition-colors",
              period === p.key
                ? "bg-primary/15 text-primary"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground truncate">
            {historyLoading && period !== "today" ? "..." : displayLabel}
          </span>
          {period === "today" && (
            <span className={cn(
              "font-medium tabular-nums",
              isCritical ? "text-destructive" : isHigh ? "text-amber-500" : "text-foreground"
            )}>
              {usagePercent}%
            </span>
          )}
        </div>
        {period === "today" && (
          <Progress
            value={usagePercent}
            className={cn(
              "h-1.5",
              isCritical ? "[&>div]:bg-destructive" : isHigh ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
            )}
          />
        )}
      </div>
    </div>
  );
}
