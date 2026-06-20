import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: "cyan" | "green" | "purple" | "gold" | "blue" | "rose";
}

const iconStyles = {
  cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20",
  green: "from-primary/20 to-primary/5 text-primary border-primary/30",
  purple: "from-accent/20 to-accent/5 text-accent border-accent/30",
  gold: "from-primary/20 to-primary-glow/5 text-primary border-primary/30",
  blue: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20",
  rose: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20",
};

const changeColors = {
  positive: "text-primary bg-primary/10 border-primary/20",
  negative: "text-destructive bg-destructive/10 border-destructive/20",
  neutral: "text-muted-foreground bg-muted/45 border-border/60",
};

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon, gradient = "green" }: StatsCardProps) {
  const TrendIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : null;

  return (
    <div className="card-premium hover-lift group p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border transition-transform group-hover:scale-110",
          iconStyles[gradient]
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight font-display">
          {value}
        </p>
        {change && (
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium tabular-nums",
            changeColors[changeType]
          )}>
            {TrendIcon && <TrendIcon className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
