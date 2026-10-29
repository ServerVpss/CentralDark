/* #OBSERVACOES# | CENTRALDARK.SYNC_CENTER.FEED_VIVO_20261026
 * @owner: apps/instinto-superior/src/components/central/SyncCenter.tsx
 * @doc_ref: docs/ARQUITETURA/CENTRALDARK-CIRCUITO-VIVO-CONEXOES-20261026.md
 * @last_updated: 2026-10-26T10:00:00Z
 * @implementado: feed read-only de eventos reais de agentes e etapas de missao, com Supabase Realtime.
 * @pendente: CI, readback autenticado, deploy no mesmo SHA; nao atesta Screenpipe/SSH/execucao por si.
 * @next_cursor: contrastar RLS, publication, CI e duas origens do Cockpit.
 */
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type EventoFeed = {
  id: string;
  data: string;
  origem: "agent_events" | "hub_mission_events";
  titulo: string;
  detalhe: string;
  estado: string;
};
type ResultadoFeed = { autenticado: boolean; eventos: EventoFeed[] };
const FEED_KEY = ["centraldark", "sync-center", "feed-vivo"] as const;

function objeto(valor: unknown): valor is Record<string, unknown> {
  return !!valor && typeof valor === "object" && !Array.isArray(valor);
}
function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.slice(0, 180) : "";
}
async function lerFeedVivo(): Promise<ResultadoFeed> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw Error("SESSAO_INDISPONIVEL");
  if (!data.session?.access_token) return { autenticado: false, eventos: [] };
  const base = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const chave = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined;
  if (!base || !chave) throw Error("FONTE_SUPABASE_NAO_CONFIGURADA");
  // Guard adicional da UI: o painel administrativo nao lista eventos de missao
  // para outro usuario autenticado. O Supabase RLS segue autoritativo.
  const permissao = await fetch(base.replace(/\/$/, "") + "/rest/v1/rpc/has_role", {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: chave,
      Authorization: "Bearer " + data.session.access_token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ _user_id: data.session.user.id, _role: "admin" }),
  });
  if (!permissao.ok) throw Error("VERIFICACAO_ADMIN_HTTP_" + permissao.status);
  if (await permissao.json() !== true) return { autenticado: false, eventos: [] };
  const get = async (tabela: "agent_events" | "hub_mission_events", query: URLSearchParams) => {
    const response = await fetch(base.replace(/\/$/, "") + "/rest/v1/" + tabela + "?" + query.toString(), {
      cache: "no-store",
      headers: {
        apikey: chave,
        Authorization: "Bearer " + data.session.access_token,
        Accept: "application/json",
      },
    });
    if (!response.ok) throw Error("SUPABASE_FEED_" + tabela + "_HTTP_" + response.status);
    const raw: unknown = await response.json();
    if (!Array.isArray(raw)) throw Error("SUPABASE_FEED_FORMATO_INVALIDO");
    return raw.filter(objeto);
  };
  const [agentes, missoes] = await Promise.all([
    get("agent_events", new URLSearchParams({ select: "id,ts,area,acao,alvo,status", order: "ts.desc", limit: "12" })),
    get("hub_mission_events", new URLSearchParams({ select: "id,mission_id,type,status,message,created_at", order: "created_at.desc", limit: "12" })),
  ]);
  const eventos: EventoFeed[] = [
    ...agentes.map((e) => ({
      id: "agente-" + String(e['id']),
      data: texto(e['ts']),
      origem: "agent_events" as const,
      titulo: texto(e['area']) + " · " + texto(e['acao']),
      detalhe: texto(e['alvo']),
      estado: texto(e['status']),
    })),
    ...missoes.map((e) => ({
      id: "missao-" + String(e['id']),
      data: texto(e['created_at']),
      origem: "hub_mission_events" as const,
      titulo: "Missão " + texto(e['mission_id']).slice(0, 8) + " · " + texto(e['type']),
      detalhe: texto(e['message']),
      estado: texto(e['status']),
    })),
  ].filter((e) => Number.isFinite(Date.parse(e.data)))
    .sort((a, b) => Date.parse(b.data) - Date.parse(a.data))
    .slice(0, 16);
  return { autenticado: true, eventos };
}

export function FeedVivoCentralDark() {
  const queryClient = useQueryClient();
  const [canal, definirCanal] = useState("CONNECTING");
  const [novoEvento, definirNovoEvento] = useState(false);
  const consulta = useQuery({
    queryKey: FEED_KEY,
    queryFn: lerFeedVivo,
    refetchInterval: 60_000,
    retry: false,
    enabled: typeof window !== "undefined",
  });
  useEffect(() => {
    if (!consulta.data?.autenticado) {
      definirCanal("AUTH_REQUIRED");
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const channel = supabase.channel("centraldark-sync-feed-v1")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_events" }, () => {
        void queryClient.invalidateQueries({ queryKey: FEED_KEY });
        definirNovoEvento(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => definirNovoEvento(false), 2500);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "hub_mission_events" }, () => {
        void queryClient.invalidateQueries({ queryKey: FEED_KEY });
        definirNovoEvento(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => definirNovoEvento(false), 2500);
      })
      .subscribe((status) => definirCanal(status));
    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [consulta.data?.autenticado, queryClient]);

  const status = consulta.isError ? "UNKNOWN" :
    !consulta.data?.autenticado ? "AUTH_REQUIRED" :
    canal === "SUBSCRIBED" ? "STREAM_ON" : "POLLING_FALLBACK";
  const classe = novoEvento ? "bg-emerald-500 animate-pulse" :
    status === "STREAM_ON" ? "bg-emerald-500" : "bg-amber-500";

  return (
    <section aria-label="Feed Vivo CentralDark" data-cd-flow="instinto.SyncCenter.feed-vivo"
      className="mt-6 rounded-xl border border-border bg-muted/10 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neon-blue">🪬 Livro vivo · evidência real</p>
          <h3 className="mt-1 text-lg font-semibold">Feed de eventos e missões</h3>
        </div>
        <span role="status" className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-xs">
          <span aria-hidden="true" className={"inline-block size-2 rounded-full " + classe} />
          {status}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Supabase agent_events + hub_mission_events · assinaturas Realtime, leitura autenticada e reconciliação a cada 60s.
        Só aparece o que foi registrado. Sem evento, sem conquista inventada.
      </p>
      {consulta.isError ? <p className="mt-3 text-sm text-amber-500">{consulta.error instanceof Error ? consulta.error.message : "FONTE_INDISPONIVEL"}</p> : null}
      {!consulta.data?.autenticado ? <p className="mt-3 text-sm">Aguardando sessão autorizada.</p> : null}
      {consulta.data?.autenticado && consulta.data.eventos.length === 0
        ? <p className="mt-3 text-sm text-muted-foreground">Nenhum evento encontrado nesta janela de leitura.</p> : null}
      <ol aria-live="polite" className="mt-4 max-h-80 space-y-2 overflow-y-auto">
        {(consulta.data?.eventos ?? []).map((evento) => (
          <li key={evento.id} className="rounded-lg border border-border bg-background/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-xs">{evento.titulo}</strong>
              <span className="font-mono text-[10px] text-muted-foreground">{evento.estado || "UNKNOWN"}</span>
            </div>
            {evento.detalhe ? <p className="mt-1 text-xs text-muted-foreground">{evento.detalhe}</p> : null}
            <time dateTime={evento.data} className="mt-1 block text-[10px] text-muted-foreground">
              {new Date(evento.data).toLocaleString("pt-BR")} · {evento.origem}
            </time>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Indicador verde = canal Realtime conectado; pisca somente com INSERT observado.
        STREAM_ON não afirma execução, deploy ou sincronização de arquivos.
      </p>
    </section>
  );
}