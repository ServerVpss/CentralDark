import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Receipt, Percent, TrendingDown } from "lucide-react";
import type { PixSummary } from "@/hooks/usePixTransactions";

interface PixFinancialSummaryProps {
  summary: PixSummary | undefined;
  isLoading: boolean;
}

export function PixFinancialSummary({ summary, isLoading }: PixFinancialSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Lucro Total",
      value: `R$ ${(summary?.totalProfit || 0).toFixed(2)}`,
      subtitle: summary?.previousPeriodComparison !== undefined
        ? `${summary.previousPeriodComparison >= 0 ? "↗" : "↘"} ${Math.abs(summary.previousPeriodComparison).toFixed(1)}% vs período anterior`
        : null,
      subtitleColor: (summary?.previousPeriodComparison || 0) >= 0 ? "text-success" : "text-destructive",
      icon: TrendingUp,
      valueColor: "text-success",
    },
    {
      title: "Receita Bruta",
      value: `R$ ${(summary?.totalRevenue || 0).toFixed(2)}`,
      subtitle: `Custo: R$ ${((summary?.totalRevenue || 0) * 0.03).toFixed(2)}`,
      subtitleColor: "text-muted-foreground",
      icon: DollarSign,
      valueColor: "text-foreground",
    },
    {
      title: "Transações",
      value: summary?.paidCount?.toString() || "0",
      subtitle: `Média: R$ ${(summary?.averageValue || 0).toFixed(2)}/transação`,
      subtitleColor: "text-muted-foreground",
      icon: Receipt,
      valueColor: "text-foreground",
    },
    {
      title: "Margem de Lucro",
      value: `${(summary?.profitMargin || 0).toFixed(1)}%`,
      subtitle: "Markup configurado: 3%",
      subtitleColor: "text-muted-foreground",
      icon: Percent,
      valueColor: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-4 border-border/50 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <card.icon className="h-4 w-4" />
            <span className="text-sm">{card.title}</span>
          </div>
          <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
          {card.subtitle && (
            <p className={`text-xs ${card.subtitleColor}`}>{card.subtitle}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
