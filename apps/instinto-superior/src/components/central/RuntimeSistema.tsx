import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Cpu, HeartPulse, MemoryStick } from "lucide-react";

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
