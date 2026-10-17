import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Eye, Github, House, Monitor, RefreshCw, RotateCcw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lerEstadoCentralDark, type Estado, type EstadoCentralDark } from "@/lib/cockpit.functions";

type Luz = "verde" | "amarela" | "vermelha";
const CORES: Record<Luz, string> = {
  verde: "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,.65)]",
  amarela: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,.55)]",
  vermelha: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.65)]",
};
function luz(estado: Estado): Luz {
  if (estado === "PASS") return "verde";
  if (estado === "FAIL" || estado === "BLOCKED") return "vermelha";
  return "amarela";
}
function etiqueta(estado: Estado) {
  if (estado === "PASS") return "OPERACIONAL";
  if (estado === "FAIL" || estado === "BLOCKED") return "INDISPONÍVEL";
  return estado === "AUTH_REQUIRED" ? "AUTORIZAÇÃO" : "NÃO COMPROVADO";
}
function LuzViva({ estado, nome, rotulo }: { estado: Estado; nome: string; rotulo?: string }) {
  const cor = luz(estado);
  return (
    <span className="inline-flex items-center gap-2" aria-label={`${nome}: ${rotulo ?? etiqueta(estado)}`}>
      <span className={`size-3 shrink-0 rounded-full ${estado === "RUNNING" ? "motion-safe:animate-pulse" : ""} ${CORES[cor]}`} aria-hidden="true" />
      <span className="font-mono text-[10px]">{rotulo ?? etiqueta(estado)}</span>
    </span>
  );
}
function DataHora({ iso }: { iso: string | null | undefined }) {
  if (!iso) return <>SEM MEDIÇÃO</>;
  const n = Date.parse(iso);
  return <>{Number.isFinite(n) ? new Date(n).toLocaleString("pt-BR", { timeZone: "America/Bahia" }) : "DATA INVÁLIDA"}</>;
}


/**
 * #OBSERVACOES#
 * @owner apps/instinto-superior/src/components/central/StatusPanel.tsx
 * @doc_ref apps/instinto-superior/README.md
 * @last_updated 2026-10-17
 * Frente = sensor CURRENT, verso = último PASS observado neste navegador.
 * Histórico local não é selo canônico, não autentica CI/deploy e não reaproveita
 * um HTTP 200 para outros escopos. Nunca transformar offline em FAIL do site.
 */
type ChaveSinal = "casa" | "main" | "vps" | "api";
type RegistroVerde = { at: string; detalhe: string; escopo: string; origem: string };
type HistoricoSinais = Partial<Record<ChaveSinal, RegistroVerde>>;
const CHAVES: ChaveSinal[] = ["casa", "main", "vps", "api"];
const HISTORICO_LOCAL_KEY = "centraldark.status-panel.ultimo-pass.v1";
const SHA_RE = /^[0-9a-f]{40}$/i;

function lerHistoricoLocal(): HistoricoSinais {
  try {
    const raw = window.localStorage.getItem(HISTORICO_LOCAL_KEY);
    if (!raw || raw.length > 4_096) return {};
    const valor: unknown = JSON.parse(raw);
    if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {};
    const mapa = valor as Record<string, unknown>;
    const out: HistoricoSinais = {};
    for (const chave of CHAVES) {
      const r = mapa[chave];
      if (!r || typeof r !== "object" || Array.isArray(r)) continue;
      const dado = r as Record<string, unknown>;
      if (typeof dado.at !== "string" || !Number.isFinite(Date.parse(dado.at)) ||
          Date.parse(dado.at) > Date.now() + 60_000 ||
          typeof dado.detalhe !== "string" || dado.detalhe.length > 140 ||
          typeof dado.escopo !== "string" || dado.escopo.length > 90 ||
          typeof dado.origem !== "string" || dado.origem.length > 120) continue;
      out[chave] = {
        at: dado.at, detalhe: dado.detalhe,
        escopo: dado.escopo, origem: dado.origem,
      };
    }
    return out;
  } catch { return {}; }
}

function novasProvasVerdes(d: EstadoCentralDark, iso: string): HistoricoSinais {
  const proven: HistoricoSinais = {};
  // A sonda local do site só roda quando a função server-side vive no Windows.
  if (d.casaSite === "PASS" && d.casaSiteHttp === 200) {
    proven.casa = {
      at: iso, detalhe: "Página local respondeu HTTP 200",
      escopo: "SITE LOCAL · HTTP, sem prova de login",
      origem: "Sensor HTTP no Windows",
    };
  } else if (d.casaPeerOnline === true && d.casaPeerMedidoEm) {
    proven.casa = {
      at: d.casaPeerMedidoEm,
      detalhe: "Dispositivo Casa estava conectado à malha",
      escopo: "TAILSCALE · não comprova site local",
      origem: "Sensor Tailscale do servidor",
    };
  }
  if (d.github === "PASS" && d.mainSha && SHA_RE.test(d.mainSha)) {
    proven.main = {
      at: iso, detalhe: "HEAD " + d.mainSha.slice(0, 12),
      escopo: "GITHUB MAIN · leitura do commit",
      origem: "GitHub API no servidor",
    };
  }
  if (d.deploy === "PASS" && d.mainSha && d.vpsSha &&
      SHA_RE.test(d.mainSha) && d.mainSha === d.vpsSha) {
    proven.vps = {
      at: iso, detalhe: "HEAD Main = VPS " + d.vpsSha.slice(0, 12),
      escopo: "IGUALDADE DE SHA · não comprova serviço",
      origem: "Comparação GitHub/Live Fabric",
    };
  }
  if (d.apiHealth === "PASS" && d.apiHealthHttp === 200) {
    proven.api = {
      at: d.apiHealthMedidoEm || iso,
      detalhe: "GET /health → HTTP 200 + resposta identificada",
      escopo: "APENAS ROTA /health · não comprova todas as funções",
      origem: "Sensor API CentralDark do servidor",
    };
  }
  return proven;
}

type SinalVisivel = {
  chave: ChaveSinal;
  nome: string; estado: Estado; rotulo: string; detalhe: string;
  origem: string; gatilho: string; offline: boolean; icon: typeof House;
};

function CartaoDuplaFace({
  sinal, anterior, virado, alternar,
}: {
  sinal: SinalVisivel;
  anterior?: RegistroVerde;
  virado: boolean;
  alternar: () => void;
}) {
  const Icon = sinal.icon;
  const cor = sinal.offline
    ? "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,.4)]"
    : CORES[luz(sinal.estado)];
  return (
    <div className="[perspective:1100px]">
      <button
        type="button"
        data-cd-flow={"instinto.StatusPanel.flip-" + sinal.chave}
        aria-pressed={virado}
        aria-label={sinal.nome + " · agora " + sinal.rotulo + " · " +
          (virado ? "voltar ao estado atual" : "virar para última medição positiva")}
        onClick={alternar}
        className="relative block h-44 w-full cursor-pointer rounded-xl text-left outline-none
                   motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out
                   focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
                   focus-visible:ring-offset-background"
        style={{
          transformStyle: "preserve-3d",
          transform: virado ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <span
          aria-hidden={virado}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden
                     rounded-xl border border-border/80 p-3 shadow-lg"
          style={{
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            background: "linear-gradient(132deg, var(--surface) 2%, color-mix(in oklab, var(--surface) 86%, var(--gold)) 46%, var(--surface) 96%)",
          }}
        >
          <span className="flex items-start justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="size-4 shrink-0 text-gold" aria-hidden="true" />
              <strong className="text-xs leading-snug">{sinal.nome}</strong>
            </span>
            <span className="whitespace-nowrap font-mono text-[9px] text-muted-foreground">AGORA</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className={"size-2.5 shrink-0 rounded-full " + cor} />
            <span className="font-mono text-[10px] font-semibold">{sinal.rotulo}</span>
          </span>
          <span className="break-words font-mono text-[10px] leading-relaxed text-muted-foreground">
            {sinal.detalhe}
          </span>
          <span className="flex items-center justify-end gap-1 text-[10px] text-gold">
            <RotateCcw className="size-3" aria-hidden="true" />
            Ver última prova
          </span>
        </span>
        <span
          aria-hidden={!virado}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden
                     rounded-xl border border-gold/40 p-3 shadow-lg"
          style={{
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(128deg, var(--surface) 0%, color-mix(in oklab, var(--surface) 80%, var(--neon-blue)) 48%, var(--surface) 96%)",
          }}
        >
          <span className="flex justify-between gap-2 text-[10px]">
            <strong className="text-gold">HISTÓRICO · NÃO É ESTADO ATUAL</strong>
            <span className="whitespace-nowrap text-muted-foreground">↩ AGORA</span>
          </span>
          {anterior ? (
            <span className="space-y-1">
              <span className="block text-[11px] font-semibold text-neon-green">ÚLTIMA MEDIÇÃO POSITIVA</span>
              <span className="block break-words font-mono text-[10px]">{anterior.detalhe}</span>
              <span className="block text-[9px] text-muted-foreground">{anterior.escopo}</span>
              <span className="block text-[9px] text-muted-foreground">
                <DataHora iso={anterior.at} /> · {anterior.origem}
              </span>
            </span>
          ) : (
            <span className="text-[11px] leading-relaxed text-muted-foreground">
              Ainda não há PASS registrado neste navegador. Um verde obtido
              noutro ambiente precisa de recibo para aparecer aqui.
            </span>
          )}
          <span className="flex items-center justify-between gap-2 text-[10px]">
            <span className="min-w-0 truncate text-muted-foreground">
              🧠 {sinal.gatilho}
            </span>
            <span className="shrink-0 text-gold">Voltar ↺</span>
          </span>
        </span>
      </button>
    </div>
  );
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
  const [historico, definirHistorico] = useState<HistoricoSinais>({});
  const [virados, definirVirados] = useState<Partial<Record<ChaveSinal, boolean>>>({});
  const jaVirouCasaOffline = useRef(false);
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
  const semSensorCasa = d?.screenpipeFonte?.includes("sensor remoto sem ponte") === true;
  const medidoEm = d?.atualizadoEm;

  // Histórico é apenas memória local de sinais positivos medidos, nunca status CURRENT.
  // LocalStorage não é receipt canônico, nem permite transformar histórico em PASS vivo.
  useEffect(() => {
    if (!hidratado) return;
    const guardado = lerHistoricoLocal();
    if (q.data && !q.isError && q.dataUpdatedAt > 0 &&
        Date.now() - q.dataUpdatedAt < 45_000) {
      const observados = novasProvasVerdes(q.data, new Date(q.dataUpdatedAt).toISOString());
      Object.assign(guardado, observados);
      try { window.localStorage.setItem(HISTORICO_LOCAL_KEY, JSON.stringify(guardado)); } catch {}
    }
    definirHistorico(guardado);
  }, [hidratado, q.data, q.dataUpdatedAt, q.isError]);

  // A Casa offline pode abrir o verso automaticamente SOMENTE se existe prova
  // histórica previamente medida; o verso continua declarando OFFLINE agora.
  useEffect(() => {
    if (d?.casaPeerOnline === false && d.casaPeerMedidoEm &&
        historico.casa && !jaVirouCasaOffline.current) {
      jaVirouCasaOffline.current = true;
      definirVirados(anterior => ({ ...anterior, casa: true }));
    }
  }, [d?.casaPeerOnline, d?.casaPeerMedidoEm, historico.casa]);

  const casaOffline = d?.casaPeerOnline === false && Boolean(d.casaPeerMedidoEm);
  const sinais: SinalVisivel[] = [
    {
      chave: "casa", nome: "Casa / Site local", icon: House,
      estado: d?.casaSite ?? unknown,
      offline: casaOffline,
      rotulo: casaOffline ? "OFFLINE NA MALHA"
        : d?.casaSite === "PASS" ? "SITE LOCAL RESPONDE"
        : d?.casaPeerOnline === true ? "CASA NA MALHA · SITE NÃO MEDIDO"
        : "CASA NÃO MEDIDA",
      detalhe: casaOffline ? "Tailscale: Casa desconectada · site local não consultado"
        : d?.casaSiteHttp != null ? "HTTP " + d.casaSiteHttp + " · medido no Windows"
        : d?.casaPeerOnline === true ? "Malha conectada; página local exige sonda própria"
        : "Sem medição autorizada da Casa neste host",
      origem: d?.casaPeerFonte ?? "Sensor Casa não consultado",
      gatilho: "Offline agora não apaga o passado."
    },
    {
      chave: "main", nome: "Main GitHub", icon: Github,
      estado: d?.github ?? unknown, offline: false,
      rotulo: d?.github === "PASS" && d.mainSha ? "HEAD LIDO"
        : d?.github === "AUTH_REQUIRED" ? "AUTORIZAÇÃO DO SENSOR"
        : d?.github === "FAIL" ? "CONSULTA FALHOU" : "HEAD NÃO MEDIDO",
      detalhe: d?.mainSha ? "Commit " + d.mainSha.slice(0, 12) : "SHA não medido nesta consulta",
      origem: d?.fonte ?? "GitHub API",
      gatilho: "SHA identifica o commit, não o deploy."
    },
    {
      chave: "vps", nome: "VPS · comparação SHA", icon: Server,
      estado: d?.deploy ?? unknown, offline: false,
      rotulo: d?.deploy === "PASS" ? "SHA COINCIDE"
        : d?.deploy === "FAIL" ? "SHA DIVERGENTE" : "SHA NÃO COMPARADO",
      detalhe: d?.vpsSha && d.mainSha
        ? "VPS " + d.vpsSha.slice(0, 12) + " · Main " + d.mainSha.slice(0, 12)
        : "SHA = versão do código; comparação não prova serviço",
      origem: "GitHub main + Live Fabric VPS",
      gatilho: "Mesmo SHA não prova serviço."
    },
    {
      chave: "api", nome: "API CentralDark", icon: Activity,
      estado: d?.apiHealth ?? unknown, offline: false,
      rotulo: d?.apiHealth === "PASS" ? "ROTA /HEALTH OK"
        : d?.apiHealth === "FAIL" ? "HEALTH FALHOU" : "HEALTH NÃO COMPROVADO",
      detalhe: "HTTP " + (d?.apiHealthHttp ?? "?") + " · /health · não atesta tudo",
      origem: d?.apiHealthFonte ?? "API CentralDark",
      gatilho: "HTTP 200 não atesta tudo."
    },
  ];

  const modulos = [
    {
      nome: "Screenpipe", estado: screen, icon: Eye,
      subtitulo: "Saúde da Casa · medição no próprio host Windows",
      origem: d?.screenpipeFonte ?? "Sensor não carregado",
      linhas: d?.screenpipeEvents ?? ["Aguardando leitura real do servidor"],
      nota: semSensorCasa
        ? "O teste local da Casa não é invalidado por outra máquina. Falta transportar o recibo de saúde da Casa pelo owner remoto autenticado."
        : "Assinatura real do Screenpipe; capturas/OCR e stream bruto não são publicados.",
    },
    {
      nome: "Desktop Commander", estado: remote, icon: Monitor, subtitulo: "Ponte remota · Casa SEGREDO / VPS",
      origem: d?.desktopFonte ?? "Recibo remoto ainda não consumido por este servidor",
      linhas: [
        `STATUS DO ADAPTER DO COCKPIT: ${remote}`,
        "Casa: Device ready / Channel subscribed foram vistos em recibo externo.",
        "A conexão do Desktop Commander continua separada do consumidor do Cockpit.",
      ],
      nota: "A prova no terminal da Casa é preservada. O status ONLINE automático depende de ler esse recibo pelo MCP existente.",
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
      <p className="text-[10px] text-muted-foreground">
        Toque nos cartões para virar: frente = medição atual · verso = última medição positiva
        guardada neste navegador. Histórico não substitui sensor nem recebe selo de deploy.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sinais.map((s) => (
          <CartaoDuplaFace
            key={s.chave}
            sinal={s}
            anterior={historico[s.chave]}
            virado={Boolean(virados[s.chave])}
            alternar={() => definirVirados(anterior => ({
              ...anterior, [s.chave]: !anterior[s.chave],
            }))}
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modulos.map((m) => {
          const Icon = m.icon;
          return (
            <article key={m.nome} className="rounded-xl border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2"><Icon className="size-6 text-neon-blue" /><div><h4 className="font-semibold">{m.nome}</h4><p className="text-[11px] text-muted-foreground">{m.subtitulo}</p></div></div>
                <LuzViva estado={m.estado} nome={m.nome}
                  rotulo={m.nome === "Screenpipe" && semSensorCasa ? "CASA NÃO CONSULTADA"
                    : m.nome === "Desktop Commander" && m.estado === "UNKNOWN" ? "ADAPTER PENDENTE"
                    : undefined} />
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
