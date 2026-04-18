import { Target, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { PixSummary } from "@/hooks/usePixTransactions";

interface BreakEvenGoalProps {
  summary: PixSummary | undefined;
  isLoading: boolean;
}

export function BreakEvenGoal({ summary, isLoading }: BreakEvenGoalProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 p-6" style={{
        background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
      }}>
        <Skeleton className="h-6 w-48 mb-4 bg-muted/20" />
        <Skeleton className="h-4 w-full mb-3 bg-muted/20" />
        <Skeleton className="h-3 w-full bg-muted/20" />
      </div>
    );
  }

  const goal = summary?.monthlyFixedCost ?? 500;
  const revenue = summary?.totalRevenue ?? 0;
  const progress = goal > 0 ? Math.min((revenue / goal) * 100, 100) : 0;
  const reached = revenue >= goal;
  const remaining = Math.max(goal - revenue, 0);
  const surplus = Math.max(revenue - goal, 0);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
        reached
          ? "border-emerald-500/40 shadow-xl shadow-emerald-500/10"
          : "border-amber-500/30 shadow-xl shadow-amber-500/5"
      )}
      style={{
        background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
      }}
    >
      {/* Glow decorativo */}
      <div className={cn(
        "absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-20",
        reached ? "bg-emerald-500" : "bg-amber-500"
      )} />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
              reached
                ? "from-emerald-500 to-green-600"
                : "from-amber-500 to-orange-600"
            )}>
              {reached ? (
                <CheckCircle2 className="h-6 w-6 text-white" />
              ) : (
                <Target className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {reached ? "🎉 Parabéns! Você já está ganhando dinheiro" : "🎯 Quanto falta pra você começar a ganhar"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {reached
                  ? `Você já pagou as contas do mês e ainda sobrou R$ ${surplus.toFixed(2)} no seu bolso 💰`
                  : `Faltam R$ ${remaining.toFixed(2)} pra pagar as contas do mês. Depois disso, tudo vira lucro pra você`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Você já fez</p>
            <p className={cn(
              "text-2xl font-bold tabular-nums",
              reached ? "text-emerald-400" : "text-amber-400"
            )}>
              {progress.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/30 border border-border/50">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-700 relative overflow-hidden",
                reached
                  ? "from-emerald-500 via-green-400 to-emerald-500"
                  : "from-amber-500 via-orange-500 to-amber-500"
              )}
              style={{ width: `${progress}%` }}
            >
              {/* Brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
            {/* Marcador da meta */}
            {!reached && (
              <div className="absolute right-0 top-0 h-full w-0.5 bg-foreground/30" />
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Começou em R$ 0
            </span>
            <span className={cn(
              "font-bold tabular-nums",
              reached ? "text-emerald-400" : "text-foreground"
            )}>
              Você recebeu R$ {revenue.toFixed(2)}
            </span>
            <span className="text-muted-foreground">
              Precisa: R$ {goal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <div className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
          reached
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/5 text-amber-200"
        )}>
          {reached ? (
            <TrendingUp className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <p>
            {reached
              ? `Tudo que você receber agora é lucro puro no seu bolso. Bora vender mais! 🚀`
              : `Você precisa receber mais R$ ${remaining.toFixed(2)} esse mês pra pagar o que gasta com o sistema (R$ ${goal.toFixed(2)}/mês). Depois disso, o resto é tudo seu.`}
          </p>
        </div>
      </div>
    </div>
  );
}
