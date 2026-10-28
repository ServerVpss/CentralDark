import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Cpu, HardDrive, HeartPulse, MemoryStick, Monitor, Activity, Download } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { MapaOwners } from "@/components/central/MapaOwners";
import { lerMaquinaViva, type GpuCasa } from "@/lib/maquina.functions";
import type { EstadoCentralDark } from "@/lib/cockpit.functions";
import { FERIDA_MCP } from "@/data/painel-unico";

function Barra({ valor }: { valor: number | null }) {
  return (
    <div
      className="mt-3 h-2 w-full overflow-hidden rounded bg-muted"
      role="progressbar"
      aria-valuenow={valor ?? undefined}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-neon-green transition-all" style={{ width: `${valor ?? 0}%` }} />
    </div>
  );
}

function gib(bytes: number | null | undefined) {
  return bytes == null || !Number.isFinite(bytes)
    ? "UNKNOWN"
    : `${(bytes / (1024 ** 3)).toFixed(2).replace(".", ",")} GiB`;
}

// #OBSERVACOES# @owner=apps/instinto-superior/src/components/central/RuntimeSistema.tsx @doc_ref=docs/HUD/README.md @last_updated=2026-10-27T14:36:38.462Z
// Reutiliza a leitura autenticada da maquina (5s). Design de métricas inspirado na organização do Adrenalin, sem copiar ativos AMD nem alterar hardware.
type RadeonAmostra = {
  data: string;
  gpu: number | null;
  temperatura: number | null;
  cpu: number | null;
  fps: number | null;
  memoriaGpu: number | null;
};
function MiniGrafico({ amostras, campo }: { amostras: RadeonAmostra[]; campo: keyof Omit<RadeonAmostra, "data"> }) {
  const validos = amostras.map((a) => a[campo]).filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  if (validos.length < 2) return <span className="text-[11px] text-zinc-500">Histórico aguardando duas leituras</span>;
  const min = Math.min(...validos), max = Math.max(...validos), faixa = Math.max(1, max - min);
  const pontos = validos.map((n, i) => `${(i * 180) / Math.max(1, validos.length - 1)},${46 - ((n - min) / faixa) * 41}`).join(" ");
  return (
    <svg viewBox="0 0 180 50" aria-label={`Histórico das últimas ${validos.length} leituras de ${campo}`} className="h-12 w-full" role="img">
      <polyline points={pontos} fill="none" stroke="#fa315c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PainelRadeonCasa({ gpu }: { gpu: GpuCasa | undefined }) {
  const vivo = gpu?.estado === "LIVE";
  const sensores = vivo ? gpu.sensores : [];
  const sensor = (nome: string) => sensores.find((s) => s.nome === nome) ?? null;
  const numero = (nome: string) => {
    const s = sensor(nome);
    return s ? `${s.valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${s.unidade}` : "N/A";
  };
  const [historico, setHistorico] = useState<RadeonAmostra[]>([]);
  const [gravando, setGravando] = useState(false);
  const [registro, setRegistro] = useState<RadeonAmostra[]>([]);
  const [aba, setAba] = useState<"metricas" | "rastreamento" | "configuracoes">("metricas");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  useEffect(() => {
    if (!vivo || !gpu.atualizadoEm) return;
    const valor = (nome: string) => gpu.sensores.find((s) => s.nome === nome)?.valor ?? null;
    const leitura: RadeonAmostra = {
      data: gpu.atualizadoEm, gpu: valor("GPU usage"), temperatura: valor("GPU temperature"),
      cpu: valor("CPU usage"), fps: valor("Framerate"), memoriaGpu: valor("Memory usage"),
    };
    setHistorico((atual) => atual.at(-1)?.data === leitura.data ? atual : [...atual, leitura].slice(-180));
    if (gravando) setRegistro((atual) => atual.at(-1)?.data === leitura.data ? atual : [...atual, leitura].slice(-720));
  }, [gpu, vivo, gravando]);
  const exportar = () => {
    if (!registro.length) return;
    const linhas = ["UTC;GPU_uso_pct;GPU_temperatura_C;CPU_uso_pct;FPS;VRAM_MB",
      ...registro.map((a) => [a.data,a.gpu,a.temperatura,a.cpu,a.fps,a.memoriaGpu].map((v) => v ?? "").join(";"))];
    const blob = new Blob([linhas.join("\n")], { type:"text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "centraldark-radeon-casa.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  const cartoes = [
    {titulo:"FPS", chave:"Framerate", campo:"fps" as const, detalhe:"Taxa de quadros"},
    {titulo:"GPU", chave:"GPU usage", campo:"gpu" as const, detalhe:"Utilização da RX 580"},
    {titulo:"Temperatura GPU", chave:"GPU temperature", campo:"temperatura" as const, detalhe:"Temperatura da placa"},
    {titulo:"CPU", chave:"CPU usage", campo:"cpu" as const, detalhe:"Utilização da Casa"},
    {titulo:"Memória da GPU", chave:"Memory usage", campo:"memoriaGpu" as const, detalhe:"VRAM em uso"},
  ];
  const grupos: Array<{titulo:string;nomes:string[]}> = [
    {titulo:"FPS",nomes:["Framerate","Frametime","Framerate Min","Framerate Avg","Framerate Max","Framerate 1% Low","Framerate 0.1% Low"]},
    {titulo:"GPU",nomes:["GPU usage","GPU temperature","Core clock","Power","Fan speed","Fan tachometer"]},
    {titulo:"Memória da GPU",nomes:["Memory usage","Memory clock"]},
    {titulo:"CPU",nomes:["CPU usage","CPU temperature","CPU clock","CPU power"]},
    {titulo:"Memória do sistema",nomes:["RAM usage"]},
  ];
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-700 bg-[#161618] text-zinc-100" aria-label="Rastreamento Radeon RX 580 da Casa">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-700 bg-[#202023] px-5 py-4">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-400">CentralDark-OS · Casa SEGREDO</p>
          <h4 className="mt-1 flex items-center gap-2 text-xl font-semibold"><Activity className="size-5 text-[#fa315c]"/> Radeon RX 580 · Desempenho</h4>
          <p className="mt-1 text-xs text-zinc-400">Dados reais do MSI Afterburner · somente leitura · atualização do cockpit a cada 5 s</p>
        </div>
        <span className={`rounded border px-3 py-1 font-mono text-xs ${vivo ? "border-emerald-500 text-emerald-400" : "border-amber-600 text-amber-300"}`}>
          {vivo ? `● LIVE · ${sensores.length}/${gpu.anunciados ?? "?"} sensores` : `○ ${gpu?.estado ?? "UNKNOWN"}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-0 border-b border-zinc-700 px-5" role="tablist" aria-label="Seções do monitor Radeon">
        {([{id:"metricas",titulo:"Métricas"},{id:"rastreamento",titulo:"Rastreamento"},{id:"configuracoes",titulo:"Configurações"}] as const).map((t) =>
          <button key={t.id} role="tab" aria-selected={aba===t.id} onClick={() => setAba(t.id)}
            className={`border-b-[3px] px-4 py-3 text-sm ${aba===t.id ? "border-[#fa315c] font-semibold text-white" : "border-transparent text-zinc-400 hover:text-white"}`}>{t.titulo}</button>)}
      </div>
      {aba==="metricas" && <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {cartoes.map((c) => (
          <article key={c.titulo} className="rounded border border-zinc-700 bg-[#242426] p-4">
            <h5 className="text-sm font-semibold">{c.titulo}</h5>
            <p className="mt-1 text-xs text-zinc-400">{c.detalhe}</p>
            <div className="mt-3 flex items-center gap-3"><span className="whitespace-nowrap text-2xl text-white">{numero(c.chave)}</span>
              <div className="min-w-0 flex-1"><MiniGrafico amostras={historico} campo={c.campo}/></div>
            </div>
          </article>
        ))}
        <article className="rounded border border-zinc-700 bg-[#242426] p-4">
          <h5 className="text-sm font-semibold">Estado da fonte</h5>
          <p className="mt-3 font-mono text-sm text-zinc-300">{gpu?.motivo ?? (vivo ? "MAHMSharedMemory · leitura atual" : "Aguardando coletor")}</p>
          <p className="mt-2 text-xs text-zinc-400">Amostra: {gpu?.atualizadoEm ? new Date(gpu.atualizadoEm).toLocaleString("pt-BR") : "UNKNOWN"} · idade: {gpu?.idadeSeg ?? "?"} s</p>
          <p className="mt-2 text-xs text-zinc-400">Histórico no painel: {historico.length} amostras. Sem persistência automática.</p>
        </article>
      </div>}
      {aba==="rastreamento" && <div className="flex flex-wrap items-center gap-3 p-5">
        <button type="button" disabled={!vivo && !gravando} onClick={() => { if (!gravando) setRegistro([]); setGravando(!gravando); }}
          className="rounded bg-[#ed1748] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{gravando ? "Parar de registrar" : "Começar a registrar"}</button>
        <button type="button" disabled={!registro.length} onClick={exportar}
          className="flex items-center gap-2 rounded border border-zinc-500 px-4 py-2 text-sm disabled:opacity-50"><Download className="size-4"/> Exportar CSV ({registro.length})</button>
        <p className="w-full text-xs text-zinc-400">Registro nesta aba somente enquanto o navegador está aberto. Para diagnóstico após reinício, usar o log persistido pelo Adrenalin.</p>
      </div>}
      {aba==="configuracoes" && <div className="space-y-2 p-5 text-sm text-zinc-300">
        <p>Fonte: <strong>MSI Afterburner / MAHMSharedMemory</strong> (read-only). Coletor existente da Casa: ciclo de 10 s.</p>
        <p>O painel consulta a leitura autenticada a cada 5 s. Aceleração, potência, voltagem e ventoinhas <strong>não são alteradas</strong>.</p>
        <p>Overlay do Adrenalin e amostragem nativa continuam configurados no software AMD; este painel não simula controles que não possui.</p>
      </div>}
      <div className="border-t border-zinc-700 p-5">
        <button type="button" className="text-sm text-zinc-300 hover:text-white" onClick={() => setMostrarTodos((v) => !v)}>
          {mostrarTodos ? "▾ Ocultar sensores" : "▸ Mostrar todos os sensores reais"} ({sensores.length})
        </button>
        {mostrarTodos && <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {grupos.map((g) => (
            <div key={g.titulo} className="rounded border border-zinc-700 bg-[#242426] p-3">
              <h5 className="mb-3 border-b border-zinc-600 pb-2 font-semibold text-[#ff426a]">{g.titulo}</h5>
              {g.nomes.map((nome) => <p key={nome} className="flex justify-between gap-3 py-1 text-xs">
                <span className="text-zinc-400">{nome}</span><strong className="text-right font-mono">{numero(nome)}</strong></p>)}
            </div>
          ))}
          <div className="rounded border border-zinc-700 bg-[#242426] p-3">
            <h5 className="mb-3 border-b border-zinc-600 pb-2 font-semibold text-[#ff426a]">Outros sensores</h5>
            {sensores.filter((s) => !grupos.some((g) => g.nomes.includes(s.nome))).map((s, i) => (
              <p key={`${s.nome}-${i}`} className="flex justify-between gap-2 py-1 text-xs">
                <span className="truncate text-zinc-400">{s.nome}</span><strong className="font-mono">{s.valor.toLocaleString("pt-BR", {maximumFractionDigits:1})} {s.unidade}</strong>
              </p>
            ))}
          </div>
        </div>}
      </div>
    </section>
  );
}

export function RuntimeSistema({ estado }: { estado: EstadoCentralDark | undefined }) {
  const ler = useServerFn(lerMaquinaViva);
  const maquina = useQuery({
    queryKey: ["centraldark", "maquina-viva"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      return ler({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
    },
    refetchInterval: 5_000,
    retry: false,
  });
  const m = maquina.data;
  const estadoHeart: EstadoOperacional = maquina.isPending
    ? "RUNNING"
    : !m
      ? "UNKNOWN"
      : m.frescor.fresco === true && m.heartbeat.estado === "PASS"
        ? "PASS"
        : m.heartbeat.estado === "FAIL"
          ? "FAIL"
          : "UNKNOWN";

  return (
    <section aria-labelledby="runtime-titulo">
      <p className="font-mono text-[10px] tracking-[0.2em] text-neon-green uppercase">
        Máquina viva · atualização 5s
      </p>
      <h3 id="runtime-titulo" className="mt-3 text-3xl font-semibold">
        Runtime / Capabilities
      </h3>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        CPU e pulsação da VPS lidas no servidor do cockpit. Campo que a fonte não entrega fica
        UNKNOWN; nada é estimado.
      </p>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5">
          <Cpu className="size-5 text-neon-blue" />
          <h4 className="mt-3 font-semibold">CPU da VPS</h4>
          <p className="mt-2 font-mono text-2xl">
            {m?.cpu.percentual != null ? `${m.cpu.percentual}%` : "UNKNOWN"}
          </p>
          <Barra valor={m?.cpu.percentual ?? null} />
          <p className="mt-3 text-xs text-muted-foreground">
            {m?.cpu.chave
              ? `Campo medido: ${m.cpu.chave}`
              : "A fonte ainda não expõe CPU no heartbeat/health."}
          </p>
        </article>
        <article className="panel p-5">
          <MemoryStick className="size-5 text-neon-purple" />
          <h4 className="mt-3 font-semibold">Memória</h4>
          <p className="mt-2 font-mono text-2xl">
            {m?.memoria.percentual != null ? `${m.memoria.percentual}%` : "UNKNOWN"}
          </p>
          <Barra valor={m?.memoria.percentual ?? null} />
          <p className="mt-3 text-xs text-muted-foreground">
            {m?.carga ? `Carga: ${m.carga.join(" · ")}` : "Carga média não informada."}
          </p>
        </article>
        <BlocoEstado
          titulo="One Heart · heartbeat"
          estado={estadoHeart}
          codigo={
            m?.heartbeat.http
              ? `HTTP ${m.heartbeat.http}`
              : (m?.heartbeat.erro ?? "Aguardando medição")
          }
          detalhe={
            m?.frescor.idadeSeg != null
              ? `Pulso do owner há ${m.frescor.idadeSeg}s (limite 15s).`
              : "Sem horário medido pelo owner: a hora da consulta não prova pulsação."
          }
          icone={<HeartPulse className="size-5" />}
        />
        <BlocoEstado
          titulo="API /health"
          estado={(m?.health.estado ?? "UNKNOWN") as EstadoOperacional}
          codigo={m?.health.http ? `HTTP ${m.health.http}` : (m?.health.erro ?? "Sem resposta")}
          detalhe={m ? `Fonte: ${m.fonte}` : "Aguardando medição."}
          icone={<HeartPulse className="size-5" />}
        />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="panel p-5" aria-label="Espaço medido do servidor do cockpit">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 font-semibold">
              <HardDrive className="size-5 text-neon-blue" />
              {m?.discoServidor.hostVpsConfirmado ? "💾 Disco da VPS" : "💾 Disco do servidor SSR"}
            </h4>
            <span className="font-mono text-[10px] text-muted-foreground">
              {m?.discoServidor.estado === "PASS" ? "MEDIDO" : "UNKNOWN"}
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl">
            {gib(m?.discoServidor.disponivelBytes)} livres
          </p>
          <Barra valor={m?.discoServidor.percentualUsado ?? null} />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-muted-foreground">Capacidade</dt>
              <dd className="font-mono">{gib(m?.discoServidor.totalBytes)}</dd></div>
            <div><dt className="text-muted-foreground">Ocupado</dt>
              <dd className="font-mono">{gib(m?.discoServidor.usadoBytes)}</dd></div>
            <div><dt className="text-muted-foreground">Disponível para serviço</dt>
              <dd className="font-mono">{gib(m?.discoServidor.disponivelBytes)}</dd></div>
            <div><dt className="text-muted-foreground">Reservado ao filesystem</dt>
              <dd className="font-mono">{gib(m?.discoServidor.reservadoBytes)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Fonte: statfs("/") no processo autenticado do cockpit · montagem /.
            {m?.discoServidor.hostVpsConfirmado
              ? " Host da VPS identificado."
              : " Ainda não há prova de que este processo SSR esteja na VPS."}
            {m?.discoServidor.erro ? ` ${m.discoServidor.erro}.` : ""}
            {" "}Nenhuma limpeza é executada por este painel.
          </p>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            Medição: {m?.discoServidor.medidoEm ?? "UNKNOWN"}
          </p>
        </article>
        <article className="panel p-5" aria-label="Sensores da Casa e convergência com HUD">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 font-semibold">
              <Monitor className="size-5 text-neon-purple" />
              🎮 Casa · GPU e sensores
            </h4>
            <span className="font-mono text-[10px] text-muted-foreground">{m?.gpuCasa?.estado ?? "UNKNOWN"}</span>
          </div>
          <p className="mt-3 text-sm">
            HUD canônico: Radeon RX 580 · {m?.gpuCasa?.estado === "LIVE" ? `${m.gpuCasa.sensores.length}/${m.gpuCasa.anunciados ?? "?"} sensores atuais` : "coleção histórica de sensores; LIVE não confirmado"}.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            A leitura autenticada consulta o arquivo local do coletor existente, somente no servidor da Casa.
            {" "}Quando a fonte vence ou o cockpit executa fora da Casa, todas as métricas viram UNKNOWN.
            {" "}Motivo: {m?.gpuCasa?.motivo ?? "nenhum"}. Nenhum controle da GPU é alterado.
          </p>
          <a href="https://github.com/ServerVpss/CentralDark/blob/main/docs/HUD/HUD.html"
            target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-neon-blue underline">
            Consultar o mesmo HUD.html canônico ↗
          </a>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            CONVERGÊNCIA: {m?.gpuCasa?.estado === "LIVE" ? "SENSOR FRESCO E AUTENTICADO" : "AGUARDANDO MEDIÇÃO LOCAL"}.
          </p>
        </article>
      </div>

      <PainelRadeonCasa gpu={m?.gpuCasa} />

      <details className="panel mt-6 p-5" aria-label="Analytics de memória">
        <summary className="cursor-pointer font-semibold">🧠 Analytics de memória</summary>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Memória da VPS</p>
            <p className="mt-1 font-mono text-xl">
              {m?.memoria.percentual != null ? `${m.memoria.percentual}%` : "UNKNOWN"}
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              Fonte: lerMaquinaViva · {m ? "atualiza a cada 5s" : "UNKNOWN"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Memória física da Casa (Windows)</p>
            <p className="mt-1 font-mono text-xl">SEM_FONTE</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              Sensor da Casa não autorizado neste owner. Nenhum número foi estimado.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Processos CentralDark (PID)</p>
            <p className="mt-1 font-mono text-xl">SEM_FONTE</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              Sem coletor autorizado. Consumo não é atribuído sem PID comprovado.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Histórico, gráfico, pico e média aguardam amostragem autorizada. Somente leitura: nada é encerrado por este painel.
        </p>
      </details>

      {maquina.isError ? (
        <p className="mt-4 text-xs text-destructive">
          A leitura da máquina foi negada ou falhou; o painel não assume estado.
        </p>
      ) : null}

      <article className="panel mt-8 p-5">
        <h4 className="font-semibold">MCP · ferida do entrypoint OAuth</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{FERIDA_MCP.resumo}</p>
        <p className="mt-3 font-mono text-[10px] text-gold">{FERIDA_MCP.causa}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FERIDA_MCP.rotas.map((rota) => (
            <li key={rota} className="rounded border border-border px-2 py-1 font-mono text-[10px]">
              {rota}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">{FERIDA_MCP.acao}</p>
        <p className="mt-2 text-xs text-muted-foreground">{FERIDA_MCP.regra}</p>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          ESTADO ATUAL: {FERIDA_MCP.estado} · aguardando revalidação do unit e do :9100
        </p>
      </article>

      <MapaOwners />
      <p className="mt-6 font-mono text-[10px] text-muted-foreground">
        Código oficial: {estado?.sha?.slice(0, 12) ?? "UNKNOWN"}
      </p>
    </section>
  );
}
