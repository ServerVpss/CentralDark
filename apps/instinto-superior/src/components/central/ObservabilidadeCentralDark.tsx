import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
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

function tone(estado: Estado) {
  if (estado === "PASS") return "border-neon-green/30 bg-neon-green/5 text-neon-green";
  if (estado === "RUNNING") return "border-neon-blue/30 bg-neon-blue/5 text-neon-blue";
  if (estado === "FAIL" || estado === "BLOCKED")
    return "border-destructive/40 bg-destructive/10 text-destructive";
  if (estado === "AUTH_REQUIRED") return "border-gold/30 bg-gold/5 text-gold";
  return "border-border bg-muted/40 text-muted-foreground";
}

function Signal({
  label,
  estado,
  detail,
  icon: Icon,
}: {
  label: string;
  estado: Estado;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <article className="panel p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <span
        className={`mt-3 inline-flex rounded-full border px-2 py-1 font-mono text-[10px] ${tone(estado)}`}
      >
        {estado}
      </span>
      <p className="mt-3 break-words font-mono text-[10px] leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </article>
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
  const medidoEm = q.dataUpdatedAt > 0 ? new Date(q.dataUpdatedAt).toLocaleTimeString("pt-BR") : null;
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
  ];
  const leituraFresca = Boolean(medidoEm) && Date.now() - q.dataUpdatedAt <= 45_000 && !q.isError;
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

      <div className="mt-6 rounded-xl border border-neon-blue/30 bg-neon-blue/5 p-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong className="text-sm">🫀 Pulso atual · Instinto Superior</strong>
          <span className="font-mono text-xs text-muted-foreground">
            {leituraFresca ? `Consulta concluída às ${medidoEm}` : "STALE / SEM MEDIÇÃO FRESCA"}
          </span>
        </div>
        <p className="mt-2 text-sm">
          {leituraFresca ? `${confirmados}/${sinais.length} sinais PASS medidos` : "Nenhum PASS promovido sem leitura atual"}
          {` · ${naoConfirmados} sinais sem PASS nesta leitura`}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Consulta dos owners existentes a cada 15 segundos. Somente estado atual: sem copiar histórico do HUD,
          sem transformar dado antigo em verde e sem segundo monitor.
        </p>
      </div>

      <article aria-labelledby="oauth-broker-title" className="mt-6 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-neon-blue" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">🔐 Porteiro das conexões</p>
              <h4 id="oauth-broker-title" className="text-lg font-semibold">OAuth Broker</h4>
            </div>
          </div>
          <span className={`rounded-full border px-2 py-1 font-mono text-[10px] ${tone(estadoCatalogo)}`}>
            Catálogo: {estadoCatalogo}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed">
          É o porteiro da CentralDark: quando você conecta uma conta, ele organiza a autorização
          e guarda o acesso no cofre. As ferramentas conseguem conversar com o serviço certo sem
          espalhar senhas pela tela.
        </p>
        <div className="mt-4 space-y-2 rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Por baixo do capô · detalhes técnicos</p>
          <p><strong>Responsável:</strong> <code>apps/modulos/oauth-broker/server.mjs</code> · OAuth, retornos de autorização e cofre cifrado.</p>
          <p>
            <strong>Prova exibida:</strong> consulta administrativa a <code>GET /api/welcome-kit</code>,
            via owner de contas existente. {consultaCatalogoFresca && conexoes.data
              ? `Medida às ${new Date(conexoes.data.medidoEm).toLocaleTimeString("pt-BR")}.`
              : "Sem consulta fresca confirmada."}
          </p>
          <p><strong>Fonte:</strong> {conexoes.data?.fonte ?? "Hub CentralDark · não confirmado"}</p>
          <p>
            <strong>Limite da prova:</strong> o estado do catálogo não comprova que o processo
            <code> 127.0.0.1:8098 </code> esteja ativo, nem valida a API administrativa Tailscale.
            Cada serviço tem sua própria medição.
          </p>
        </div>
      </article>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sinais.map((s) => (
          <Signal key={s.label} {...s} />
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
