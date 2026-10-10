import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import { lerMcpPainelCentralDark } from "@/lib/cockpit.functions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MCP = "https://mcp.centralldark.com";
const API = "https://api.centralldark.com";
const SECTORS = [
  ["visao", "Visão geral"], ["ferramentas", "Ferramentas"], ["linear", "Linear"],
  ["grafo", "Grafo Celestial"], ["padroes", "Padrões"], ["comandos", "Comandos"],
  ["auditoria", "Auditoria"], ["grok", "Grok"], ["buildkite", "Buildkite"],
  ["conector", "Conector"], ["diagnostico", "Diagnóstico"], ["omni", "Omni"],
  ["tailscale", "Tailscale"],
] as const;
const SOURCES: Record<string, { url: string; owner: string }> = {
  linear: { url: MCP + "/linear/status", owner: "tools/integrations.js" },
  grafo: { url: API + "/api/live-fabric/graph", owner: "apps/modulos/graph-panel" },
  padroes: { url: MCP + "/tools.json", owner: ".agents/skills/meta-lupa" },
  comandos: { url: MCP + "/intent/status", owner: "intent-cycle-adapter.js" },
  auditoria: { url: MCP + "/health", owner: "log-funnel.js / operational-telemetry.js" },
  grok: { url: MCP + "/admin/api/grok/control", owner: "grok-control.js" },
  buildkite: { url: MCP + "/admin/api/buildkite/status", owner: "buildkite-integration.js" },
  conector: { url: MCP + "/status.json", owner: "MCP OAuth broker" },
  diagnostico: { url: MCP + "/health/deep", owner: "health-deep.js" },
  omni: { url: API + "/api/omni/status", owner: "elite-gateway/omni" },
  tailscale: { url: MCP + "/admin/api/tailscale", owner: "admin-provider-control.js" },
};
function Signal({ title, state, detail }: { title: string; state: string; detail: string }) {
  return <article className="panel p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className="font-semibold">{title}</h4>
      <code className="rounded-md border border-border p-1 text-[10px]">{state}</code>
    </div>
    <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{detail}</p>
  </article>;
}
export function McpOperacoesCentralDark() {
  const fetchMcp = useServerFn(lerMcpPainelCentralDark);
  const q = useQuery({
    queryKey: ["centraldark", "mcp-operations-original-owner"],
    queryFn: () => fetchMcp(),
    refetchInterval: 15_000,
    retry: false,
  });
  const [filter, setFilter] = useState("");
  const d = q.data;
  const tools = useMemo(() => (d?.tools.names ?? [])
    .filter(name => name.toLowerCase().includes(filter.toLowerCase())), [d?.tools.names, filter]);
  return <section aria-labelledby="cd-mcp-operations-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h3 id="cd-mcp-operations-title" className="text-xl font-semibold">
          MCP CentralDark · Funções no Instinto Superior
        </h3>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Os mesmos sensores e owners do MCP, sem segundo backend.
          Leitura sanitizada; escrita somente após vinculação da autenticação administrativa.
        </p>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          {d?.observedAt ?? "AGUARDANDO"} · {d?.access ?? "UNKNOWN"} · consulta a cada 15s
        </p>
      </div>
      <Button variant="outline" onClick={() => void q.refetch()} disabled={q.isFetching}>
        <RefreshCw className={q.isFetching ? "animate-spin" : ""}/> Remedir MCP
      </Button>
    </div>
    {q.error ? <p role="alert" className="mt-3 text-sm text-destructive">
      Consulta indisponível: {q.error instanceof Error ? q.error.message : String(q.error)}
    </p> : null}
    <Tabs defaultValue="visao" className="mt-6">
      <TabsList className="h-auto flex-wrap justify-start">
        {SECTORS.map(([id, label]) => <TabsTrigger key={id} value={id}>{label}</TabsTrigger>)}
      </TabsList>
      <TabsContent value="visao" className="mt-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(d?.checks ?? []).map(item =>
            <Signal key={item.id} title={item.id} state={item.state}
              detail={item.source + " · HTTP " + (item.httpStatus ?? "UNKNOWN")} />
          )}
          {!d ? <Signal title="Sensores" state="UNKNOWN" detail="Aguardando MCP."/> : null}
        </div>
        <h4 className="mt-6 font-semibold">Catálogo e deploy — fonte MCP /status.json</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Signal title="Catálogo publicado" state={d?.catalogHealth.diff.level ?? "UNKNOWN"}
            detail={"Código: " + (d?.catalogHealth.diff.inCode ?? "UNKNOWN") +
              " · publicado: " + (d?.catalogHealth.diff.published ?? "UNKNOWN")} />
          <Signal title="Ferramentas não publicadas" state={d?.catalogHealth.diff.missing === 0 ? "ZERO_MEDIDO" : "CHECK_REQUIRED"}
            detail={String(d?.catalogHealth.diff.missing ?? "UNKNOWN")} />
          <Signal title="Main ↔ VPS" state="DRIFT_EVIDENCE_ONLY"
            detail={(d?.catalogHealth.deploy.mainSha ?? "MAIN_UNKNOWN") + " / " +
              (d?.catalogHealth.deploy.vpsSha ?? "VPS_UNKNOWN")} />
        </div>
        <h4 className="mt-6 font-semibold">Setores do MCP</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(d?.sectors ?? []).map((item, index) =>
            <Signal key={item.id + index} title={item.id} state={item.state}
              detail={(item.source ?? "SEM FONTE") + " · " +
                (item.observedAt ?? "SEM HORARIO") + " · " + (item.nextCursor ?? "SEM CURSOR")} />
          )}
        </div>
      </TabsContent>
      <TabsContent value="ferramentas" className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs">
            Catálogo real · HTTP {d?.tools.probe.httpStatus ?? "UNKNOWN"} ·
            {d?.tools.reported ?? "UNKNOWN"} ferramentas declaradas
          </p>
          <label className="flex items-center gap-2 rounded-md border border-border p-2">
            <Search className="size-4" aria-hidden />
            <span className="sr-only">Buscar ferramenta MCP</span>
            <input value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="Buscar ferramenta" className="bg-transparent text-sm outline-none" />
          </label>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(name => <div key={name} className="rounded-md border border-border p-3 font-mono text-xs">{name}</div>)}
        </div>
        <h4 className="mt-6 font-semibold">Grupos originais de ferramentas</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(q.data?.tools.groups ?? []).map((group, index) => (
            <Signal key={group.id ?? index} title={group.label ?? "GRUPO_UNKNOWN"}
              state={group.level ?? "UNKNOWN"}
              detail={String(group.count ?? "UNKNOWN") + " ferramentas · " + group.names.slice(0, 4).join(", ")} />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Listagem e filtro funcionam; executar ferramenta exige escopo administrativo e receipt.
        </p>
      </TabsContent>
      <TabsContent value="auditoria" className="mt-5">
        <Signal title="Eventos MCP" state={d?.events.state ?? "UNKNOWN"}
          detail={(d?.events.countInSample ?? "UNKNOWN") + " eventos na janela; não é o histórico integral."} />
        <div className="mt-3 space-y-2">
          {(d?.events.recent ?? []).map((item, index) =>
            <p key={index} className="rounded-md border border-border p-3 font-mono text-xs">
              {item.at ?? "SEM HORARIO"} · {item.sector ?? "UNKNOWN"} /
              {item.service ?? "UNKNOWN"} · {item.kind ?? "UNKNOWN"} · {item.level ?? "UNKNOWN"}
            </p>
          )}
        </div>
      </TabsContent>
      {SECTORS.filter(([id]) => !["visao","ferramentas","auditoria"].includes(id)).map(([id,label]) => {
        const src = SOURCES[id];
        const probe = id === "linear" ? d?.integrations.linear
          : id === "conector" ? d?.integrations.connectors
          : id === "diagnostico" ? d?.integrations.e2ePublic : null;
        const restricted = src.url.startsWith(MCP + "/admin/api/");
        const related = (d?.sectors ?? []).find(item => item.id.toLowerCase().includes(id));
        return <TabsContent key={id} value={id} className="mt-5">
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold">{label}</h4>
              <code>{probe?.state ?? related?.state ?? (restricted ? "AUTH_REQUIRED" : "MEDIÇÃO ESPECÍFICA PENDENTE")}</code>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Owner: {src.owner}. Ações protegidas continuam exigindo a credencial do MCP original.
            </p>
            <p className="mt-2 break-all font-mono text-xs">
              {src.url} · HTTP {probe?.httpStatus ?? "UNKNOWN"}
            </p>
            {id === "conector" ? <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(d?.catalogHealth.connectors ?? []).map((item, index) => (
                <Signal key={item.name ?? index} title={item.name ?? "CONECTOR"}
                  state={item.level ?? "UNKNOWN"} detail={"latência: " +
                    (item.latencyMs ?? "UNKNOWN") + " ms · fonte MCP /status.json"} />
              ))}
            </div> : null}
            {id === "comandos" ? <p className="mt-3 text-sm">
              #ACORDAR · !CALIBRAR · !MULTIBÚSSOLA · !META_LUPA.
              Uma intenção apresentada não comprova missão executada.
            </p> : null}
            {restricted ? <p className="mt-4 text-xs text-muted-foreground">
              Ação privilegiada: exige a sessão administrativa original. Não abrir endpoint
              protegido sem contexto nem confundir HTTP 401 com execução.
            </p> : <Button asChild variant="outline" className="mt-4">
              <a href={src.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4"/> Abrir fonte pública original
              </a>
            </Button>}
          </div>
        </TabsContent>;
      })}
    </Tabs>
    <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
      MESMO OWNER · LEITURA FUNCIONAL · ESCRITA AUTENTICADA AINDA PENDENTE ·
      RETIRAR CASCA ANTIGA SÓ APÓS PARIDADE.
    </div>
  </section>;
}
