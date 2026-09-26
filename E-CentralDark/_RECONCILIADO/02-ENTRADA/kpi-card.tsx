import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  delta?: number; // %
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "primary" | "glass";
  className?: string;
};

export function KpiCard({ label, value, hint, delta, icon: Icon, variant = "default", className }: Props) {
  const isUp = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-lg",
        variant === "default" && "bg-card",
        variant === "primary" && "bg-gradient-to-br from-primary/10 via-card to-card border-primary/30",
        variant === "glass" && "glass-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {typeof delta === "number" && (
        <div className={cn("mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          isUp ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400")}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? "+" : ""}{delta.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
