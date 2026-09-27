import { useState } from "react";
import { Shield, KeyRound, Mail } from "lucide-react";
import { Progress } from "@/compartilhado/ui/progress";
import { Button } from "@/compartilhado/ui/button";
import { Skeleton } from "@/compartilhado/ui/skeleton";
import { useApiStatus } from "@/compartilhado/hooks/useApiStatus";
import { useApiUsageHistory, type ApiUsagePeriod } from "@/compartilhado/hooks/useApiUsageHistory";
import { cn } from "@/compartilhado/lib/utils";
import { SyncStatusIcon } from "@/compartilhado/ui/sync-status-icon";

const PERIODS: { key: ApiUsagePeriod; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7d" },
  { key: "15d", label: "15d" },
  { key: "30d", label: "30d" },
];

const ADMIN_MAILTO =
  "mailto:contacobra3467@gmail.com" +
  "?subject=" + encodeURIComponent("CentralDark — Chave da VeiculosAPI expirada") +
  "&body=" + encodeURIComponent("Oi, a chave da VeiculosAPI foi rejeitada (não autorizada). Precisa renovar o secret ISEEK_API_KEY.");

export function ApiStatusCard() {
  const { data, loading, errorKind, refresh } = useApiStatus();
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

  if (errorKind === "expired_key") {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-card p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <KeyRound className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-500">Chave da API expirada</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A chave da VeiculosAPI foi rejeitada (não autorizada). Renove a chave para
          voltar a operar — as consultas ficam pausadas até lá.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            asChild
            size="sm"
            className="h-7 text-xs gap-1"
          >
            <a href={ADMIN_MAILTO}>
              <Mail className="h-3 w-3" />
              Falar com admin
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={refresh}
            aria-label="Verificar novamente"
          >
            <SyncStatusIcon status="error" size={12} withTooltip={false} />
            Tentar de novo
          </Button>
        </div>
      </div>
    );
  }

  if (errorKind || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-3.5 w-3.5 text-destructive" />
          <span className="text-muted-foreground text-xs">API Offline</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-7 text-xs gap-1"
          onClick={refresh}
          aria-label="Tentar reconectar com a API"
        >
          <SyncStatusIcon status="error" size={12} withTooltip={false} />
          Tentar de novo
        </Button>
      </div>
    );
  }



  const usagePercent = data.total_diario > 0
    ? Math.round((data.consumo_hoje / data.total_diario) * 100)
    : 0;
  const isCritical = usagePercent >= 95;
  const isHigh = usagePercent >= 80;

  // Estado "sem dados ainda" — quando a API responde mas não há plano/uso
  const semDados = data.total_diario === 0 && data.consumo_hoje === 0;

  // Valor exibido conforme filtro
  const displayValue = period === "today"
    ? data.consumo_hoje
    : history?.total ?? 0;
  const displayLabel = period === "today"
    ? (semDados ? "Aguardando primeira consulta" : `${data.consumo_hoje}/${data.total_diario}`)
    : `${displayValue.toLocaleString("pt-BR")} consultas`;

  // Quando está sem dados, tratamos como online se a API respondeu (data existe)
  const statusOnline = data.ativo || semDados;

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 space-y-2",
      statusOnline ? "border-border/40" : "border-destructive/30"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Status API</span>
        <span className={cn(
          "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
          statusOnline ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"
        )}>
          {statusOnline ? "Online" : "Offline"}
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
                : "bg-muted/45 text-muted-foreground hover:bg-muted/65"
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
          {period === "today" && !semDados && (
            <span className={cn(
              "font-medium tabular-nums",
              isCritical ? "text-destructive" : isHigh ? "text-amber-500" : "text-foreground"
            )}>
              {usagePercent}%
            </span>
          )}
        </div>
        {period === "today" && !semDados && (
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
