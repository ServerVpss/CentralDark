import { cn } from "@/shared/lib/utils";

interface SystemStatusProps {
  botsTotal: number;
  botsOnline: number;
}

export function SystemStatus({ botsTotal, botsOnline }: SystemStatusProps) {
  const percent = botsTotal > 0 ? Math.round((botsOnline / botsTotal) * 100) : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground">Status do Sistema</h3>
      </div>
      <div className="p-4 flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" className="stroke-muted" strokeWidth="6" />
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              className={cn(
                percent >= 80 ? "stroke-emerald-500" : percent >= 50 ? "stroke-amber-500" : "stroke-destructive"
              )}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{percent}%</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">{botsOnline} online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground">{botsTotal - botsOnline} offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/40" />
            <span className="text-muted-foreground">{botsTotal} total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
