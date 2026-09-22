import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  CircleDot,
  GitBranch,
  Server,
  ShieldCheck,
  TerminalSquare,
  Zap,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import type { OperationalSnapshot } from "@/lib/api";

type Tone = "ok" | "warn" | "info" | "unknown";
type HermesState = "projection" | "measuring" | "active" | "warning" | "fixed-point";

const toneClass: Record<Tone, string> = {
  ok: "border-emerald-500/30 bg-emerald-500/[0.04]",
  warn: "border-amber-500/30 bg-amber-500/[0.04]",
  info: "border-cyan-500/30 bg-cyan-500/[0.04]",
  unknown: "border-violet-500/30 bg-violet-500/[0.04]",
};

const hermesMotionClass: Record<HermesState, string> = {
  projection: "animate-pulse",
  measuring: "animate-[bounce_1.1s_ease-in-out_infinite]",
  active: "translate-x-2 animate-[bounce_0.7s_ease-in-out_infinite]",
  warning: "-translate-x-1 animate-pulse",
  "fixed-point": "animate-[bounce_0.45s_ease-in-out_2]",
};

function hermesState(snapshot: OperationalSnapshot | null): HermesState {
  if (!snapshot) return "projection";
  if (snapshot.verdict === "FIXED_POINT") return "fixed-point";

  const marker = snapshot.patternAlignment?.marker;
  if (
    snapshot.verdict === "UNKNOWN_NOT_PASS" ||
    marker === "RED" ||
    marker === "ORANGE" ||
    marker === "YELLOW"
  ) {
    return "warning";
  }

  if (snapshot.forensic?.status === "OBSERVED") return "active";
  return "measuring";
}

function HermesOperationalSignal({ snapshot }: { snapshot: OperationalSnapshot | null }) {
  const state = hermesState(snapshot);
  const label: Record<HermesState, string> = {
    projection: "PROJECTION",
    measuring: "MEDINDO",
    active: "ATIVO",
    warning: "OBSERVANDO",
    "fixed-point": "FIXED POINT",
  };

  return (
    <div
      className="flex min-w-[148px] items-center gap-3 rounded-xl border border-primary/20 bg-background/60 px-3 py-2"
      title="MOVIMENTO != DECORAÇÃO · movimento representa estado operacional"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform duration-300 ${hermesMotionClass[state]}`}
      >
        <Bot className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          <Zap className="h-3 w-3" />
          Hermes
        </div>
        <div className="truncate text-xs font-semibold">{label[state]}</div>
        <div className="text-[9px] text-muted-foreground">movimento = estado</div>
      </div>
    </div>
  );
}

const timeline = [
  ["github_list_commits", "GitHub", "HEAD e histórico canônico medidos."],
  ["vps_git_status", "VPS", "Estado Git da Casa comparado sem inferir runtime."],
  ["deploy_status", "Deploy", "MERGED != DEPLOYED permanece explícito."],
  ["local_compute_status", "Compute", "Capacidade local é sensor independente."],
  ["github_list_pull_requests", "PRs", "Topologia administrativa separada da prova."],
  ["mcp_admin_catalog", "MCP", "TOOL_LISTED != TOOL_ACTIVE."],
  ["vps_git_diff_safe", "Contraprova", "Delta material preservado sem overwrite cego."],
  ["vps_read_file_safe", "Runtime", "Leitura segura antes de qualquer mutação."],
];

export function OperationalHud({ snapshot }: { snapshot: OperationalSnapshot | null }) {
  const observed = Boolean(snapshot);
  const unknownCount = snapshot?.patternAlignment?.unknownCount;

  const summary: Array<{ label: string; value: string; tone: Tone }> = [
    { label: "MISSION_ID", value: "HUD-OPERATIONAL", tone: "info" },
    { label: "MODE", value: snapshot?.forensic?.mode ?? "PROJECTION", tone: observed ? "ok" : "warn" },
    { label: "WRITER", value: "NONE", tone: "ok" },
    { label: "HEAD_SHA", value: "MEASURE_EXTERNALLY", tone: "unknown" },
    { label: "PR_STATE", value: "MEASURE_EXTERNALLY", tone: "unknown" },
    {
      label: "RUNTIME_PID",
      value: snapshot?.runtime?.pid ? String(snapshot.runtime.pid) : "UNKNOWN",
      tone: snapshot?.runtime?.pid ? "ok" : "unknown",
    },
    {
      label: "FORENSIC",
      value: snapshot?.forensic?.status ?? "UNKNOWN",
      tone: snapshot?.forensic?.status === "OBSERVED" ? "ok" : "unknown",
    },
    { label: "PUBLIC_HEALTH", value: "UNKNOWN", tone: "unknown" },
    { label: "FIXED_POINT", value: snapshot?.verdict === "FIXED_POINT" ? "TRUE" : observed ? "FALSE" : "UNKNOWN", tone: snapshot?.verdict === "FIXED_POINT" ? "ok" : "warn" },
    { label: "UNKNOWN", value: unknownCount == null ? "VISIBLE" : String(unknownCount), tone: "unknown" },
  ];

  const evidence: Array<{ key: string; value: string; tone: Tone }> = [
    {
      key: "OPERATIONAL_SNAPSHOT",
      value: snapshot?.schema ?? "UNAVAILABLE",
      tone: observed ? "ok" : "unknown",
    },
    {
      key: "VERDICT",
      value: snapshot?.verdict ?? "UNKNOWN",
      tone: snapshot?.verdict === "OBSERVED_NOT_FIXED_POINT" ? "info" : "unknown",
    },
    {
      key: "RUNTIME_PID",
      value: snapshot?.runtime?.pid ? String(snapshot.runtime.pid) : "UNKNOWN",
      tone: snapshot?.runtime?.pid ? "ok" : "unknown",
    },
    {
      key: "PATTERN_ALIGNMENT",
      value: snapshot?.patternAlignment?.marker ?? "UNKNOWN",
      tone: snapshot?.patternAlignment?.marker === "GREEN" ? "ok" : "warn",
    },
    {
      key: "FORENSIC",
      value: snapshot?.forensic?.status ?? "UNKNOWN",
      tone: snapshot?.forensic?.status === "OBSERVED" ? "ok" : "unknown",
    },
    { key: "PUBLIC_HEALTH", value: "UNKNOWN", tone: "unknown" },
    { key: "DEPLOYED_SHA", value: "UNKNOWN", tone: "unknown" },
    { key: "FIXED_POINT", value: snapshot?.verdict === "FIXED_POINT" ? "TRUE" : observed ? "FALSE" : "UNKNOWN", tone: snapshot?.verdict === "FIXED_POINT" ? "ok" : "warn" },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-card/70 p-4 shadow-sm backdrop-blur md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <CircleDot className="h-3.5 w-3.5" />
            CentralDark Operational HUD
          </div>
          <h3 className="text-lg font-semibold">Cockpit da missão</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Estado vivo, evidência, UNKNOWN e próximo cursor no mesmo lugar. HUD é projeção;
            REALITY continua sendo o Judge.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">MEASURE_BEFORE_CREATION</Badge>
          <Badge variant="outline">UNKNOWN != PASS</Badge>
          <Badge variant="outline">REALITY = JUDGE</Badge>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {summary.map((item) => (
          <div key={item.label} className={`rounded-xl border p-3 ${toneClass[item.tone]}`}>
            <div className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
              {item.label}
            </div>
            <div className="mt-1 break-all text-sm font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Activity className="h-4 w-4" />
              Intenção
            </div>
            <p className="text-sm leading-6">
              Reconciliar GitHub, VPS, runtime, receipts e Evidence Ledger sem inventar
              estado e sem criar sistema paralelo.
            </p>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Evidence Ledger
            </div>
            <div className="divide-y divide-border/60">
              {evidence.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <span className="text-muted-foreground">{item.key}</span>
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${toneClass[item.tone]}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-violet-400" />
                Unknowns
              </div>
              <ul className="space-y-2 text-sm">
                <li>• HEAD_SHA e PR_STATE continuam sensores externos</li>
                <li>• PUBLIC_HEALTH ainda exige sonda HTTP real</li>
                <li>• DEPLOYED_SHA permanece UNKNOWN sem provenance</li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Next Cursor
              </div>
              <ol className="space-y-2 text-sm">
                <li>1. Medir health público e deployed SHA</li>
                <li>2. Correlacionar logs/tools ao mesmo snapshot</li>
                <li>3. Revalidar Fixed Point após contraprova</li>
              </ol>
            </Card>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 p-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Detalhes
              </div>
              <div className="mt-1 font-semibold">Linha do tempo</div>
            </div>
            <div className="flex items-center gap-2">
              <HermesOperationalSignal snapshot={snapshot} />
              <Badge
                className={
                  observed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }
              >
                {observed ? "OBSERVED" : "PROJECTION"}
              </Badge>
            </div>
          </div>

          <div className="max-h-[580px] space-y-2 overflow-auto p-3">
            {timeline.map(([tool, scope, detail], index) => (
              <div key={tool} className="flex gap-3 rounded-xl border border-border/70 bg-secondary/20 p-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">CENTRALDARK</span>
                    <span className="text-[10px] text-muted-foreground">+{index + 1}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="rounded-md bg-background px-2 py-1 text-[11px]">{tool}</code>
                    <span className="text-xs text-muted-foreground">{scope}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          "Fechar recibo duplicado",
          "Medir Evidence Ledger",
          "Montar pacote do desktop",
          "Atualizar topologia",
          "Revalidar Fixed Point",
          "Rodar contraprova",
        ].map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-full border border-border bg-secondary/50 px-3 py-2 text-xs font-medium transition hover:border-primary/40 hover:bg-primary/10"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <TerminalSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Próxima intenção
          </div>
          <div className="truncate text-sm text-muted-foreground">
            Colocar próxima mensagem na fila…
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <GitBranch className="h-4 w-4" />
          <Server className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}
