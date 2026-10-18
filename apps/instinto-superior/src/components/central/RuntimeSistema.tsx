import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Cpu, HardDrive, HeartPulse, MemoryStick, Monitor } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { MapaOwners } from "@/components/central/MapaOwners";
import { lerMaquinaViva } from "@/lib/maquina.functions";
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
            <span className="font-mono text-[10px] text-muted-foreground">LIVE UNKNOWN</span>
          </div>
          <p className="mt-3 text-sm">
            HUD canônico: placa Radeon RX 580 e coleção de 51 sensores MSI Afterburner.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            A leitura local depende do arquivo vivo CENTRALDARK-AFTERBURNER-LIVE.js
            no Windows. O servidor do cockpit não recebe essa fonte; temperatura,
            carga da GPU e discos da Casa permanecem UNKNOWN aqui.
            Não apresentar números antigos do HUD como medição atual.
          </p>
          <a href="https://github.com/ServerVpss/CentralDark/blob/main/docs/HUD/HUD.html"
            target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-neon-blue underline">
            Consultar o mesmo HUD.html canônico ↗
          </a>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            CONVERGÊNCIA: REFERÊNCIA VINCULADA · TELEMETRIA CASA AINDA NÃO INTEGRADA.
          </p>
        </article>
      </div>

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
