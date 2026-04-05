import { Activity, Clock, Gauge, RefreshCw, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiStatus } from "@/hooks/useApiStatus";
import { cn } from "@/lib/utils";

export function ApiStatusCard() {
  const { data, loading, error, refresh } = useApiStatus();

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-card border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-destructive" />
            Status da API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "Não foi possível carregar"}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usagePercent = data.total_diario > 0
    ? Math.round((data.consumo_hoje / data.total_diario) * 100)
    : 0;
  const remaining = data.total_diario - data.consumo_hoje;
  const isHighUsage = usagePercent >= 80;
  const isCritical = usagePercent >= 95;

  return (
    <Card className={cn(
      "bg-card border-border overflow-hidden relative",
      data.ativo ? "border-emerald-500/20" : "border-destructive/30"
    )}>
      {/* Top accent */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5",
        data.ativo ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-destructive"
      )} />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              data.ativo
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive"
            )}>
              <Shield className="h-4 w-4" />
            </div>
            Status da API
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
              data.ativo
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-destructive/15 text-destructive"
            )}>
              {data.plano_status}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refresh}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              Consultas hoje
            </span>
            <span className={cn(
              "font-semibold tabular-nums",
              isCritical ? "text-destructive" : isHighUsage ? "text-amber-400" : "text-foreground"
            )}>
              {data.consumo_hoje} / {data.total_diario}
            </span>
          </div>
          <Progress
            value={usagePercent}
            className={cn(
              "h-2.5 rounded-full",
              isCritical ? "[&>div]:bg-destructive" : isHighUsage ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{remaining} restantes</span>
            <span>{usagePercent}% usado</span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Plano</p>
              <p className="font-medium text-foreground">{data.plano_tipo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <div>
              <p className="text-xs text-muted-foreground">Expira em</p>
              <p className="font-medium text-foreground">
                {data.dias_restantes !== null ? `${data.dias_restantes} dias` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Reset info */}
        {data.reset_em && (
          <p className="text-xs text-muted-foreground text-center pt-1 border-t border-border">
            Reset do limite diário em <span className="font-medium text-foreground">{data.reset_em}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
