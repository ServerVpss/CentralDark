import { type ReactNode } from "react";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

export function MetricCard({
  label,
  value,
  icon,
  dot,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  dot?: "ok" | "warn" | "error";
  className?: string;
}) {
  return (
    <Card className={cn("p-4 flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {dot && (
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              dot === "ok" && "bg-primary animate-pulse",
              dot === "warn" && "bg-warning",
              dot === "error" && "bg-destructive"
            )}
          />
        )}
        <span className="text-xl font-semibold tracking-tight">{value}</span>
      </div>
    </Card>
  );
}
