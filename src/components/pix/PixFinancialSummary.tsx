import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Receipt, Percent, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PixSummary } from "@/hooks/usePixTransactions";

interface PixFinancialSummaryProps {
  summary: PixSummary | undefined;
  isLoading: boolean;
}

type CardVariant = "primary" | "emerald" | "cyan" | "amber" | "violet";

const variantStyles: Record<CardVariant, { iconBg: string; iconColor: string; accent: string; ring: string }> = {
  primary: {
    iconBg: "bg-gradient-to-br from-primary to-primary-glow",
    iconColor: "text-primary-foreground",
    accent: "text-primary",
    ring: "shadow-[0_0_40px_hsl(var(--primary)/0.15)]",
  },
  emerald: {
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    iconColor: "text-white",
    accent: "text-emerald-400",
    ring: "shadow-[0_0_40px_hsl(152_80%_50%/0.12)]",
  },
  cyan: {
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
    iconColor: "text-white",
    accent: "text-cyan-400",
    ring: "shadow-[0_0_40px_hsl(192_80%_55%/0.12)]",
  },
  amber: {
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    iconColor: "text-white",
    accent: "text-amber-400",
    ring: "shadow-[0_0_40px_hsl(38_95%_55%/0.12)]",
  },
  violet: {
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    iconColor: "text-white",
    accent: "text-violet-400",
    ring: "shadow-[0_0_40px_hsl(280_70%_55%/0.12)]",
  },
};

export function PixFinancialSummary({ summary, isLoading }: PixFinancialSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card-premium p-5">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const profit = summary?.totalProfit ?? 0;
  const isProfitable = profit >= 0;

  const cards: Array<{
    title: string;
    value: string;
    change: string | null;
    changeType: "positive" | "negative" | "neutral";
    icon: typeof TrendingUp;
    variant: CardVariant;
    highlight?: boolean;
  }> = [
    {
      title: "Lucro Líquido",
      value: `R$ ${profit.toFixed(2)}`,
      change: `Receita − Custo fixo (R$ ${(summary?.proratedCost ?? 0).toFixed(2)})`,
      changeType: isProfitable ? "positive" : "negative",
      icon: TrendingUp,
      variant: isProfitable ? "emerald" : "amber",
      highlight: true,
    },
    {
      title: "Receita Bruta",
      value: `R$ ${(summary?.totalRevenue || 0).toFixed(2)}`,
      change: summary?.previousPeriodComparison !== undefined
        ? `${summary.previousPeriodComparison >= 0 ? "+" : ""}${summary.previousPeriodComparison.toFixed(1)}% vs anterior`
        : null,
      changeType: (summary?.previousPeriodComparison ?? 0) >= 0 ? "positive" : "negative",
      icon: DollarSign,
      variant: "primary",
    },
    {
      title: "Transações",
      value: (summary?.paidCount ?? 0).toString(),
      change: `Ticket médio: R$ ${(summary?.averageValue || 0).toFixed(2)}`,
      changeType: "neutral",
      icon: Receipt,
      variant: "cyan",
    },
    {
      title: "Conversão",
      value: `${(summary?.conversionRate || 0).toFixed(1)}%`,
      change: `${summary?.paidCount ?? 0} de ${summary?.transactionCount ?? 0} pagos`,
      changeType: "neutral",
      icon: Target,
      variant: "violet",
    },
    {
      title: "Margem",
      value: `${(summary?.profitMargin || 0).toFixed(1)}%`,
      change: `Custo: R$ ${(summary?.monthlyFixedCost ?? 500).toFixed(2)}/mês`,
      changeType: "neutral",
      icon: Percent,
      variant: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const style = variantStyles[card.variant];
        const Icon = card.icon;
        const TrendIcon = card.changeType === "positive" ? ArrowUpRight : card.changeType === "negative" ? ArrowDownRight : null;

        return (
          <div
            key={index}
            className={cn(
              "card-premium hover-lift group relative overflow-hidden p-5",
              style.ring,
              card.highlight && "md:col-span-2 xl:col-span-1 ring-1 ring-primary/20"
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Decorative corner glow */}
            <div className={cn(
              "absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-10 transition-all duration-500 group-hover:opacity-25 group-hover:scale-110",
              style.iconBg
            )} />

            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </p>
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                  style.iconBg
                )}>
                  <Icon className={cn("h-5 w-5", style.iconColor)} strokeWidth={2.25} />
                </div>
              </div>

              <div className="space-y-2">
                <p className={cn(
                  "text-3xl font-bold tabular-nums tracking-tight",
                  card.highlight ? style.accent : "text-foreground"
                )}>
                  {card.value}
                </p>
                {card.change && (
                  <div className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-medium tabular-nums",
                    card.changeType === "positive" && "text-primary",
                    card.changeType === "negative" && "text-destructive",
                    card.changeType === "neutral" && "text-muted-foreground"
                  )}>
                    {TrendIcon && <TrendIcon className="h-3 w-3" />}
                    <span>{card.change}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover bottom gradient */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            )} />
          </div>
        );
      })}
    </div>
  );
}
