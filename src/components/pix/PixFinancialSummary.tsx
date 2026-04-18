import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Receipt, Percent, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PixSummary } from "@/hooks/usePixTransactions";

interface PixFinancialSummaryProps {
  summary: PixSummary | undefined;
  isLoading: boolean;
}

const gradientStyles = {
  gold: {
    bg: "from-amber-500/15 via-orange-500/10 to-transparent",
    icon: "from-amber-500 to-orange-500",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
  },
  cyan: {
    bg: "from-cyan-500/15 via-blue-500/10 to-transparent",
    icon: "from-cyan-500 to-blue-500",
    border: "border-cyan-500/20",
    glow: "shadow-cyan-500/20",
  },
  green: {
    bg: "from-emerald-500/15 via-green-500/10 to-transparent",
    icon: "from-emerald-500 to-green-500",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
  },
  purple: {
    bg: "from-violet-500/15 via-purple-500/10 to-transparent",
    icon: "from-violet-500 to-purple-500",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/20",
  },
};

export function PixFinancialSummary({ summary, isLoading }: PixFinancialSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 p-5" style={{
            background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
          }}>
            <Skeleton className="h-4 w-24 mb-3 bg-muted/20" />
            <Skeleton className="h-8 w-32 mb-2 bg-muted/20" />
            <Skeleton className="h-3 w-20 bg-muted/20" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Lucro Líquido",
      value: `R$ ${(summary?.totalProfit || 0).toFixed(2)}`,
      change: `Receita R$ ${(summary?.totalRevenue || 0).toFixed(2)} − Custo fixo R$ ${(summary?.proratedCost ?? 0).toFixed(2)}`,
      changeType: (summary?.totalProfit || 0) >= 0 ? "positive" : "negative",
      icon: TrendingUp,
      gradient: "green" as const,
    },
    {
      title: "Receita Bruta",
      value: `R$ ${(summary?.totalRevenue || 0).toFixed(2)}`,
      change: summary?.previousPeriodComparison !== undefined
        ? `${summary.previousPeriodComparison >= 0 ? "+" : ""}${summary.previousPeriodComparison.toFixed(1)}% vs período anterior`
        : null,
      changeType: "neutral" as const,
      icon: DollarSign,
      gradient: "gold" as const,
    },
    {
      title: "Transações",
      value: summary?.paidCount?.toString() || "0",
      change: `Média: R$ ${(summary?.averageValue || 0).toFixed(2)}/transação`,
      changeType: "neutral" as const,
      icon: Receipt,
      gradient: "cyan" as const,
    },
    {
      title: "Taxa de Conversão",
      value: `${(summary?.conversionRate || 0).toFixed(1)}%`,
      change: `${summary?.paidCount ?? 0} pagos de ${summary?.transactionCount ?? 0} gerados`,
      changeType: "neutral" as const,
      icon: Target,
      gradient: "cyan" as const,
    },
    {
      title: "Margem de Lucro",
      value: `${(summary?.profitMargin || 0).toFixed(1)}%`,
      change: `Custo fixo: R$ ${(summary?.monthlyFixedCost ?? 500).toFixed(2)}/mês`,
      changeType: "neutral" as const,
      icon: Percent,
      gradient: "purple" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const style = gradientStyles[card.gradient];
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
              "hover:shadow-xl hover:-translate-y-1",
              style.border,
              style.glow
            )}
            style={{
              background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
            }}
          >
            {/* Gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-75",
              style.bg
            )} />
            
            {/* Decorative glow */}
            <div className={cn(
              "absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl transition-all duration-500",
              "bg-gradient-to-br opacity-20 group-hover:opacity-40 group-hover:scale-110",
              style.icon
            )} />
            
            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className={cn(
                  "text-3xl font-bold tracking-tight",
                  card.gradient === "green" ? "text-emerald-400" : "text-foreground"
                )}>
                  {card.value}
                </p>
                {card.change && (
                  <p className={cn(
                    "text-xs font-medium",
                    card.changeType === "positive" && "text-emerald-400",
                    card.changeType === "negative" && "text-rose-400",
                    card.changeType === "neutral" && "text-muted-foreground"
                  )}>
                    {card.change}
                  </p>
                )}
              </div>
              
              {/* Icon with gradient */}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-gradient-to-br shadow-lg",
                style.icon
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity",
              style.icon
            )} />
          </div>
        );
      })}
    </div>
  );
}
