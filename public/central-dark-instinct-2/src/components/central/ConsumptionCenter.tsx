import { Coins, CreditCard, Gauge, ReceiptText } from "lucide-react";

export type MetricStatus = "PASS" | "UNKNOWN" | "AUTH_REQUIRED" | "STALE" | "FAIL";
export type ConsumptionMetric = {
  id: string;
  label: string;
  value: number | null;
  unit: "credits" | "tokens" | "BRL" | "USD";
  status: MetricStatus;
  source: string | null;
  measuredAt: string | null;
  period?: string | null;
  detail?: string | null;
};

const required = [
  { id: "lovable_balance", label: "Saldo Lovable", unit: "credits" as const, icon: Coins },
  { id: "lovable_spend", label: "Créditos usados", unit: "credits" as const, icon: ReceiptText },
  { id: "model_tokens", label: "Tokens consumidos", unit: "tokens" as const, icon: Gauge },
  { id: "model_cost", label: "Gasto dos modelos", unit: "USD" as const, icon: CreditCard },
];

function metricText(metric: ConsumptionMetric) {
  if (metric.status !== "PASS" || metric.value === null || !Number.isFinite(metric.value)) return "—";
  if (metric.unit === "BRL") return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(metric.value);
  if (metric.unit === "USD") return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(metric.value);
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(metric.value)} ${metric.unit === "credits" ? "créditos" : "tokens"}`;
}

function dateText(value: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return "não medido";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC";
}

const statusStyle: Record<MetricStatus, string> = {
  PASS: "border-neon-green/50 text-neon-green",
  UNKNOWN: "border-muted-foreground/50 text-muted-foreground",
  AUTH_REQUIRED: "border-gold/50 text-gold",
  STALE: "border-gold/50 text-gold",
  FAIL: "border-destructive/50 text-destructive",
};

/** Presentation only. Values must come from an authorized server-side provider with a source and timestamp. */
export function ConsumptionCenter({ metrics = [] }: { metrics?: ConsumptionMetric[] }) {
  const byId = new Map(metrics.map((metric) => [metric.id, metric]));
  return (
    <section id="consumption-center" aria-labelledby="consumption-title" className="scroll-mt-24">
      <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">Custos · capacidade · proveniência</p>
      <h2 id="consumption-title" className="mt-3 text-3xl font-semibold sm:text-4xl">Saldo e consumo</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Cada número informa fonte, período e horário. Ausência de medição aparece como UNKNOWN.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {required.map(({ id, label, unit, icon: Icon }) => {
          const supplied = byId.get(id);
          const metric: ConsumptionMetric = supplied && supplied.unit === unit ? supplied : { id, label, unit, status: "UNKNOWN", value: null, source: null, measuredAt: null };
          const reliable = metric.status === "PASS" && metric.value !== null && Number.isFinite(metric.value) && metric.source && metric.measuredAt && !Number.isNaN(Date.parse(metric.measuredAt));
          const state: MetricStatus = reliable ? "PASS" : metric.status === "PASS" ? "UNKNOWN" : metric.status;
          return (
            <article key={id} className="panel min-w-0 p-5">
              <div className="flex items-center justify-between gap-2"><Icon aria-hidden className="size-5 text-neon-blue" /><span className={`rounded-md border px-2 py-1 font-mono text-[10px] ${statusStyle[state]}`}>{state}</span></div>
              <h3 className="mt-5 text-sm font-medium text-muted-foreground">{label}</h3>
              <p className="mt-2 break-words text-3xl font-semibold tabular-nums text-foreground">{state === "PASS" ? metricText(metric) : "—"}</p>
              <dl className="mt-5 space-y-2 border-t border-border pt-4 text-xs">
                <div><dt className="text-muted-foreground">Fonte</dt><dd className="mt-1 break-all font-mono">{metric.source ?? "UNKNOWN"}</dd></div>
                <div><dt className="text-muted-foreground">Medido</dt><dd className="mt-1 font-mono">{dateText(metric.measuredAt)}</dd></div>
                <div><dt className="text-muted-foreground">Período</dt><dd className="mt-1 font-mono">{metric.period ?? "não informado"}</dd></div>
              </dl>
              {metric.detail ? <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{metric.detail}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
