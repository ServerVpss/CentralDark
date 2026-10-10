import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lerMcpPainelCentralDark } from "@/lib/cockpit.functions";

/**
 * O inventário visual original de apps/modulos/status/index.html está aqui,
 * sem importar casca, login ou CSS legado. A fonte é a API do mesmo Hermes Core.
 * Card sem produtor/sem amostra permanece UNKNOWN e ganha próximo cursor.
 */
const CARDS = [
  ["📊 Onde estamos agora", "projeto", "Projeto"],
  ["🤖 Quem faz o quê", "projeto", "Atribuições dos agentes"],
  ["🧠 IAs Vivas — status agora", "infraestrutura", "Processos identificados"],
  ["🛰️ Status ao vivo", "infraestrutura", "CPU, memória, disco e MCP"],
  ["🏁 Fases e marcos", "projeto", "Milestones"],
  ["💡 Sugestões inteligentes", "diagnostico_ias", "Diagnóstico IA"],
  ["📌 Últimos acontecimentos", "projeto", "Eventos"],
  ["✅ O que falta", "projeto", "Pendências"],
  ["🛡️ Regras de segurança", "mcp_legado", "Status de segurança MCP"],
  ["🔌 MCP Teste (somente leitura)", "mcp_legado", "MCP verificado"],
  ["🐕 MCP Health (24h)", "mcp_24h", "Janela health medida"],
  ["🕸️ Grafo Vivo — quem chama quem", "grafo", "Grafo / relações"],
  ["🧠 Cards por IA", "projeto", "Linha temporal IA"],
  ["🤖 Bots especialistas", "projeto", "Bots registrados"],
  ["🩺 Histórico do vps-healthcheck", "mcp_24h", "Checagens e falhas"],
  ["📡 Sessões do bot", "projeto", "Sessões WuzAPI"],
  ["🧩 Cards por setor", "infraestrutura", "Setores e processos"],
  ["🏁 Tarefas por estágio", "projeto", "Pipeline"],
  ["🚦 Central de revisão humana", "projeto", "Aprovações"],
  ["⏱️ Linha do tempo das IAs", "projeto", "Linha temporal"],
  ["📋 Linear Sync", "projeto", "Linear / owner"],
  ["🤝 Handoff Atual", "projeto", "Handoff"],
  ["🛡️ Áreas Protegidas", "projeto", "Áreas protegidas"],
  ["🏁 Fases do projeto", "projeto", "Fases"],
] as const;
function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function asText(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value.slice(0, 180) : null;
}
function cardDetail(id: string, label: string, obj: Record<string, unknown> | null) {
  if (!obj) return null;
  if (id === "projeto") {
    if (label.includes("Últimos acontecimentos")) return String(asNumber(obj.event_count_in_snapshot) ?? "UNKNOWN") + " eventos";
    if (label.includes("Linha do tempo") || label.includes("Cards por IA"))
      return String(Array.isArray(obj.ia_timeline) ? obj.ia_timeline.length : "UNKNOWN") + " eventos IA";
    if (label.includes("marcos") || label.includes("Fases"))
      return String(Array.isArray(obj.milestones) ? obj.milestones.length : "UNKNOWN") + " marcos";
    if (label.includes("Onde estamos")) return asText(obj.phase) ?? "FASE NAO MEDIDA";
    if (label.includes("O que falta")) return asText(obj.current_task) ?? "SEM PENDENCIA MEDIDA";
    const p = asObject(obj.source_presence);
    const sourceKey: Record<string, string> = {
      "Quem faz": "agents", "Bots": "botCards", "Sessões": "wuzapiSessions",
      "Tarefas": "tarefasAtivas", "revisão": "humanReview", "Linear": "linearSync",
      "Handoff": "handoffAtual", "Áreas": "segurancaArea",
    };
    const hit = Object.entries(sourceKey).find(([part]) => label.includes(part));
    return hit && p?.[hit[1]] === true ? "FONTE MAPEADA · EXIGE READBACK" : null;
  }
  if (id === "infraestrutura") {
    const procs = asObject(obj.processes);
    const mem = asObject(obj.memory);
    if (label.includes("IAs Vivas")) return String(asNumber(procs?.online) ?? "UNKNOWN") + " processos do snapshot";
    if (label.includes("Status ao vivo")) return "RAM " + (asNumber(mem?.used_pct) ?? "UNKNOWN") + "% · disco " +
      (asNumber(asObject(obj.disk)?.used_pct) ?? "UNKNOWN") + "%";
    if (label.includes("Cards por setor")) return String(asNumber(procs?.total) ?? "UNKNOWN") + " processos inventariados";
  }
  if (id === "mcp_24h") {
    const w = asObject(obj.last_24h);
    return String(asNumber(w?.checks) ?? "UNKNOWN") + " checks · " +
      String(asNumber(w?.failures) ?? "UNKNOWN") + " falhas";
  }
  if (id === "diagnostico_ias") {
    const d = asObject(obj.measured);
    return String(asNumber(d?.ok) ?? "UNKNOWN") + "/" + String(asNumber(d?.total) ?? "UNKNOWN") + " sondas";
  }
  if (id === "mcp_legado") return asText(obj.status) ?? "UNKNOWN";
  return null;
}
export function MegaPainelLegadoCentralDark() {
  const read = useServerFn(lerMcpPainelCentralDark);
  const q = useQuery({
    queryKey: ["centraldark", "mega-painel-full-legacy-cards"],
    queryFn: () => read(),
    refetchInterval: 15_000,
    retry: false,
  });
  const result = q.data;
  const byId = new Map((result?.megaPainel.sections ?? []).map(section => [section.id, section]));
  return <section aria-labelledby="cd-megapainel-original">
    <div className="mt-8 flex flex-wrap items-start justify-between gap-3 border-t border-border pt-5">
      <div>
        <h4 id="cd-megapainel-original" className="font-semibold">Mega Painel Original · Todos os setores</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Origem: apps/modulos/status · API oficial: /status/overview · {CARDS.length} cards originais
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {result?.observedAt ?? "UNKNOWN"} · HTTP {result?.megaPainel.probe.httpStatus ?? "UNKNOWN"} ·
          snapshot antigo NÃO significa telemetria ao vivo.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => void q.refetch()} disabled={q.isFetching}>
        <RefreshCw className={q.isFetching ? "animate-spin" : ""} /> Atualizar cards
      </Button>
    </div>
    {q.error ? <p role="alert" className="mt-2 text-sm text-destructive">
      Erro de leitura: {q.error instanceof Error ? q.error.message : String(q.error)}
    </p> : null}
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {CARDS.map(([title, sourceId, meaning]) => {
        const slot = byId.get(sourceId);
        const obj = asObject(slot?.data);
        const detail = cardDetail(sourceId, title, obj);
        const hasProducer = !!detail && slot?.state === "OBSERVED";
        const state = hasProducer ? "OBSERVED_SOURCE" : slot?.state === "STALE" ? "STALE" : "UNKNOWN";
        return <article key={title} className="panel p-4">
          <div className="flex items-start justify-between gap-2">
            <h5 className="text-sm font-semibold">{title}</h5>
            <span className="rounded border border-border px-2 py-1 font-mono text-[10px]">{state}</span>
          </div>
          <p className="mt-2 text-sm">{detail || meaning + ": produtor sem resultado validado"}</p>
          <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
            {slot?.source ?? sourceId} · {slot?.observedAt ?? "SEM MEDICAO"} ·
            {slot?.ageSeconds == null ? "IDADE_UNKNOWN" : String(slot.ageSeconds) + "s"}
          </p>
        </article>;
      })}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      Os cards preservam o inventário. Fonte ausente ou antiga fica explícita, sem inventar PASS.
      Eventos, métricas e ações avançadas permanecem nos respectivos owners até a migração E2E.
    </p>
  </section>;
}
