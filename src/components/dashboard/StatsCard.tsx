import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: "cyan" | "green" | "purple" | "gold" | "blue" | "rose";
}

const iconColors = {
  cyan: "text-cyan-500 bg-cyan-500/10",
  green: "text-emerald-500 bg-emerald-500/10",
  purple: "text-violet-500 bg-violet-500/10",
  gold: "text-amber-500 bg-amber-500/10",
  blue: "text-blue-500 bg-blue-500/10",
  rose: "text-rose-500 bg-rose-500/10",
};

const changeColors = {
  positive: "text-emerald-500",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon, gradient = "gold" }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", iconColors[gradient])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {change && <p className={cn("text-xs", changeColors[changeType])}>{change}</p>}
    </div>
  );
}
