import { Activity, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemStatusProps {
  botsTotal: number;
  botsOnline: number;
}

export function SystemStatus({ botsTotal, botsOnline }: SystemStatusProps) {
  const percentage = botsTotal > 0 ? Math.round((botsOnline / botsTotal) * 100) : 0;
  const isHealthy = percentage >= 80;
  const isWarning = percentage >= 50 && percentage < 80;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border",
          isHealthy 
            ? "bg-emerald-500/10 border-emerald-500/20" 
            : isWarning 
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-muted border-border/50"
        )}>
          <Activity className={cn(
            "h-4 w-4",
            isHealthy ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Status do Sistema</h2>
          <p className="text-xs text-muted-foreground">Monitoramento</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Circular Progress */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative h-28 w-28">
            {/* Background glow */}
            <div className={cn(
              "absolute inset-2 rounded-full blur-xl opacity-30",
              isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-muted"
            )} />
            
            <svg className="h-28 w-28 -rotate-90 transform relative">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="fill-none stroke-muted"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                className="fill-none"
                stroke={isHealthy ? "url(#statusGradientGreen)" : isWarning ? "url(#statusGradientAmber)" : "url(#statusGradientGray)"}
                strokeWidth="8"
                strokeDasharray="289"
                strokeDashoffset={289 - (percentage / 100) * 289}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
              />
              <defs>
                <linearGradient id="statusGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(160 75% 45%)" />
                  <stop offset="100%" stopColor="hsl(140 70% 40%)" />
                </linearGradient>
                <linearGradient id="statusGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(45 100% 50%)" />
                  <stop offset="100%" stopColor="hsl(38 95% 45%)" />
                </linearGradient>
                <linearGradient id="statusGradientGray" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(220 15% 35%)" />
                  <stop offset="100%" stopColor="hsl(220 15% 25%)" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-2xl font-bold",
                isHealthy ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-muted-foreground"
              )}>
                {percentage}%
              </span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Bots Online</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{botsOnline}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total de Bots</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{botsTotal}</span>
          </div>
        </div>

        {/* Status Message */}
        <div className={cn(
          "mt-4 p-3 rounded-lg text-center text-sm font-medium",
          isHealthy 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
            : isWarning 
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-muted text-muted-foreground border border-border/50"
        )}>
          {botsTotal === 0 
            ? "Configure seu primeiro bot" 
            : isHealthy 
              ? "Sistema operando normalmente" 
              : isWarning 
                ? "Alguns bots offline"
                : "Atenção necessária"
          }
        </div>
      </div>
    </div>
  );
}
