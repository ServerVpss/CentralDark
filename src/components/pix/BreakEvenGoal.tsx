import { Target, TrendingUp, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
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
      <div className="card-premium p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-3 w-full" />
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
        "card-premium relative overflow-hidden p-6 md:p-8",
        reached
          ? "border-primary/40 shadow-[0_0_60px_hsl(var(--primary)/0.15)]"
          : "border-amber-500/30 shadow-[0_0_40px_hsl(38_95%_55%/0.08)]"
      )}
    >
      {/* Background glow */}
      <div className={cn(
        "absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-20",
        reached ? "bg-primary" : "bg-amber-500"
      )} />
      <div className={cn(
        "absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-3xl opacity-10",
        reached ? "bg-primary-glow" : "bg-orange-500"
      )} />

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl",
              reached
                ? "bg-gradient-to-br from-primary to-primary-glow shadow-primary/40"
                : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
            )}>
              {reached ? (
                <CheckCircle2 className="h-7 w-7 text-primary-foreground" strokeWidth={2.25} />
              ) : (
                <Target className="h-7 w-7 text-white" strokeWidth={2.25} />
              )}
              <div className={cn(
                "absolute inset-0 rounded-2xl blur-md -z-10",
                reached ? "bg-primary/40" : "bg-amber-500/40"
              )} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                {reached ? "🎉 Você está no lucro!" : "🎯 Quanto falta pra começar a lucrar"}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {reached
                  ? "Pagou as contas do mês e o resto é tudo seu"
                  : `Faltam R$ ${remaining.toFixed(2)} pra pagar as contas do mês`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Progresso</p>
            <p className={cn(
              "text-3xl font-bold tabular-nums tracking-tight",
              reached ? "text-primary" : "text-amber-400"
            )}>
              {progress.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* DESTAQUE GIGANTE DO LUCRO */}
        {reached && (
          <div className="relative rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center overflow-hidden animate-scale-in">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.2),transparent_70%)]" />
            <Sparkles className="absolute top-4 right-4 h-5 w-5 text-primary/40 animate-pulse" />
            <Sparkles className="absolute bottom-4 left-4 h-4 w-4 text-primary/30 animate-pulse" style={{ animationDelay: "1s" }} />

            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary/80 mb-3">
                💰 Seu lucro até agora
              </p>
              <p className="text-6xl md:text-7xl font-black tabular-nums tracking-tighter text-gradient-money drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
                R$ {surplus.toFixed(2)}
              </p>
              <p className="text-sm text-primary/70 mt-3 font-medium">
                já está no seu bolso 🚀
              </p>
            </div>
          </div>
        )}

        {/* Barra de progresso */}
        <div className="space-y-3">
          <div className="relative h-5 w-full overflow-hidden rounded-full bg-muted/40 border border-border/50">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-1000 relative overflow-hidden",
                reached
                  ? "from-primary via-primary-glow to-primary"
                  : "from-amber-500 via-orange-500 to-amber-500"
              )}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            {!reached && (
              <div className="absolute right-0 top-0 h-full w-0.5 bg-foreground/40" />
            )}
          </div>

          <div className="flex items-center justify-between text-xs tabular-nums">
            <span className="text-muted-foreground font-medium">R$ 0</span>
            <span className={cn(
              "font-bold",
              reached ? "text-primary" : "text-foreground"
            )}>
              Recebido: R$ {revenue.toFixed(2)}
            </span>
            <span className="text-muted-foreground font-medium">Meta: R$ {goal.toFixed(2)}</span>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <div className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm",
          reached
            ? "border-primary/30 bg-primary/5 text-primary"
            : "border-amber-500/30 bg-amber-500/5 text-amber-200"
        )}>
          {reached ? (
            <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed">
            {reached
              ? "Tudo que entrar agora é lucro puro. Bora vender mais! 🚀"
              : `Você precisa receber mais R$ ${remaining.toFixed(2)} esse mês pra cobrir o custo de R$ ${goal.toFixed(2)}/mês. Depois disso, o resto é tudo seu.`}
          </p>
        </div>
      </div>
    </div>
  );
}
