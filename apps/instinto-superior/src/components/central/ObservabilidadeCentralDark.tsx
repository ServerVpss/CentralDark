import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  BarChart3,
  Gauge,
  GitBranch,
  House,
  KeyRound,
  Mail,
  Monitor,
  Radio,
  RefreshCw,
  Server,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { lerEstadoCentralDark, type Estado } from "@/lib/cockpit.functions";
import { lerConexoesCentralDark } from "@/lib/conexoes.functions";
import {
  CartaoResponsabilidade,
  type ContratoCartaoResponsabilidade,
} from "@/components/central/CartaoResponsabilidade";


type SemanaHarness = {
  schema: string;
  window: string;
  observedAt: string;
  coverage: "PARTIAL_CAPPED" | "PARTIAL_INSTRUMENTED";
  capped: boolean;
  totalObserved: number;
  traced: number;
  tracePctOfObserved: number | null;
  pass: number;
  fail: number;
  unknown: number;
  successPctOfDecided: number | null;
  failurePctOfDecided: number | null;
  unknownPctOfObserved: number | null;
  avgDurationMs: number | null;
  daily: Array<{ day: string; calls: number; pass: number; fail: number; unknown: number }>;
  bySource: Array<{ name: string; calls: number; pass: number; fail: number; unknown: number }>;
  topTools: Array<{ name: string; calls: number; pass: number; fail: number; unknown: number }>;
};

/**
 * Projeção de observabilidade, não nova coleta. A autenticação continua com
 * o MCP Admin; não transportamos tokens nem cookies em estado do cockpit.
 */
function RastroSemanalMcp() {
  const base = "https://api.centralldark.com";
  const rota = base + "/admin/api/metricas";
  const q = useQuery({
    queryKey: ["centraldark", "harness-weekly-admin"],
    queryFn: async (): Promise<SemanaHarness> => {
      const response = await fetch(rota, {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (response.status === 401 || response.status === 403) throw new Error("AUTH_REQUIRED");
      if (!response.ok) throw new Error("API_UNAVAILABLE");
      const json = await response.json() as { harnessWeek?: SemanaHarness };
      if (json.harnessWeek?.schema !== "centraldark.harness.weekly.v1")
        throw new Error("WEEKLY_NOT_DEPLOYED");
      return json.harnessWeek;
    },
    refetchInterval: 60_000,
    retry: false,
  });
  const d = q.data;
  const status = d ? d.coverage : q.isPending ? "PENDING" :
    q.error instanceof Error ? q.error.message : "UNKNOWN";
  const pct = (value: number | null | undefined) => value == null ? "UNKNOWN" : value.toFixed(1) + "%";
  const max = Math.max(1, ...((d?.daily ?? []).map(day => day.calls)));
  return (
    <section className="mt-6 rounded-xl border border-border bg-surface-1/80 p-4 sm:p-5"
      aria-labelledby="harness-weekly-title">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-neon-green" aria-hidden="true" />
          <h3 id="harness-weekly-title" className="font-semibold">Rastro de ferramentas · últimos 7 dias</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => void q.refetch()} disabled={q.isFetching}>
          <RefreshCw className={q.isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
          Atualizar
        </Button>
      </header>
      <p className="mt-2 text-xs text-muted-foreground">
        API MCP existente /admin/api/metricas · amostra de eventos instrumentados.
        Não inclui automaticamente chamadas internas do ChatGPT nem todas as ferramentas do desktop.
      </p>
      <p className="mt-3 font-mono text-xs" role="status" aria-live="polite">
        {status}{d?.capped ? " · LIMITE DA AMOSTRA ATINGIDO" : ""}
        {d ? " · observado " + new Date(d.observedAt).toLocaleString("pt-BR") : ""}
      </p>
      {d ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["Chamadas observadas", String(d.totalObserved), "Eventos deduplicados"],
              ["Acertos", pct(d.successPctOfDecided), d.pass + " PASS / resultados conhecidos"],
              ["Erros", pct(d.failurePctOfDecided), d.fail + " FAIL / resultados conhecidos"],
              ["Sem veredito", pct(d.unknownPctOfObserved), d.unknown + " UNKNOWN / observados"],
              ["CARACOL · rastreável", pct(d.tracePctOfObserved), d.traced + " IDs de correlação / observados"],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <strong className="mt-1 block font-mono text-xl">{value}</strong>
                <small className="text-[10px] text-muted-foreground">{detail}</small>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Duração média das amostras medidas: {d.avgDurationMs == null ? "UNKNOWN" : d.avgDurationMs + " ms"}.
            Cobertura: {d.coverage}. ID de correlação não equivale a prova causal. Sem inferir 100% do harness.
          </p>
          <div className="mt-4 grid grid-cols-7 gap-1" role="list" aria-label="Chamadas observadas por dia, UTC">
            {d.daily.map(day => (
              <div key={day.day} role="listitem" className="min-w-0 text-center">
                <div className="flex h-20 items-end justify-center rounded border border-border bg-background/30 p-1">
                  <div className="w-full rounded-sm bg-neon-green/70"
                    style={{ height: (day.calls ? Math.max(8, (day.calls / max) * 100) : 0) + "%" }} />
                </div>
                <span className="mt-1 block font-mono text-[10px]">{day.day.slice(5)}</span>
                <span className="block font-mono text-[10px] text-muted-foreground">{day.calls}</span>
              </div>
            ))}
          </div>
          <details className="mt-4 rounded-lg border border-border p-3">
            <summary className="cursor-pointer font-semibold">Ferramentas e fontes · detalhar</summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-xs">
                <thead><tr><th>Origem / ferramenta</th><th>Chamadas</th><th>PASS</th><th>FAIL</th><th>UNKNOWN</th></tr></thead>
                <tbody>
                  {[...d.bySource, ...d.topTools].map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="max-w-56 truncate py-1" title={row.name}>{row.name}</td>
                      <td>{row.calls}</td><td>{row.pass}</td><td>{row.fail}</td><td>{row.unknown}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-amber-500/40 p-4 text-sm">
          Dados semanais indisponíveis nesta sessão. Sem números fictícios e sem marcar PASS.
          <a className="mt-2 block underline" href={base + "/admin"} target="_blank" rel="noreferrer">
            Abrir administração MCP e verificar autenticação / rastro
          </a>
        </div>
      )}
    </section>
  );
}

export function ObservabilidadeCentralDark() {
  const ler = useServerFn(lerEstadoCentralDark);
  const q = useQuery({
    queryKey: ["centraldark", "observabilidade-admin"],
    queryFn: () => ler(),
    refetchInterval: 15_000,
    retry: false,
  });
  const consultarConexoes = useServerFn(lerConexoesCentralDark);
  const conexoes = useQuery({
    queryKey: ["centraldark", "contas-conexoes"],
    queryFn: () => consultarConexoes(),
    refetchInterval: 60_000,
    retry: false,
  });
  const consultaCatalogoFresca =
    conexoes.dataUpdatedAt > 0 &&
    Date.now() - conexoes.dataUpdatedAt <= 90_000 &&
    !conexoes.isError;
  // PASS atesta apenas a resposta do catálogo do Hub, não o processo em :8098.
  const estadoCatalogo: Estado = consultaCatalogoFresca
    ? (conexoes.data?.estado ?? "UNKNOWN")
    : "UNKNOWN";
  const d = q.data;
  const medidoEm =
    q.dataUpdatedAt > 0 ? new Date(q.dataUpdatedAt).toLocaleTimeString("pt-BR") : null;
  const unknown: Estado = "UNKNOWN";
  const sinais = [
    {
      label: "API CentralDark",
      estado: d?.apiHealth ?? unknown,
      detail: `HTTP ${d?.apiHealthHttp ?? "UNKNOWN"} · ${d?.liveFabricFonte ?? "UNKNOWN"}/health`,
      icon: Server,
    },
    {
      label: "Heartbeat",
      estado: d?.heartbeat ?? unknown,
      detail: `HTTP ${d?.heartbeatHttp ?? "UNKNOWN"} · self=${d?.heartbeatSelf ?? "UNKNOWN"}`,
      icon: Activity,
    },
    {
      label: "Omni Router",
      estado: d?.omniRouter ?? unknown,
      detail: `HTTP ${d?.omniHttp ?? "UNKNOWN"} · /api/omni/status`,
      icon: Radio,
    },
    {
      label: "Omni Models",
      estado: d?.omniModels ?? unknown,
      detail: `HTTP ${d?.omniModelsHttp ?? "UNKNOWN"} · /api/omni/models`,
      icon: Radio,
    },
    {
      label: "Receipts",
      estado: d?.receipts ?? unknown,
      detail: `HTTP ${d?.receiptsHttp ?? "UNKNOWN"} · /api/microdeploy/receipts/index.json`,
      icon: Activity,
    },
    {
      label: "Live Fabric",
      estado: d?.liveFabric ?? unknown,
      detail: `HTTP ${d?.liveFabricHttp ?? "UNKNOWN"} · ${d?.erroLiveFabric ?? "sem erro reportado"}`,
      icon: Activity,
    },
    {
      label: "Grafo Vivo",
      estado: d?.grafoVivo ?? unknown,
      detail: `HTTP ${d?.grafoHttp ?? "UNKNOWN"} · /api/live-fabric/graph`,
      icon: Activity,
    },
    {
      label: "Casa / Instinto",
      estado: d?.casaSite ?? unknown,
      detail: `HTTP ${d?.casaSiteHttp ?? "UNKNOWN"} · 127.0.0.1:4175`,
      icon: House,
    },
    {
      label: "Screenpipe Casa",
      estado: d?.screenpipe ?? unknown,
      detail: `HTTP ${d?.screenpipeHttp ?? "UNKNOWN"} · status=${d?.screenpipeDetail ?? "UNKNOWN"} · 127.0.0.1:3030`,
      icon: Monitor,
    },
    {
      label: "GitHub main",
      estado: d?.github ?? unknown,
      detail: `${d?.mainSha?.slice(0, 12) ?? "UNKNOWN"} · ${d?.fonte ?? "UNKNOWN"}`,
      icon: GitBranch,
    },
    {
      label: "Gmail sensor",
      estado: d?.gmail ?? unknown,
      detail: d?.gmailFonte ?? "UNKNOWN",
      icon: Mail,
    },
    {
      label: "Desktop Commander",
      estado: d?.desktop ?? unknown,
      detail: d?.desktopFonte ?? "UNKNOWN",
      icon: Monitor,
    },
  ] as const;
  const leituraFresca = Boolean(medidoEm) && Date.now() - q.dataUpdatedAt <= 45_000 && !q.isError;
  // Contrato obrigatório para cada sinal deste owner: todos os nomes têm dono e tarefa.
  type Metadados = Pick<
    ContratoCartaoResponsabilidade,
    | "nomeHumano"
    | "paraQueServe"
    | "responsabilidade"
    | "ownerTecnico"
    | "fonteDaProva"
    | "escopoEstado"
    | "limiteDaProva"
  >;
  const metadados: Record<(typeof sinais)[number]["label"], Metadados> = {
    "API CentralDark": {
      nomeHumano: "🩺 Porta de saúde da API",
      paraQueServe: "É a porta que responde se a API CentralDark está acessível.",
      responsabilidade: "Responder à verificação de saúde da API.",
      ownerTecnico: "API CentralDark · GET /health",
      fonteDaProva: "API CentralDark · /health",
      escopoEstado: "da rota /health",
      limiteDaProva: "A porta responder não prova que todos os serviços internos funcionem.",
    },
    Heartbeat: {
      nomeHumano: "🫀 Batimento do sistema",
      paraQueServe: "É o sinal de vida informado pelo serviço.",
      responsabilidade: "Expor o estado do pulso consultado.",
      ownerTecnico: "API CentralDark · GET /heartbeat",
      fonteDaProva: "API CentralDark · /heartbeat",
      escopoEstado: "do pulso consultado",
      limiteDaProva: "Uma resposta antiga não comprova funcionamento atual.",
    },
    "Omni Router": {
      nomeHumano: "🌀 Caminho dos modelos",
      paraQueServe: "Mostra se a porta de encaminhamento do Omni responde.",
      responsabilidade: "Informar o estado da rota de orquestração.",
      ownerTecnico: "Omni Router · GET /api/omni/status",
      fonteDaProva: "API CentralDark · /api/omni/status",
      escopoEstado: "da rota Omni",
      limiteDaProva: "Não prova que cada modelo consiga concluir uma tarefa.",
    },
    "Omni Models": {
      nomeHumano: "🧠 Lista de motores",
      paraQueServe: "Consulta os modelos anunciados pela infraestrutura Omni.",
      responsabilidade: "Expor a consulta ao catálogo de motores.",
      ownerTecnico: "Omni Router · GET /api/omni/models",
      fonteDaProva: "API CentralDark · /api/omni/models",
      escopoEstado: "da consulta aos modelos",
      limiteDaProva: "Modelo listado não significa modelo disponível ou testado.",
    },
    Receipts: {
      nomeHumano: "🧾 Comprovantes do trabalho",
      paraQueServe: "É a gaveta em que procuramos recibos de operações.",
      responsabilidade: "Servir o índice de evidências de microdeploy.",
      ownerTecnico: "Microdeploy · GET /api/microdeploy/receipts/index.json",
      fonteDaProva: "API CentralDark · receipts/index.json",
      escopoEstado: "do índice de recibos",
      limiteDaProva: "Acesso ao índice não comprova cada operação registrada.",
    },
    "Live Fabric": {
      nomeHumano: "⚙️ Esteira de execução",
      paraQueServe: "Mostra o estado que a esteira de execução reporta.",
      responsabilidade: "Expor o status do Live Fabric.",
      ownerTecnico: "Live Fabric · GET /api/live-fabric/status",
      fonteDaProva: "API CentralDark · /api/live-fabric/status",
      escopoEstado: "do status da esteira",
      limiteDaProva: "O endpoint responder não prova que uma tarefa foi concluída.",
    },
    "Grafo Vivo": {
      nomeHumano: "🕸️ Mapa das ligações",
      paraQueServe: "É o mapa consultável das conexões e dependências.",
      responsabilidade: "Expor o grafo da infraestrutura viva.",
      ownerTecnico: "Live Fabric · GET /api/live-fabric/graph",
      fonteDaProva: "API CentralDark · /api/live-fabric/graph",
      escopoEstado: "da rota do grafo",
      limiteDaProva: "Grafo acessível não garante que cada nó esteja ativo.",
    },
    "Casa / Instinto": {
      nomeHumano: "🏠 Página local",
      paraQueServe: "Verifica se a página do host consultado responde.",
      responsabilidade: "Medir o acesso à interface local do servidor.",
      ownerTecnico: "Servidor do Cockpit · 127.0.0.1:4175",
      fonteDaProva: "Host do servidor · HTTP 127.0.0.1:4175",
      escopoEstado: "da página local",
      limiteDaProva: "Loopback mede o host do servidor, não necessariamente a Casa Windows.",
    },
    "Screenpipe Casa": {
      nomeHumano: "👀 Sensor de atividade",
      paraQueServe: "Consulta a saúde do sensor de atividade disponível no host.",
      responsabilidade: "Expor o status do serviço Screenpipe.",
      ownerTecnico: "Screenpipe · 127.0.0.1:3030/health",
      fonteDaProva: "Host do servidor · HTTP 127.0.0.1:3030/health",
      escopoEstado: "do sensor consultado",
      limiteDaProva: "Loopback não comprova o sensor físico da Casa sem rota até ela.",
    },
    "GitHub main": {
      nomeHumano: "📦 Fonte do código",
      paraQueServe: "Mostra qual versão o repositório principal apresenta.",
      responsabilidade: "Consultar o HEAD da branch main.",
      ownerTecnico: "GitHub · ServerVpss/CentralDark@main",
      fonteDaProva: "GitHub API / conector autorizado",
      escopoEstado: "da consulta ao GitHub",
      limiteDaProva: "Commit publicado não é a mesma coisa que deploy executado.",
    },
    "Gmail sensor": {
      nomeHumano: "✉️ Correio conectado",
      paraQueServe: "Indica se há autorização comprovada para consultar mensagens.",
      responsabilidade: "Projetar a capacidade de acesso ao Gmail.",
      ownerTecnico: "Sensor externo Gmail / ChatGPT",
      fonteDaProva: "Estado de autorização do sensor externo",
      escopoEstado: "da autorização Gmail",
      limiteDaProva: "Sem adapter autenticado neste app, permanece AUTH_REQUIRED/UNKNOWN.",
    },
    "Desktop Commander": {
      nomeHumano: "🖥️ Ponte com o computador",
      paraQueServe: "É a rota usada para observar um computador autorizado.",
      responsabilidade: "Projetar o estado da integração de desktop remoto.",
      ownerTecnico: "Remote Desktop Commander · conector externo",
      fonteDaProva: "Estado externo do Remote Desktop Commander",
      escopoEstado: "da rota externa",
      limiteDaProva: "A existência do conector não comprova sessão ativa neste app.",
    },
  };
  const sinaisComResponsabilidade: ContratoCartaoResponsabilidade[] = sinais.map((s) => ({
    ...metadados[s.label],
    nomeTecnico: s.label,
    estado: leituraFresca ? s.estado : "STALE/UNKNOWN",
    detalheTecnico: s.detail,
    icone: s.icon,
    consultaEm: d?.atualizadoEm ?? null,
  }));

  const confirmados = leituraFresca ? sinais.filter((s) => s.estado === "PASS").length : 0;
  const naoConfirmados = sinais.length - confirmados;

  return (
    <section aria-labelledby="observabilidade-centraldark-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
            HUD vivo · evidência primeiro
          </p>
          <h3 id="observabilidade-centraldark-title" className="mt-3 text-2xl font-semibold">
            Observabilidade CentralDark
          </h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Casa faz o trabalho pesado; GitHub Actions fica sob demanda. FAIL, AUTH_REQUIRED e
            UNKNOWN permanecem visíveis.
          </p>
        </div>
        <Button variant="outline" onClick={() => void q.refetch()} disabled={q.isFetching}>
          <RefreshCw className={q.isFetching ? "animate-spin" : ""} /> Atualizar
        </Button>
      </div>

      <div
        className="mt-6 rounded-xl border border-neon-blue/30 bg-neon-blue/5 p-4"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong className="text-sm">🫀 Pulso atual · Instinto Superior</strong>
          <span className="font-mono text-xs text-muted-foreground">
            {leituraFresca ? `Consulta concluída às ${medidoEm}` : "STALE / SEM MEDIÇÃO FRESCA"}
          </span>
        </div>
        <p className="mt-2 text-sm">
          {leituraFresca
            ? `${confirmados}/${sinais.length} sinais PASS medidos`
            : "Nenhum PASS promovido sem leitura atual"}
          {` · ${naoConfirmados} sinais sem PASS nesta leitura`}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Consulta dos owners existentes a cada 15 segundos. Somente estado atual: sem copiar
          histórico do HUD, sem transformar dado antigo em verde e sem segundo monitor.
        </p>
      </div>

      <RastroSemanalMcp />
      <div className="mt-6">
        <CartaoResponsabilidade
          id="oauth-broker-title"
          icone={KeyRound}
          nomeHumano="🔐 Porteiro das conexões"
          nomeTecnico="OAuth Broker"
          paraQueServe="É o porteiro da CentralDark: quando você conecta uma conta, ele organiza a autorização e guarda o acesso no cofre. As ferramentas conseguem conversar com o serviço certo sem espalhar senhas pela tela."
          responsabilidade="Gerenciar as autorizações de contas conectadas e proteger o cofre de acesso."
          ownerTecnico="apps/modulos/oauth-broker/server.mjs"
          estado={consultaCatalogoFresca ? estadoCatalogo : "STALE/UNKNOWN"}
          escopoEstado="do catálogo de contas"
          fonteDaProva={conexoes.data?.fonte ?? "Hub CentralDark · não confirmado"}
          consultaEm={conexoes.data?.medidoEm ?? null}
          detalheTecnico="OAuth, retornos de autorização e cofre cifrado; consulta administrativa via GET /api/welcome-kit."
          limiteDaProva="O estado do catálogo não comprova que o processo em 127.0.0.1:8098 esteja ativo, nem valida a API administrativa Tailscale."
          tecnicoAberto
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sinaisComResponsabilidade.map((s) => (
          <CartaoResponsabilidade key={s.nomeTecnico} {...s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="panel p-5">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-gold" />
            <h4 className="font-semibold">GitHub Actions · orçamento</h4>
          </div>
          <p className="mt-3 font-mono text-xs">
            {d?.actions ?? "UNKNOWN"} · período {d?.actionsPeriod ?? "UNKNOWN"}
          </p>
          <dl className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between gap-3">
              <dt>Linux</dt>
              <dd>{d?.actionsLinuxMinutes ?? "UNKNOWN"} min</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Windows</dt>
              <dd>{d?.actionsWindowsMinutes ?? "UNKNOWN"} min</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Storage</dt>
              <dd>{d?.actionsStorageGbHours ?? "UNKNOWN"} GB-h</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Bruto</dt>
              <dd>${d?.actionsGrossAmountUsd?.toFixed(3) ?? "UNKNOWN"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Líquido</dt>
              <dd>${d?.actionsNetAmountUsd?.toFixed(3) ?? "UNKNOWN"}</dd>
            </div>
          </dl>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            {d?.actionsFonte ?? "UNKNOWN"}
            {d?.actionsErro ? ` · ${d.actionsErro}` : ""}
          </p>
        </article>
        <article className="panel p-5">
          <h4 className="font-semibold">Execução e sincronização</h4>
          <p className="mt-3 font-mono text-xs">
            {d?.executionPolicy ?? "CASA_HEAVY_GITHUB_ACTIONS_ON_DEMAND"}
          </p>
          <dl className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between gap-3">
              <dt>Deploy</dt>
              <dd>{d?.deploy ?? "UNKNOWN"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Main</dt>
              <dd className="font-mono">{d?.mainSha?.slice(0, 12) ?? "UNKNOWN"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>VPS</dt>
              <dd className="font-mono">{d?.vpsSha?.slice(0, 12) ?? "UNKNOWN"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Delta VPS</dt>
              <dd>{d?.deltaVps ?? "UNKNOWN"}</dd>
            </div>
          </dl>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            Atualizado: {d?.atualizadoEm ?? "UNKNOWN"}
          </p>
        </article>
      </div>
    </section>
  );
}
