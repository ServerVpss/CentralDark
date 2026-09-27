import { Card } from "@/compartilhado/ui/card";
import { Skeleton } from "@/compartilhado/ui/skeleton";
import { Activity, Boxes, ShieldOff, Clock, Tag, AlertTriangle } from "lucide-react";
import type { McpHealth } from "./mcp-adapter";

function formatUptime(sec: number): string {
  if (!sec || sec <= 0) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

const STATUS_STYLES = {
  online:   { dot: "bg-emerald-500", label: "Online",   ring: "ring-emerald-500/30" },
  degraded: { dot: "bg-amber-500",   label: "Degradado", ring: "ring-amber-500/30" },
  offline:  { dot: "bg-red-500",     label: "Offline",  ring: "ring-red-500/30" },
} as const;

export function McpHealthCards({ health, loading }: { health: McpHealth | null; loading: boolean }) {
  if (loading || !health) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4"><Skeleton className="h-16 w-full" /></Card>
        ))}
      </div>
    );
  }

  const s = STATUS_STYLES[health.status];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" aria-live="polite">
      <KpiCard
        icon={<Activity className="w-4 h-4" />}
        label="Status MCP"
        value={
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ring-4 ${s.ring} ${s.dot}`} aria-hidden />
            {s.label}
          </span>
        }
        accent
      />
      <KpiCard icon={<Boxes className="w-4 h-4" />}     label="Tools totais"   value={health.totalTools} />
      <KpiCard icon={<Boxes className="w-4 h-4" />}     label="Tools ativas"   value={health.activeTools} />
      <KpiCard icon={<ShieldOff className="w-4 h-4" />} label="Bloqueadas"     value={health.blockedTools} />
      <KpiCard icon={<Clock className="w-4 h-4" />}     label="Uptime"         value={formatUptime(health.uptimeSeconds)} />
      <KpiCard icon={<Tag className="w-4 h-4" />}       label="Versão"         value={health.version} />

      {health.lastError && (
        <Card className="col-span-2 md:col-span-3 lg:col-span-6 p-3 border-amber-500/40 bg-amber-500/5">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-amber-800 dark:text-amber-300">Último aviso</div>
              <div className="text-muted-foreground">{health.lastError}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function KpiCard({
  icon, label, value, accent,
}: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <Card className={`p-4 space-y-1 ${accent ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </Card>
  );
}
