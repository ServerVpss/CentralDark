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
  blue: {
    bg: "from-blue-500/15 via-indigo-500/10 to-transparent",
    icon: "from-blue-500 to-indigo-500",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/20",
  },
  rose: {
    bg: "from-rose-500/15 via-pink-500/10 to-transparent",
    icon: "from-rose-500 to-pink-500",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/20",
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
      "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
      "hover:shadow-xl hover:-translate-y-1",
      style.border,
      style.glow
    )} style={{
      background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
    }}>
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
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {change && (
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              changeType === "positive" && "text-emerald-400",
              changeType === "negative" && "text-rose-400",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {changeType === "positive" && <TrendingUp className="h-4 w-4" />}
              {changeType === "negative" && <TrendingDown className="h-4 w-4" />}
              {changeType === "neutral" && <Minus className="h-4 w-4" />}
              <span>{change}</span>
            </div>
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
}