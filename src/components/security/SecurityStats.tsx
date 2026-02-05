import { Ban, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SecurityStats as Stats } from "@/hooks/useSecurity";

interface SecurityStatsProps {
  stats: Stats;
  loading?: boolean;
}

interface StatCard {
  key: keyof Stats;
  label: string;
  icon: typeof Ban;
  colorClass: string;
  bgClass: string;
  isPercentage?: boolean;
}

const statCards: StatCard[] = [
  {
    key: "linksBlocked",
    label: "Links bloqueados",
    icon: Ban,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  {
    key: "spamRemoved",
    label: "Spam removido",
    icon: AlertTriangle,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
  },
  {
    key: "floodBlocked",
    label: "Flood bloqueado",
    icon: Zap,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    key: "protectionRate",
    label: "Taxa de proteção",
    icon: ShieldCheck,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    isPercentage: true,
  },
];

export function SecurityStats({ stats, loading }: SecurityStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const displayValue = card.isPercentage
          ? `${value > 0 ? value.toFixed(1) : "0"}%`
          : value.toString();

        return (
          <Card
            key={card.key}
            className="group bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgClass} transition-transform group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${card.colorClass}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{displayValue}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
