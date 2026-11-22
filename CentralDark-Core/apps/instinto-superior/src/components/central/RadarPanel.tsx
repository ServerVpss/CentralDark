import { useRadarRealtime, corDoPulso, type RadarPulse } from "@/hooks/useRadarRealtime";
import { useRelogioVivo, tempoDecorrido } from "@/hooks/useRelogioVivo";
import type { EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { SeloEstado } from "@/components/central/EstadoCentralDark";

const SOURCES_ORDER = [
  "github",
  "liveFabric",
  "grafoVivo",
  "omniRouter",
  "apiHealth",
  "heartbeat",
  "omniModels",
  "receipts",
  "casaSite",
  "screenpipe",
  "screenpipeVps",
  "actions",
] as const;

const LABELS: Record<string, string> = {
  github: "GitHub",
  liveFabric: "Live Fabric",
  grafoVivo: "Grafo Vivo",
  omniRouter: "Omni Router",
  apiHealth: "API Health",
  heartbeat: "Heartbeat",
  omniModels: "Omni Models",
  receipts: "Receipts",
  casaSite: "Casa Site",
  screenpipe: "Screenpipe Casa",
  screenpipeVps: "Screenpipe VPS",
  actions: "GitHub Actions",
};

function statusToEstado(status: string): EstadoOperacional {
  switch (status) {
    case "PASS":
    case "FAIL":
    case "RUNNING":
    case "BLOCKED":
    case "AUTH_REQUIRED":
    case "UNKNOWN":
      return status;
    case "ANOMALY":
      return "FAIL";
    default:
      return "UNKNOWN";
  }
}

function PulsoLinha({ source, pulso, agora }: { source: string; pulso: RadarPulse | undefined; agora: number | null }) {
  const estado = pulso ? statusToEstado(pulso.status) : "UNKNOWN";
  const label = LABELS[source] ?? source;

  return (
    <div className="flex items-center gap-3 rounded-md border border-border/50 bg-card/50 px-3 py-2">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: pulso ? corDoPulso(pulso.status) : "#6b7280" }}
      />
      <span className="min-w-[120px] text-sm font-medium">{label}</span>
      <SeloEstado estado={estado} />
      {pulso?.http_code ? (
        <span className="font-mono text-[10px] text-muted-foreground">
          HTTP {pulso.http_code}
        </span>
      ) : null}
      {pulso?.error ? (
        <span className="max-w-[200px] truncate text-[10px] text-destructive" title={pulso.error}>
          {pulso.error}
        </span>
      ) : null}
      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
        {pulso ? tempoDecorrido(pulso.measured_at, agora) : "—"}
      </span>
    </div>
  );
}

export function RadarPanel() {
  const { pulsos, conectado } = useRadarRealtime();
  const agora = useRelogioVivo();

  const total = SOURCES_ORDER.length;
  const medidos = SOURCES_ORDER.filter((s) => pulsos.has(s)).length;
  const passCount = SOURCES_ORDER.filter((s) => pulsos.get(s)?.status === "PASS").length;
  const failCount = SOURCES_ORDER.filter(
    (s) => {
      const st = pulsos.get(s)?.status;
      return st === "FAIL" || st === "ANOMALY";
    },
  ).length;

  return (
    <section aria-labelledby="radar-titulo">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-green uppercase">
            Supabase Realtime
          </p>
          <h3 id="radar-titulo" className="mt-3 text-3xl font-semibold">
            Radar
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pulsos em tempo real de cada probe do CentralDark. Cada linha atualiza via WebSocket
            quando o cockpit grava um novo ciclo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] ${
              conectado
                ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                conectado ? "bg-neon-green animate-pulse" : "bg-destructive"
              }`}
            />
            {conectado ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="panel p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{medidos}/{total}</p>
          <p className="mt-1 text-xs text-muted-foreground">Probes medidos</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="text-2xl font-bold text-neon-green">{passCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">PASS</p>
        </div>
        <div className="panel p-4 text-center">
          <p className={`text-2xl font-bold ${failCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {failCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">FAIL / ANOMALY</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {SOURCES_ORDER.map((source) => (
          <PulsoLinha key={source} source={source} pulso={pulsos.get(source)} agora={agora} />
        ))}
      </div>

      {pulsos.size > 0 && (
        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
          Último pulso: {tempoDecorrido(
            [...pulsos.values()].reduce((a, b) =>
              new Date(a.measured_at) > new Date(b.measured_at) ? a : b
            ).measured_at,
            agora,
          )} · Host: {[...pulsos.values()][0]?.host ?? "—"}
        </p>
      )}
    </section>
  );
}
