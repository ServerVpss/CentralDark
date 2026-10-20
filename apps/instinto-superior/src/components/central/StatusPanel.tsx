import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Eye, Github, House, Monitor, RefreshCw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lerEstadoCentralDark, type Estado } from "@/lib/cockpit.functions";

type Luz = "verde" | "amarela" | "vermelha";
const CORES: Record<Luz, string> = {
  verde: "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,.65)]",
  amarela: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,.55)]",
  vermelha: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.65)]",
};
function luz(estado: Estado): Luz {
  if (estado === "PASS") return "verde";
  if (estado === "RUNNING") return "amarela";
  if (estado === "FAIL" || estado === "BLOCKED") return "vermelha";
  return "amarela";
}
function etiqueta(estado: Estado) {
  if (estado === "PASS") return "OPERACIONAL";
  if (estado === "FAIL" || estado === "BLOCKED") return "INDISPONÍVEL";
  return estado === "AUTH_REQUIRED" ? "AUTORIZAÇÃO" : "NÃO COMPROVADO";
}
/** O pulso verde significa exclusivamente medição atual PASS, não prova histórica. */
function LuzViva({ estado, nome, fresco }: { estado: Estado; nome: string; fresco: boolean }) {
  const valido = fresco ? estado : "UNKNOWN";
  const cor = luz(valido);
  return (
    <span className="inline-flex items-center gap-2" aria-label={`${nome}: ${etiqueta(valido)}`}>
      <span className={`size-3 shrink-0 rounded-full ${fresco && valido === "PASS" ? "animate-pulse motion-reduce:animate-none" : ""} ${CORES[cor]}`} aria-hidden="true" />
      <span className="font-mono text-[10px]">{etiqueta(valido)}</span>
    </span>
  );
}
function DataHora({ iso }: { iso: string | null | undefined }) {
  if (!iso) return <>SEM MEDIÇÃO</>;
  const n = Date.parse(iso);
  return <>{Number.isFinite(n) ? new Date(n).toLocaleString("pt-BR", { timeZone: "America/Bahia" }) : "DATA INVÁLIDA"}</>;
}

/**
 * Owner existente do status. Não usa estados iniciais "online" falsos.
 * O servidor do cockpit consulta os sensores a cada 15s; snapshots antigos
 * deixam de contar como prova, inclusive após erro de transporte.
 */
export function StatusPanel() {
  // 2026-10-16: SSR hydration guard. Date.now() and cache freshness must not
  // influence the server render vs the browser's first hydration render.
  // This is an incremental, fail-closed fix; post-mount reads stay measured.
  const [hidratado, definirHidratado] = useState(false);
  useEffect(() => { definirHidratado(true); }, []);
  const ler = useServerFn(lerEstadoCentralDark);
  const q = useQuery({
    queryKey: ["centraldark", "estado-vivo"],
    queryFn: () => ler(),
    refetchInterval: 15_000,
    retry: false,
    refetchOnWindowFocus: true,
  });
  const fresco = hidratado && Boolean(q.data) && !q.isError && (Date.now() - q.dataUpdatedAt < 45_000);
  const d = fresco ? q.data : null;
  const unknown: Estado = "UNKNOWN";
  const screen: Estado = d?.screenpipe ?? unknown;
  const remote: Estado = d?.desktop ?? unknown;
  const medidoEm = d?.atualizadoEm;
  const sinais = [
    { nome: "Casa / Site local", estado: d?.casaSite ?? unknown, detalhe: `HTTP ${d?.casaSiteHttp ?? "?"} · testado apenas no Windows`, icon: House },
    { nome: "Main GitHub", estado: d?.github ?? unknown, detalhe: d?.mainSha?.slice(0, 12) ?? "SHA não medido", icon: Github },
    { nome: "VPS · comparação SHA", estado: d?.deploy ?? unknown, detalhe: `SHA ${d?.vpsSha?.slice(0, 12) ?? "?"} · não prova serviço`, icon: Server },
    { nome: "API CentralDark", estado: d?.apiHealth ?? unknown, detalhe: `HTTP ${d?.apiHealthHttp ?? "?"} · /health`, icon: Activity },
  ];

  const rotas = [
    { id: "casa-site", owner: "Casa Windows / Vite", estado: d?.casaSite ?? unknown, fonte: "Casa/Site local · HTTP 4175" },
    { id: "github-main", owner: "GitHub main", estado: d?.github ?? unknown, fonte: "GitHub API · main SHA" },
    { id: "vps-sha", owner: "Microdeploy VPS", estado: d?.deploy ?? unknown, fonte: "VPS SHA · comparação com main (não prova serviço)" },
    { id: "api-health", owner: "API CentralDark", estado: d?.apiHealth ?? unknown, fonte: "API /health · não prova todo o sistema" },
    { id: "screenpipe-casa", owner: "Screenpipe Casa", estado: d?.screenpipe ?? unknown, fonte: d?.screenpipeFonte ?? "Casa 3030/health" },
    { id: "screenpipe-vps", owner: "Screenpipe VPS", estado: d?.screenpipeVps ?? unknown, fonte: d?.screenpipeVpsFonte ?? "VPS 3030/health" },
  ] as const;
  const rotasComProblema = rotas.filter((rota) => rota.estado !== "PASS");

  const modulos = [
    {
      nome: "Screenpipe", estado: screen, icon: Eye, subtitulo: "Saída local do /health do Screenpipe",
      origem: d?.screenpipeFonte ?? "Sensor não carregado",
      linhas: d?.screenpipeEvents ?? ["Aguardando leitura real do servidor"],
      nota: "Linhas sanitizadas de saúde e dependências. Capturas/OCR e stream bruto não são publicados.",
    },
    {
      nome: "Desktop Commander", estado: remote, icon: Monitor, subtitulo: "Ponte remota · Casa SEGREDO / VPS",
      origem: d?.desktopFonte ?? "Adapter da sessão não conectado ao site",
      linhas: [
        `STATUS: ${remote}`,
        "MCP do ChatGPT ≠ conexão comprovada do servidor do cockpit",
        "Sem stream remoto autenticado neste runtime — não inferir ONLINE",
      ],
      nota: "O plugin conectado nesta conversa não expõe automaticamente seus logs ao site. Exige ponte autorizada existente.",
    },
  ];

  return (
    <section className="panel space-y-5 p-5" aria-label="Máquina de estados viva da CentralDark">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">🫀 Máquina de estados · conexões vivas</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sensor real → identidade → estado → contraprova. 🟢 PASS · 🟡 sem prova/degradado · 🔴 falha confirmada.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground">POLÍTICA 15S</span>
          <Button data-cd-flow="instinto.StatusPanel.botao-01" size="sm" variant="outline" onClick={() => void q.refetch()} disabled={q.isFetching}>
            <RefreshCw className={`size-4 ${q.isFetching ? "animate-spin" : ""}`} /> Medir agora
          </Button>
        </div>
      </header>
      <p className="font-mono text-[11px] text-muted-foreground" role="status" aria-live="polite">
        {fresco ? <>Consulta: <DataHora iso={medidoEm} /> · atualização periódica ativa</> : "SEM MEDIÇÃO FRESCA · não promover último verde"}
        {q.isError ? " · falha de transporte no servidor" : ""}
      </p>
      {fresco && rotasComProblema.some((rota) => rota.estado === "FAIL" || rota.estado === "BLOCKED") ? (
        <div role="alert" className="rounded-md border border-destructive/45 bg-destructive/10 p-3 text-xs">
          🔴 Conexão com falha confirmada ·{" "}
          {rotasComProblema.filter((rota) => rota.estado === "FAIL" || rota.estado === "BLOCKED").map((rota) => rota.id).join(", ")}
          {" "}— abra “Rotas e alertas” para identificar o owner e a fonte.
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sinais.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.nome} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" /><strong className="text-xs">{s.nome}</strong></div>
              <div className="mt-3"><LuzViva estado={s.estado} nome={s.nome} fresco={fresco} /></div>
              <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">{s.detalhe}</p>
            </article>
          );
        })}
      </div>
      <details className="rounded-md border border-border p-3 text-xs">
        <summary className="cursor-pointer font-medium">
          🧿 Rotas e alertas · {fresco ? rotasComProblema.length : rotas.length} sem PASS atual
        </summary>
        <p className="mt-2 text-muted-foreground">
          Alertas deste painel usam o mesmo sensor da Casa/VPS. Histórico persistente usa a Central de Notificações (Supabase);
          esta leitura não grava eventos nem cria missões.
        </p>
        <ul className="mt-2 space-y-2">
          {rotas.map((rota) => (
            <li key={rota.id} className="rounded border border-border/70 p-2">
              <span className="font-mono">{rota.id}</span> · {fresco ? etiqueta(rota.estado) : "MEDIÇÃO EXPIRADA"}
              <p className="text-muted-foreground">{rota.fonte} · owner: {rota.owner}</p>
              <p className="text-muted-foreground">Última consulta: <DataHora iso={medidoEm} /></p>
            </li>
          ))}
        </ul>
      </details>
      <div className="grid gap-4 md:grid-cols-2">
        {modulos.map((m) => {
          const Icon = m.icon;
          return (
            <article key={m.nome} className="rounded-xl border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2"><Icon className="size-6 text-neon-blue" /><div><h4 className="font-semibold">{m.nome}</h4><p className="text-[11px] text-muted-foreground">{m.subtitulo}</p></div></div>
                <LuzViva estado={m.estado} nome={m.nome} fresco={fresco} />
              </div>
              <p className="mt-3 break-all font-mono text-[10px] text-muted-foreground">Fonte: {m.origem}</p>
              <div className="mt-3 rounded-md border border-border/70 bg-black/50 p-3" aria-label={`Saída do sensor ${m.nome}`}>
                <p className="font-mono text-[10px] tracking-wide text-neon-green">SAÍDA DO SENSOR · <DataHora iso={medidoEm} /></p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-[10px] text-foreground/90">
                  {m.linhas.map((linha, i) => <li key={i} className="break-all">{linha}</li>)}
                </ul>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{m.nota}</p>
            </article>
          );
        })}
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">
        READ-ONLY · NO_FALSE_GREEN · QUERY_TIMEOUT/STALE→UNKNOWN · MONITORES NÃO EXECUTAM COMANDOS
      </p>
    </section>
  );
}
export default StatusPanel;
