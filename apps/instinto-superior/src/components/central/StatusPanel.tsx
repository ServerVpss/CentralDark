// #OBSERVACOES# @owner: instinto.status @doc_ref: README.md
// @last_updated: 2026-11-01T19:41:24.979255+00:00 @implementado: owner do site local independente do sistema operacional.
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Eye, Github, House, Monitor, Server, GitBranch, Cpu, Database, HeartPulse } from "lucide-react";
import { lerEstadoCentralDark, type Estado, type PortaCentralDark } from "@/lib/cockpit.functions";
import { SyncActionButton } from "@/components/central/SyncActionButton";
import { rotuloEstadoHumano } from "@/components/central/EstadoCentralDark";
import { useRelogioVivo } from "@/hooks/useRelogioVivo";

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
function etiqueta(estado: Estado, _nome = "") {
  return rotuloEstadoHumano(estado);
}
function classePulsoEstado(estado: Estado) {
  if (estado === "PASS") return "cd-port-dot--pass";
  if (estado === "FAIL" || estado === "BLOCKED") return "cd-port-dot--fail";
  return "cd-port-dot--unknown";
}
/** O pulso verde significa exclusivamente medição atual PASS, não prova histórica. */
function LuzViva({ estado, nome, fresco }: { estado: Estado; nome: string; fresco: boolean }) {
  const valido = fresco ? estado : "UNKNOWN";
  const cor = luz(valido);
  return (
    <span className="inline-flex items-center gap-2" aria-label={`${nome}: ${etiqueta(valido, nome)}`}>
      <span className={`size-3 shrink-0 rounded-full ${fresco && valido === "PASS" ? "animate-pulse motion-reduce:animate-none" : ""} ${CORES[cor]}`} aria-hidden="true" />
      <span className="font-mono text-[10px]">{etiqueta(valido, nome)}</span>
    </span>
  );
}
function SensorScreenpipe({ nome, estado, detalhe, rotulo }: { nome: string; estado: Estado; detalhe: string; rotulo?: string }) {
  const cor = luz(estado);
  const pulso = classePulsoEstado(estado);
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-black/20 px-2 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`size-2.5 shrink-0 rounded-full ${CORES[cor]} ${pulso}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[11px] font-medium">{nome}</p>
          <p className="truncate text-[10px] text-muted-foreground">{detalhe}</p>
        </div>
      </div>
      <span className="shrink-0 text-[10px]">{rotulo ?? (estado === "RUNNING" ? "Precisa de atenção" : estado === "UNKNOWN" ? "Ainda não medido" : etiqueta(estado, nome))}</span>
    </li>
  );
}
/**
 * Sonda da superfície ≠ prova de execução. A API pode responder com JSON
 * e ainda declarar NOT_REVALIDATED: mostramos conectividade verde somente
 * para a ROTA, com o aviso amarelo de execução explicitamente separado.
 * Nunca promove grafo/receipts do owner de RUNNING para PASS.
 */
function LuzProjecao({
  estado, nome, fresco, http, erro,
}: {
  estado: Estado; nome: string; fresco: boolean; http: number | null | undefined; erro: string | null | undefined;
}) {
  const rotaDisponivel = fresco && estado === "RUNNING" && http === 200
    && erro === "PROJECAO_LOCAL_SEM_CONTRAPROVA_DE_EXECUCAO";
  if (!rotaDisponivel) return <LuzViva estado={estado} nome={nome} fresco={fresco} />;
  return (
    <div className="space-y-1" aria-label={`${nome}: rota HTTP 200 revalidada na última consulta; execução sem contraprova`}>
      <span className="inline-flex items-center gap-2">
        <span className={`size-3 shrink-0 rounded-full ${CORES.verde}`} aria-hidden="true" />
        <span className="text-[11px] font-medium">Conexão disponível</span>
      </span>
      <p className="text-[11px] text-amber-400">Uso recente ainda não verificado</p>
    </div>
  );
}
function PortaViva({ porta }: { porta: PortaCentralDark }) {
  const cor = luz(porta.estado);
  const classe = classePulsoEstado(porta.estado);
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-black/20 px-2 py-2" data-cd-port={porta.id}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 shrink-0 rounded-full ${CORES[cor]} ${classe}`} aria-hidden="true" />
          <span className="font-mono text-[11px]">{porta.bind}</span>
          <span className="text-[10px] text-muted-foreground">{porta.transporte}</span>
        </div>
        <p className="truncate text-[10px] text-muted-foreground">{porta.origem} · {porta.processo} · PID {porta.pid ?? "não medido"}</p>
      </div>
      <span className="shrink-0 text-[10px]">{etiqueta(porta.estado, porta.bind)}</span>
    </li>
  );
}
/** Anexa o motivo real da sonda ao detalhe do card, só quando o estado não é PASS. */
function comMotivo(base: string, estado: Estado, motivo: string | null | undefined) {
  if (estado === "PASS" || !motivo) return base;
  return `${base} · MOTIVO: ${motivo.slice(0, 120)}`;
}
function DataHora({ iso }: { iso: string | null | undefined }) {
  if (!iso) return <>Sem leitura</>;
  const n = Date.parse(iso);
  return <>{Number.isFinite(n) ? new Date(n).toLocaleString("pt-BR", { timeZone: "America/Bahia" }) : "Data indisponível"}</>;
}
function linhaScreenpipeHumana(linha: string) {
  if (/^CAPTURA VISUAL: FRESH/.test(linha)) return "Telas sendo gravadas agora";
  if (/^CAPTURA VISUAL:/.test(linha)) return "Gravação das telas sem atualização recente";
  if (/^ÚLTIMO FRAME:/.test(linha)) return linha.replace("ÚLTIMO FRAME:", "Última imagem:");
  if (/^MONITORES DETECTADOS:/.test(linha)) return linha.replace("MONITORES DETECTADOS:", "Monitores encontrados:");
  if (/^FRAMES NO HISTÓRICO ATUAL:/.test(linha)) return linha.replace("FRAMES NO HISTÓRICO ATUAL:", "Imagens registradas nesta gravação:");
  if (/^FREQUÊNCIA MEDIDA:/.test(linha)) return linha.replace("FREQUÊNCIA MEDIDA:", "Ritmo de captura:");
  return linha;
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
  const [inventarioAberto, definirInventarioAberto] = useState(false);
  useEffect(() => { definirHidratado(true); }, []);
  const ler = useServerFn(lerEstadoCentralDark);
  const q = useQuery({
    queryKey: ["centraldark", "estado-vivo"],
    queryFn: () => ler(),
    refetchInterval: 15_000,
    retry: false,
    refetchOnWindowFocus: true,
  });
  const agora = useRelogioVivo();
  const fresco = hidratado && agora !== null && Boolean(q.data) && !q.isError && (agora - q.dataUpdatedAt < 45_000);
  const d = fresco ? q.data : null;
  const unknown: Estado = "UNKNOWN";
  const screen: Estado = d?.screenpipe ?? unknown;
  const remote: Estado = d?.desktop ?? unknown;
  const medidoEm = d?.atualizadoEm;
  const audioScreenpipe = d?.screenpipeAudioStatus?.toLowerCase() ?? null;
  const audioSemSinal = audioScreenpipe !== null && ["stale", "stalled", "unavailable", "no_input_device", "disabled", "no_audio"].includes(audioScreenpipe);
  const screenpipeVisualAtual = Boolean(d?.screenpipeEvents?.some((linha) => /^CAPTURA VISUAL: FRESH/.test(linha)));
  const screenpipeImagemAtual = Boolean(d?.screenpipeEvents?.some((linha) => /^ÚLTIMO FRAME:/.test(linha)));
  // d?.screenpipeDetail === "degraded" continua sendo uma degradação interna;
  // não rebaixa o estado principal quando 3030/health responde PASS.
  const screenpipeSaude: Estado = fresco && d?.screenpipeHttp === 200 ? "PASS" : screen;
  const sinais = [
    { nome: "Casa / Site local", estado: d?.casaSite ?? unknown, detalhe: d?.casaSiteFonte ?? "Casa · site local · fonte não medida", icon: House },
    { nome: "Código oficial", estado: d?.github ?? unknown, detalhe: d?.github === "PASS" && d.mainSha ? `${d.fonte} · main ${d.mainSha.slice(0, 8)}` : d?.fonte ?? "GitHub ainda não verificado", icon: Github },
    { nome: "API CentralDark", estado: d?.apiHealth ?? unknown, detalhe: d?.apiHealthFonte ?? "Host atual · API /health · fonte não medida", icon: Activity },
    { nome: "Grafo Vivo", estado: d?.grafoVivo ?? unknown, detalhe: d?.liveFabricFonte ?? "Host atual · Live Fabric · fonte não medida", icon: GitBranch },
    { nome: "Roteador", estado: d?.omniRouter ?? unknown, detalhe: "Host atual · Omni Router consultado agora.", icon: Cpu },
    { nome: "Sinal de atividade", estado: d?.heartbeat ?? unknown, detalhe: "Host atual · heartbeat consultado agora.", icon: HeartPulse },
    { nome: "Confirmações", estado: d?.receipts ?? unknown, detalhe: "Host atual · receipts consultados agora.", icon: Database },
  ];

  const rotas = [
    { id: "casa-site", owner: "Cockpit / host local", estado: d?.casaSite ?? unknown, fonte: d?.casaSiteFonte ?? "Casa/Site local · sem medição (padrão 8080)" },
    { id: "github-main", owner: "GitHub main", estado: d?.github ?? unknown, fonte: d?.fonte ?? "GitHub main · sem leitura atual" },
    { id: "vps-sha", owner: "Microdeploy VPS", estado: d?.deploy ?? unknown, fonte: "VPS SHA · comparação com main (não prova serviço)" },
    { id: "api-health", owner: "API CentralDark", estado: d?.apiHealth ?? unknown, fonte: "API /health · não prova todo o sistema" },
    { id: "screenpipe-casa", owner: "Screenpipe Casa", estado: d?.screenpipe ?? unknown, fonte: d?.screenpipeFonte ?? "Casa 3030/health" },
    { id: "screenpipe-vps", owner: "Screenpipe VPS", estado: d?.screenpipeVps ?? unknown, fonte: d?.screenpipeVpsFonte ?? "VPS 3030/health" },
    { id: "grafo-vivo", owner: "Live Fabric", estado: d?.grafoVivo ?? unknown, fonte: d?.liveFabricFonte ?? "API /api/live-fabric/graph" },
    { id: "omni-router", owner: "Omni Router", estado: d?.omniRouter ?? unknown, fonte: "API /api/omni/status · somente rota medida" },
    { id: "heartbeat", owner: "Omni Router · heartbeat local", estado: d?.heartbeat ?? unknown, fonte: "Omni Router /heartbeat · self=" + (d?.heartbeatSelf ?? "?") + " · nao prova invocacao" },
    { id: "receipts", owner: "Receipts Microdeploy", estado: d?.receipts ?? unknown, fonte: "API /api/microdeploy/receipts/index.json" },
  ] as const;
  const rotasComProblema = rotas.filter((rota) => rota.estado !== "PASS");

  const modulos = [
    {
      nome: "Screenpipe", estado: screen, icon: Eye, subtitulo: "Gravação de telas e áudio da Casa",
      origem: d?.screenpipeFonte ?? "Sensor não carregado",
      linhas: d?.screenpipeEvents ?? ["Aguardando leitura real do servidor"],
      nota: "As gravações ficam na Casa. Este cartão mostra somente situação, horário e quantidade.",
    },
    {
      nome: "CentralDark Commander", estado: remote, icon: Monitor, subtitulo: "Ponte local · Casa SEGREDO",
      origem: d?.desktopFonte ?? "Adapter da sessão não conectado ao site",
      linhas: [
        `STATUS: ${remote}`,
        `HEALTH: HTTP ${d?.commanderHttp ?? "?"}`,
        `MOTOR: ${d?.commanderEngine === true ? "conectado" : d?.commanderEngine === false ? "desconectado ou aguardando chamada" : "não medido"}`,
        `RECIBO AUTENTICADO: ${d?.commanderToolProof ? `${d.commanderToolProof.tool} (${d.commanderToolProof.kind}) às ${new Date(d.commanderToolProof.at).toLocaleTimeString("pt-BR")}` : "não medido ou fora da janela de 10 minutos"}`,
      ],
      nota: "Health identifica a ponte; somente uma chamada autenticada bem-sucedida comprova o motor.",
    },
  ];

  return (
    <section className="panel space-y-5 p-5" aria-label="Máquina de estados viva da CentralDark">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">🫀 Estado atual do sistema</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Verde: funcionando. Amarelo: precisa de atenção ou verificação. Vermelho: precisa corrigir.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center">
            <SyncActionButton
              data-cd-flow="instinto.StatusPanel.botao-01"
              label="Medir agora"
              onClick={() => void q.refetch()}
              isFetching={q.isFetching}
              autoSyncEnabled
              lastSuccessAt={fresco ? medidoEm : null}
              lastError={q.isError ? "falha de transporte no servidor" : null}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground" aria-label="Relógio vivo, atualiza a cada segundo">
              ⏱ {agora === null ? "--:--:--" : new Date(agora).toLocaleTimeString("pt-BR", { timeZone: "America/Bahia" })}
            </span>
            <span className="text-[11px] text-muted-foreground">Atualiza a cada 15 s</span>
          </div>
        </div>
      </header>
      <p className="font-mono text-[11px] text-muted-foreground" role="status" aria-live="polite">
        {fresco ? <>Última atualização: <DataHora iso={medidoEm} /></> : "Sem leitura recente · use Medir agora para verificar novamente"}
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
              <div className="mt-3">
                {s.nome === "Grafo Vivo" || s.nome === "Receipts" ? (
                  <LuzProjecao
                    estado={s.estado}
                    nome={s.nome}
                    fresco={fresco}
                    http={s.nome === "Grafo Vivo" ? d?.grafoHttp : d?.receiptsHttp}
                    erro={s.nome === "Grafo Vivo" ? d?.grafoErro : d?.receiptsErro}
                  />
                ) : <LuzViva estado={s.estado} nome={s.nome} fresco={fresco} />}
              </div>
              <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">{s.detalhe}</p>
            </article>
          );
        })}
      </div>
      <details className="rounded-md border border-border p-3 text-xs">
        <summary className="cursor-pointer font-medium">
          🧿 Rotas e alertas · {fresco ? rotasComProblema.length : rotas.length} sem prova completa
        </summary>
        <p className="mt-2 text-muted-foreground">
          Alertas deste painel usam o mesmo sensor da Casa/VPS. Histórico persistente usa a Central de Notificações (Supabase);
          esta leitura não grava eventos nem cria missões.
        </p>
        <ul className="mt-2 space-y-2">
          {rotas.map((rota) => (
            <li key={rota.id} className="rounded border border-border/70 p-2">
              <span className="font-mono">{rota.id}</span> · {fresco ? etiqueta(rota.estado, rota.owner) : "MEDIÇÃO EXPIRADA"}
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
                {m.nome === "CentralDark Commander" && fresco && d?.commanderHttp === 200 && d?.commanderEngine === true && remote === "RUNNING" ? (
                  <div className="space-y-1" aria-label="Commander: ponte conectada; execução autenticada não comprovada">
                    <span className="inline-flex items-center gap-2">
                      <span className={`size-3 shrink-0 rounded-full ${CORES.verde}`} aria-hidden="true" />
                      <span className="text-[11px] font-medium">Conectado</span>
                    </span>
                    <p className="text-[11px] text-muted-foreground">Pronto para receber uma ação quando necessário.</p>
                  </div>
                ) : m.nome === "Screenpipe" ? (
                  <LuzViva estado={screenpipeSaude} nome="Screenpipe" fresco={fresco} />
                ) : <LuzViva estado={m.estado} nome={m.nome} fresco={fresco} />}
              </div>
              <p className="mt-3 break-all font-mono text-[10px] text-muted-foreground">Fonte: {m.origem}</p>
              {m.nome === "CentralDark Commander" ? (
                <div className="mt-3 rounded-md border border-border/70 p-3" aria-label="Inventário de portas CentralDark">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">Portas e interfaces CentralDark</p>
                    <span className="text-[10px] text-muted-foreground">Casa Windows · openKylin</span>
                  </div>
                  <div className="mt-2 rounded-md border border-border/70 bg-black/20 p-2">
                    <p className="text-[10px] font-semibold">Leituras separadas</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Commander HTTP `9101/health` e MCP openKylin `8742/health` são rotas diferentes.
                      Uma rota amarela não rebaixa a outra.
                    </p>
                  </div>
                  <ul className="mt-2 space-y-2" aria-live="polite">
                    {(fresco ? d?.portas ?? [] : []).map((porta) => <PortaViva key={porta.id} porta={porta} />)}
                    {!fresco ? <li className="text-[10px] text-muted-foreground">Sem leitura recente · clique em Medir agora</li> : null}
                    {fresco && !(d?.portas?.length) ? <li className="text-[10px] text-amber-400">Nenhuma porta CentralDark foi confirmada nesta leitura.</li> : null}
                  </ul>
                  <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                    TCP LISTEN é separado de MCP stdio: stdio funciona sem abrir porta HTTP. Portas do sistema não são atribuídas ao CentralDark sem prova de processo.
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-md border border-border px-3 py-2 text-[11px] font-medium hover:border-neon-blue/70"
                    onClick={() => definirInventarioAberto((aberto) => !aberto)}
                    aria-expanded={inventarioAberto}
                  >
                    {inventarioAberto ? "Ocultar inventário total" : `Exibir inventário total de portas · ${(fresco ? d?.portasTotais?.length : 0) ?? 0}`}
                  </button>
                  {inventarioAberto ? (
                    <div className="mt-3 rounded-md border border-border/70 p-2" aria-label="Inventário total de portas openKylin">
                      <p className="mb-2 text-[10px] text-muted-foreground">Somente portas medidas agora · TCP e UDP · Casa Windows + openKylin</p>
                      <ul className="space-y-1">
                        {(fresco ? d?.portasTotais ?? [] : []).map((porta) => (
                          <li key={porta.id} className="flex items-center justify-between gap-2 font-mono text-[10px]">
                            <span><span className={`mr-2 inline-block size-2 rounded-full ${CORES[luz(porta.estado)]}`} aria-hidden="true" />{porta.protocolo} {porta.bind}</span>
                            <span className="text-muted-foreground">{porta.processo} · PID {porta.pid ?? "?"}</span>
                          </li>
                        ))}
                        {fresco && !(d?.portasTotais?.length) ? <li className="text-amber-400">Inventário total não medido.</li> : null}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {m.nome === "Screenpipe" ? (
                <div className="mt-3 rounded-md border border-border/70 p-3" aria-label="Screenpipe: capturas recentes e monitores">
                  <div className="mb-3">
                    <p className="text-xs font-semibold">Sensores Screenpipe · leitura separada</p>
                    <ul className="mt-2 space-y-2" aria-live="polite">
                      <SensorScreenpipe nome="Porta e health" estado={screenpipeSaude} detalhe="3030/health · processo Screenpipe medido na Forja/Casa" />
                      <SensorScreenpipe nome="Captura visual" estado={screenpipeVisualAtual ? "PASS" : fresco ? "RUNNING" : "UNKNOWN"} detalhe={screenpipeVisualAtual ? "telas gravando agora" : "sem frame visual fresco nesta leitura"} />
                      <SensorScreenpipe nome="Imagem / último frame" estado={screenpipeImagemAtual ? "PASS" : fresco ? "RUNNING" : "UNKNOWN"} detalhe={screenpipeImagemAtual ? "última imagem registrada" : "sem último frame confirmado"} />
                      <SensorScreenpipe nome="Áudio" estado={audioSemSinal ? "RUNNING" : fresco && d?.screenpipeAudioStatus ? "PASS" : "UNKNOWN"} detalhe={audioSemSinal ? "Nenhum sinal de áudio recente" : "Sinal de áudio detectado"} rotulo={audioSemSinal ? "Sem sinal de áudio" : undefined} />
                      <SensorScreenpipe nome="Vídeo" estado="UNKNOWN" detalhe="A câmera ou o vídeo ainda não foram medidos" rotulo="Ainda não medido" />
                      <SensorScreenpipe nome="Texto / OCR" estado="UNKNOWN" detalhe="A leitura de texto ainda não foi medida" rotulo="Ainda não medido" />
                    </ul>
                  </div>
                  <p className="text-xs font-semibold">Capturas recentes · Screenpipe Casa</p>
                  <ul className="mt-2 space-y-1 font-mono text-[11px]" aria-live="polite">
                    {(fresco ? d?.screenpipeEvents ?? [] : []).filter((linha) =>
                      /^(CAPTURA VISUAL|ÚLTIMO FRAME|MONITORES DETECTADOS|FRAMES NO HISTÓRICO ATUAL|FREQUÊNCIA MEDIDA):/.test(linha)
                    ).map((linha) => <li key={linha} className="break-words">{linhaScreenpipeHumana(linha)}</li>)}
                    {!fresco && <li>Sem leitura recente · clique em Medir agora</li>}
                  </ul>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Histórico e imagens: Screenpipe Desktop → Timeline. A gravação permanece local na Casa;
                    este card consulta só os metadados de /health e não publica capturas privadas.
                  </p>
                </div>
              ) : null}
              <details className="mt-3 rounded-md border border-border/70 bg-black/50 p-3" aria-label={`Detalhes técnicos do sensor ${m.nome}`}>
                <summary className="cursor-pointer text-xs font-medium text-neon-green">Ver detalhes técnicos</summary>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">Leitura: <DataHora iso={medidoEm} /></p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-[10px] text-foreground/90">
                  {m.linhas.map((linha, i) => <li key={i} className="break-all">{linha}</li>)}
                </ul>
              </details>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{m.nota}</p>
            </article>
          );
        })}
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">
        Este painel apenas consulta o estado. Ele não executa comandos por conta própria.
      </p>
    </section>
  );
}
export default StatusPanel;
