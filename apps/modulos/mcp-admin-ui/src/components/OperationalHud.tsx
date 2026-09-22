import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  GitBranch,
  Server,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

type Tone = "ok" | "warn" | "info" | "unknown";

const toneClass: Record<Tone, string> = {
  ok: "border-emerald-500/30 bg-emerald-500/[0.04]",
  warn: "border-amber-500/30 bg-amber-500/[0.04]",
  info: "border-cyan-500/30 bg-cyan-500/[0.04]",
  unknown: "border-violet-500/30 bg-violet-500/[0.04]",
};

const summary: Array<{ label: string; value: string; tone: Tone }> = [
  { label: "MISSION_ID", value: "HUD-OPERATIONAL", tone: "info" },
  { label: "MODE", value: "READ_ONLY", tone: "ok" },
  { label: "WRITER", value: "NONE", tone: "ok" },
  { label: "HEAD_SHA", value: "LIVE", tone: "info" },
  { label: "PR_STATE", value: "MEASURE", tone: "info" },
  { label: "RUNTIME_SHA", value: "UNKNOWN", tone: "unknown" },
  { label: "LOCAL_HEALTH", value: "MEASURE", tone: "info" },
  { label: "PUBLIC_HEALTH", value: "MEASURE", tone: "info" },
  { label: "FIXED_POINT", value: "FALSE", tone: "warn" },
  { label: "UNKNOWN", value: "VISIBLE", tone: "unknown" },
];

const evidence: Array<{ key: string; value: string; tone: Tone }> = [
  { key: "VPS_SOURCE", value: "UNKNOWN", tone: "unknown" },
  { key: "RUNTIME_OWNER", value: "UNKNOWN", tone: "unknown" },
  { key: "LOCAL_HEALTH", value: "MEASURE", tone: "info" },
  { key: "PUBLIC_HEALTH", value: "MEASURE", tone: "info" },
  { key: "MICRODEPLOY", value: "NOT_PROVEN", tone: "warn" },
  { key: "DEPLOYED_SHA", value: "UNKNOWN", tone: "unknown" },
  { key: "RUNTIME_SHA", value: "UNKNOWN", tone: "unknown" },
  { key: "FIXED_POINT", value: "FALSE", tone: "warn" },
];

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

export function OperationalHud() {
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
          <div
            key={item.label}
            className={`rounded-xl border p-3 ${toneClass[item.tone]}`}
          >
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
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{item.key}</span>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${toneClass[item.tone]}`}
                  >
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
                <li>• RUNTIME_SHA do processo vivo</li>
                <li>• RUNTIME_OWNER material</li>
                <li>• DEPLOYED_SHA no consumidor final</li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Next Cursor
              </div>
              <ol className="space-y-2 text-sm">
                <li>1. Medir processo/runtime vivo</li>
                <li>2. Vincular runtime ao SHA observado</li>
                <li>3. Revalidar Fixed Point após contraprova</li>
              </ol>
            </Card>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/70 p-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Detalhes
              </div>
              <div className="mt-1 font-semibold">Linha do tempo</div>
            </div>
            <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              LIVE
            </Badge>
          </div>

          <div className="max-h-[580px] space-y-2 overflow-auto p-3">
            {timeline.map(([tool, scope, detail], index) => (
              <div
                key={tool}
                className="flex gap-3 rounded-xl border border-border/70 bg-secondary/20 p-3"
              >
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">CENTRALDARK</span>
                    <span className="text-[10px] text-muted-foreground">
                      +{index + 1}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="rounded-md bg-background px-2 py-1 text-[11px]">
                      {tool}
                    </code>
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
