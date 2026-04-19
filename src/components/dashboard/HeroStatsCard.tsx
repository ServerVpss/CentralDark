import { LucideIcon, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "primary" | "default";
  prefix?: string;
}

/**
 * Nubank-style hero stats card with giant numbers and emerald accents.
 * Use variant="primary" for the most important metric (e.g. revenue).
 */
export function HeroStatsCard({
  title,
  value,
  subtitle,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
  prefix,
}: HeroStatsCardProps) {
  const isPrimary = variant === "primary";
  const TrendIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : ArrowUpRight;

  return (
    <div
      className={cn(
        "card-premium hover-lift group relative overflow-hidden p-6",
        isPrimary && "md:col-span-2 ring-1 ring-primary/30 shadow-[0_0_60px_hsl(var(--primary)/0.15)]"
      )}
    >
      {/* Decorative glow */}
      <div
        className={cn(
          "absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl transition-all duration-500 group-hover:scale-110",
          isPrimary ? "bg-primary/20" : "bg-primary/5 group-hover:bg-primary/15"
        )}
      />

      {/* Grid pattern overlay (subtle) */}
      {isPrimary && (
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
      )}

      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className={cn(
              "text-xs font-bold uppercase tracking-[0.15em]",
              isPrimary ? "text-primary/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            )}
          </div>

          <div
            className={cn(
              "flex items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
              isPrimary
                ? "h-12 w-12 bg-gradient-to-br from-primary to-primary-glow shadow-primary/40"
                : "h-10 w-10 bg-gradient-to-br from-muted to-muted/50 border border-border/60"
            )}
          >
            <Icon
              className={cn(isPrimary ? "h-6 w-6 text-primary-foreground" : "h-5 w-5 text-foreground")}
              strokeWidth={2.25}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className={cn(
                "font-semibold tabular-nums",
                isPrimary ? "text-2xl text-primary/70" : "text-lg text-muted-foreground"
              )}>
                {prefix}
              </span>
            )}
            <p
              className={cn(
                "font-bold tabular-nums tracking-tighter leading-none",
                isPrimary ? "text-5xl md:text-6xl text-gradient-money" : "text-4xl text-foreground"
              )}
            >
              {value}
            </p>
          </div>

          {change && (
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums border",
                changeType === "positive" && "text-primary bg-primary/10 border-primary/20",
                changeType === "negative" && "text-destructive bg-destructive/10 border-destructive/20",
                changeType === "neutral" && "text-muted-foreground bg-muted/30 border-border/50"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
