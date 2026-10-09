import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Filter,
  Gauge,
  Network,
  RefreshCw,
  Route as RouteIcon,
  ShieldCheck,
  Waypoints,
} from "lucide-react";

import { Header } from "@/components/central/Header";
import { I18nProvider, useI18n } from "@/lib/i18n";

type CapabilityState =
  | "NATIVE"
  | "OWNER_EXISTS"
  | "ADAPTATION_REQUIRED"
  | "OWNER_DISCOVERY_REQUIRED"
  | "RUNTIME_UNKNOWN";

type Capability = {
  id: string;
  label: string;
  source_area: string;
  centraldark_owner: string;
  decision: string;
  state: CapabilityState;
  proof: string;
};

type CapabilityManifest = {
  schema_version: number;
  generated_for: string;
  intent: Record<string, boolean>;
  source: {
    repository: string;
    ref: string;
    commit: string;
    license: string;
    issue: string;
  };
  surface: {
    id: string;
    label: string;
    route: string;
    runtime_owner: string;
    architecture_owner: string;
    second_router: boolean;
  };
  states: Record<string, string>;
  capabilities: Capability[];
};

type RouterHealth = {
  ok?: boolean;
  service?: string;
  version?: string;
  default_engine?: string;
  auto_fallback?: boolean;
  free_only?: boolean;
  fallback_chain?: string[];
  engines?: Record<string, { configured?: boolean }>;
  wire_apis?: string[];
};

type LiveState = "UNCONFIGURED" | "CHECKING" | "LIVE" | "UNKNOWN";

const MANIFEST_URL = "/centraldark/router-capabilities.json";
const LIVE_ROUTER_URL = String(
  (import.meta.env["VITE_CENTRALDARK_ROUTER_URL"] as string | undefined) ?? "",
).replace(/\/$/, "");

const labels = {
  "pt-BR": {
    back: "Voltar para a Casa",
    kicker: "Capability Surface",
    title: "Roteador CentralDark",
    lead: "Uma porta para enxergar o roteamento e o mapa de capacidades absorvidas, sem criar outro router ou outro sistema.",
    source: "Fonte pinada",
    live: "Runtime vivo",
    unconfigured: "probe do browser não configurado",
    unknown: "runtime não confirmado desta superfície",
    checking: "medindo",
    native: "Nativas",
    mapped: "Com owner",
    adapt: "A incorporar",
    discovery: "Owner a reconciliar",
    all: "Todas",
    filter: "Filtrar",
    owner: "Owner CentralDark",
    decision: "Decisão",
    proof: "Estado / prova",
    providers: "Motores observados",
    fallback: "Fallback",
    endpoint: "Wire APIs",
    refresh: "Remedir runtime",
    law: "Lei desta absorção",
    lawText:
      "INTENÇÃO_DO_CHEFE = DELTA_UTIL. O agente não decide se a capacidade pedida é útil; ele mede, encontra o owner, reutiliza, adapta com menor risco e prova.",
  },
  "en-US": {
    back: "Back to Home",
    kicker: "Capability Surface",
    title: "CentralDark Router",
    lead: "One surface to inspect routing and the absorbed capability map without creating a second router or system.",
    source: "Pinned source",
    live: "Live runtime",
    unconfigured: "browser probe not configured",
    unknown: "runtime not confirmed from this surface",
    checking: "measuring",
    native: "Native",
    mapped: "Owner mapped",
    adapt: "To absorb",
    discovery: "Owner discovery",
    all: "All",
    filter: "Filter",
    owner: "CentralDark owner",
    decision: "Decision",
    proof: "State / proof",
    providers: "Observed engines",
    fallback: "Fallback",
    endpoint: "Wire APIs",
    refresh: "Measure runtime again",
    law: "Absorption law",
    lawText:
      "CHEFE_INTENT = DELTA_UTIL. The agent does not decide whether the requested capability is useful; it measures, resolves the owner, reuses, adapts safely and proves.",
  },
  "es-ES": {
    back: "Volver a la Casa",
    kicker: "Capability Surface",
    title: "Ruteador CentralDark",
    lead: "Una superficie para ver el enrutamiento y el mapa de capacidades absorbidas sin crear otro router ni otro sistema.",
    source: "Fuente fijada",
    live: "Runtime vivo",
    unconfigured: "probe del navegador no configurado",
    unknown: "runtime no confirmado desde esta superficie",
    checking: "midiendo",
    native: "Nativas",
    mapped: "Con owner",
    adapt: "Por incorporar",
    discovery: "Owner por reconciliar",
    all: "Todas",
    filter: "Filtrar",
    owner: "Owner CentralDark",
    decision: "Decisión",
    proof: "Estado / prueba",
    providers: "Motores observados",
    fallback: "Fallback",
    endpoint: "Wire APIs",
    refresh: "Remedir runtime",
    law: "Ley de absorción",
    lawText:
      "INTENCIÓN_DEL_CHEFE = DELTA_UTIL. El agente no decide si la capacidad pedida es útil; mide, resuelve el owner, reutiliza, adapta con seguridad y prueba.",
  },
} as const;

export const Route = createFileRoute("/roteador")({
  head: () => ({
    meta: [
      { title: "Roteador CentralDark — Capability Surface" },
      {
        name: "description",
        content:
          "Superfície CentralDark para roteamento, providers, fallback, telemetria e reconciliação de capacidades OmniRoute.",
      },
      { property: "og:title", content: "Roteador CentralDark — Capacidades" },
      {
        property: "og:description",
        content: "Capacidades, fontes e estado do roteador oficial CentralDark.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <I18nProvider>
      <Header />
      <RouterPage />
    </I18nProvider>
  ),
});

function StateBadge({ state }: { state: CapabilityState }) {
  const classes: Record<CapabilityState, string> = {
    NATIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    OWNER_EXISTS: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    ADAPTATION_REQUIRED: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    OWNER_DISCOVERY_REQUIRED: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    RUNTIME_UNKNOWN: "border-border bg-surface text-muted-foreground",
  };
  return (
    <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] ${classes[state]}`}>
      {state}
    </span>
  );
}

function RouterPage() {
  const { lang } = useI18n();
  const copy = labels[lang];
  const [manifest, setManifest] = useState<CapabilityManifest | null>(null);
  const [manifestError, setManifestError] = useState<string>("");
  const [health, setHealth] = useState<RouterHealth | null>(null);
  const [liveState, setLiveState] = useState<LiveState>(
    LIVE_ROUTER_URL ? "CHECKING" : "UNCONFIGURED",
  );
  const [showLocalModelPlan, setShowLocalModelPlan] = useState(false);
  const [filter, setFilter] = useState<"ALL" | CapabilityState>("ALL");

  useEffect(() => {
    fetch(MANIFEST_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`manifest_http_${response.status}`);
        return response.json() as Promise<CapabilityManifest>;
      })
      .then(setManifest)
      .catch((error: unknown) => setManifestError(String(error)));
  }, []);

  const measureRuntime = async () => {
    if (!LIVE_ROUTER_URL) {
      setLiveState("UNCONFIGURED");
      setHealth(null);
      return;
    }
    setLiveState("CHECKING");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch(`${LIVE_ROUTER_URL}/health`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`health_http_${response.status}`);
      const data = (await response.json()) as RouterHealth;
      setHealth(data);
      setLiveState(data.ok ? "LIVE" : "UNKNOWN");
    } catch {
      setHealth(null);
      setLiveState("UNKNOWN");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  useEffect(() => {
    void measureRuntime();
  }, []);

  const counts = useMemo(() => {
    const rows = manifest?.capabilities ?? [];
    return {
      total: rows.length,
      native: rows.filter((row) => row.state === "NATIVE").length,
      mapped: rows.filter((row) => row.state === "OWNER_EXISTS").length,
      adapt: rows.filter((row) => row.state === "ADAPTATION_REQUIRED").length,
      discovery: rows.filter((row) => row.state === "OWNER_DISCOVERY_REQUIRED").length,
    };
  }, [manifest]);

  const visible = useMemo(() => {
    const rows = manifest?.capabilities ?? [];
    return filter === "ALL" ? rows : rows.filter((row) => row.state === filter);
  }, [manifest, filter]);

  const liveLabel =
    liveState === "LIVE"
      ? "PASS / LIVE"
      : liveState === "CHECKING"
        ? copy.checking
        : liveState === "UNCONFIGURED"
          ? copy.unconfigured
          : copy.unknown;

  return (
    <main className="min-h-screen bg-background px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">
          ← {copy.back}
        </a>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <section className="panel overflow-hidden p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-primary uppercase">
                <Waypoints className="size-3.5" /> {copy.kicker}
              </span>
              <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
                ONE_SYSTEM_ONLY
              </span>
            </div>
            <h1 className="text-gold-gradient mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy.lead}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label={copy.native} value={counts.native} icon={CheckCircle2} />
              <Metric label={copy.mapped} value={counts.mapped} icon={Network} />
              <Metric label={copy.adapt} value={counts.adapt} icon={RouteIcon} />
              <Metric label={copy.discovery} value={counts.discovery} icon={CircleHelp} />
            </div>
          </section>

          <section className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                  {copy.live}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{liveLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => void measureRuntime()}
                className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground"
                aria-label={copy.refresh}
                title={copy.refresh}
              >
                <RefreshCw className={`size-4 ${liveState === "CHECKING" ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="mt-5 space-y-3 border-t border-border pt-5 text-xs">
              <RuntimeRow label="service" value={health?.service ?? "UNKNOWN"} />
              <RuntimeRow label="version" value={health?.version ?? "UNKNOWN"} />
              <RuntimeRow label="default_engine" value={health?.default_engine ?? "UNKNOWN"} />
              <RuntimeRow
                label={copy.fallback}
                value={health ? String(Boolean(health.auto_fallback)) : "UNKNOWN"}
              />
              <RuntimeRow
                label={copy.endpoint}
                value={health?.wire_apis?.join(", ") ?? "UNKNOWN"}
              />
            </div>
          </section>
        </div>

        <section
          className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5"
          role="status"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" />
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-amber-300 uppercase">
                  Aviso não bloqueante · rota auxiliar
                </p>
                <h2 className="mt-2 text-base font-semibold text-foreground">
                  Rota de modelo local OFFLINE
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  O site e as demais rotas continuam operacionais. Falta instalar/localizar um
                  modelo conversacional local; isso não impede a publicação nem o uso das outras
                  assinaturas e modelos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLocalModelPlan((visible) => !visible)}
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/20"
              aria-expanded={showLocalModelPlan}
            >
              {showLocalModelPlan ? "Ocultar pendência" : "Ver pendência"}
            </button>
          </div>
          {showLocalModelPlan ? (
            <div className="mt-4 rounded-lg border border-amber-400/20 bg-background/30 p-4 text-xs text-muted-foreground">
              <p className="font-mono text-amber-200">ROTA_OFFLINE=NAO_BLOQUEANTE</p>
              <p className="mt-2">
                Próximo passo: localizar ou instalar o modelo local quando autorizado.
              </p>
              <p className="mt-1">Enquanto isso: seguir com o deploy e as demais rotas.</p>
            </div>
          ) : null}
        </section>

        <section className="panel mt-5 p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-primary uppercase">
                {copy.source}
              </p>
              <p className="mt-2 text-sm text-foreground">
                {manifest?.source.repository ?? "loading"} @ {manifest?.source.ref ?? "..."}
              </p>
              <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
                SHA {manifest?.source.commit ?? "..."} · {manifest?.source.license ?? "..."}
              </p>
            </div>
            <a
              href="https://github.com/diegosouzapw/OmniRoute"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              source <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <div className="flex gap-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">{copy.law}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.lawText}</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Capability map
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                {counts.total} capability families
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              {(
                [
                  ["ALL", copy.all],
                  ["NATIVE", copy.native],
                  ["OWNER_EXISTS", copy.mapped],
                  ["ADAPTATION_REQUIRED", copy.adapt],
                  ["OWNER_DISCOVERY_REQUIRED", copy.discovery],
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    filter === value
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {manifestError ? (
            <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 font-mono text-xs text-red-300">
              manifest=UNKNOWN · {manifestError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {visible.map((capability) => (
              <article key={capability.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                      {capability.source_area}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-foreground">
                      {capability.label}
                    </h3>
                  </div>
                  <StateBadge state={capability.state} />
                </div>
                <dl className="mt-5 space-y-3 border-t border-border pt-4 text-xs">
                  <Detail label={copy.owner} value={capability.centraldark_owner} />
                  <Detail label={copy.decision} value={capability.decision} />
                  <Detail label={copy.proof} value={capability.proof} />
                </dl>
              </article>
            ))}
          </div>
        </section>

        {health?.engines ? (
          <section className="panel mt-8 p-6">
            <div className="flex items-center gap-2">
              <Gauge className="size-4 text-neon-blue" />
              <h2 className="text-sm font-semibold text-foreground">{copy.providers}</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(health.engines).map(([engine, state]) => (
                <span
                  key={engine}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[10px] ${
                    state.configured
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {engine}: {state.configured ? "CONFIGURED" : "NOT_CONFIGURED"}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function RuntimeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="font-mono text-muted-foreground">{label}</dt>
      <dd className="max-w-[62%] break-words text-right font-mono text-foreground">{value}</dd>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="font-mono text-muted-foreground">{label}</dt>
      <dd className="break-words text-foreground">{value}</dd>
    </div>
  );
}
