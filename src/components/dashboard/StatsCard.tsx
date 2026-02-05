import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  gradient?: "gold" | "cyan" | "green" | "purple" | "blue" | "rose";
}

const gradientStyles = {
  gold: {
    bg: "from-amber-500/10 to-orange-500/5",
    icon: "from-amber-500 to-orange-600",
    border: "border-amber-500/20 hover:border-amber-500/40",
    glow: "group-hover:shadow-amber-500/20",
    accent: "bg-amber-500/10",
  },
  cyan: {
    bg: "from-cyan-500/10 to-blue-500/5",
    icon: "from-cyan-400 to-blue-500",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    glow: "group-hover:shadow-cyan-500/20",
    accent: "bg-cyan-500/10",
  },
  green: {
    bg: "from-emerald-500/10 to-green-500/5",
    icon: "from-emerald-400 to-green-500",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    glow: "group-hover:shadow-emerald-500/20",
    accent: "bg-emerald-500/10",
  },
  purple: {
    bg: "from-violet-500/10 to-purple-500/5",
    icon: "from-violet-400 to-purple-500",
    border: "border-violet-500/20 hover:border-violet-500/40",
    glow: "group-hover:shadow-violet-500/20",
    accent: "bg-violet-500/10",
  },
  blue: {
    bg: "from-blue-500/10 to-indigo-500/5",
    icon: "from-blue-400 to-indigo-500",
    border: "border-blue-500/20 hover:border-blue-500/40",
    glow: "group-hover:shadow-blue-500/20",
    accent: "bg-blue-500/10",
  },
  rose: {
    bg: "from-rose-500/10 to-pink-500/5",
    icon: "from-rose-400 to-pink-500",
    border: "border-rose-500/20 hover:border-rose-500/40",
    glow: "group-hover:shadow-rose-500/20",
    accent: "bg-rose-500/10",
  },
};

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "gold",
}: StatsCardProps) {
  const style = gradientStyles[gradient];

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
      "hover:shadow-2xl hover:-translate-y-0.5",
      style.border,
      style.glow,
      "bg-card"
    )}>
      {/* Subtle gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30",
        style.bg
      )} />
      
      {/* Decorative corner accent */}
      <div className={cn(
        "absolute -top-16 -right-16 h-32 w-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500",
        "bg-gradient-to-br",
        style.icon
      )} />
      
      <div className="relative">
        {/* Header row - icon and title aligned */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            "bg-gradient-to-br shadow-lg",
            style.icon
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          {change && (
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
              changeType === "positive" && "bg-emerald-500/15 text-emerald-400",
              changeType === "negative" && "bg-rose-500/15 text-rose-400",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}>
              {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
              {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
              {changeType === "neutral" && <Minus className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Value and title - better hierarchy */}
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        style.icon
      )} />
    </div>
  );
}
