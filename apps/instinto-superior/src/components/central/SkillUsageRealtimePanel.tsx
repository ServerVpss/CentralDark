import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { summarizeSkillUsage } from "@/lib/skill-usage-realtime";

const QUERY_KEY = ["centraldark", "skills", "verified-usage-realtime"] as const;
const MAX_ROWS = 1000;
let channelSequence = 0;

type Snapshot = {
  access: "ADMIN" | "AUTH_REQUIRED";
  rows: unknown[];
  sampledAt: string;
  partial: boolean;
};

async function readSkillUsage(): Promise<Snapshot> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error("SESSAO_SUPABASE_INDISPONIVEL");
  const sampledAt = new Date().toISOString();
  const session = data.session;
  if (!session) return { access: "AUTH_REQUIRED", rows: [], sampledAt, partial: false };
  const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
    _user_id: session.user.id,
    _role: "admin",
  });
  if (roleError) throw new Error("ROLE_CHECK_FALHOU");
  if (isAdmin !== true) return { access: "AUTH_REQUIRED", rows: [], sampledAt, partial: false };

  // Reuse the original public.agent_events owner and its admin-only RLS.
  // No new table, no service key in the browser and no invented usage totals.
  const { data: events, error: queryError } = await supabase
    .from("agent_events" as never)
    .select("id,ts,area,acao,alvo,status,metadata")
    .eq("area", "skill-usage")
    .order("id", { ascending: false })
    .limit(MAX_ROWS);
  if (queryError) throw new Error("SKILL_EVENTS_QUERY_FALHOU");
  const rows: unknown[] = Array.isArray(events) ? events : [];
  return {
    access: "ADMIN",
    rows,
    sampledAt,
    partial: rows.length === MAX_ROWS,
  };
}

export function SkillUsageRealtimePanel() {
  const queryClient = useQueryClient();
  const [channelStatus, setChannelStatus] = useState("CONNECTING");
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: readSkillUsage,
    enabled: typeof window !== "undefined",
    retry: false,
    refetchInterval: 60_000, // reconciliation if a websocket event was missed
  });
  const authorized = query.data?.access === "ADMIN";
  useEffect(() => {
    if (!authorized) {
      setChannelStatus("AUTH_REQUIRED");
      return;
    }
    const channel = supabase
      .channel("centraldark-skill-usage-" + ++channelSequence)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_events",
          filter: "area=eq.skill-usage",
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
      )
      .subscribe((status) => setChannelStatus(status));
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authorized, queryClient]);

  const summary = summarizeSkillUsage(query.data?.rows ?? []);
  const live = authorized && channelStatus === "SUBSCRIBED";
  const total = summary.records.reduce((acc, skill) => acc + skill.executions, 0);
  const state = query.isError
    ? "SOURCE_ERROR"
    : !authorized
      ? "AUTH_REQUIRED"
      : live
        ? "STREAM_ON"
        : "POLLING_FALLBACK";

  return (
    <section
      aria-label="Uso de skills Supabase Realtime"
      className="mt-4 rounded-md border border-border p-4"
      data-cd-skill-usage="supabase-agent-events"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h6 className="font-semibold">📊 Uso real de skills · Supabase Realtime</h6>
          <p className="mt-1 text-xs text-muted-foreground">
            Owner: agent_events · somente invocações com receipt_id e verified=true.
          </p>
        </div>
        <span role="status" className="font-mono text-xs">
          {state}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <span>
          Invocações com recibo:{" "}
          <strong>{authorized && !query.isError ? total : "NÃO MEDIDO"}</strong>
        </span>
        <span>
          Skills observadas:{" "}
          <strong>{authorized && !query.isError ? summary.records.length : "NÃO MEDIDO"}</strong>
        </span>
        <button
          type="button"
          className="rounded border border-border px-3 py-1"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          {query.isFetching ? "Lendo…" : "Remedir"}
        </button>
      </div>
      {query.isError && (
        <p className="mt-2 text-xs text-amber-500">
          {query.error instanceof Error ? query.error.message : "FONTE_INDISPONIVEL"}
        </p>
      )}
      {!authorized && !query.isError && (
        <p className="mt-2 text-xs text-muted-foreground">
          Aguardando sessão Supabase com permissão de administrador.
        </p>
      )}
      {authorized && !query.isError && summary.records.length === 0 && (
        <p className="mt-2 text-xs">
          Nenhuma invocação real de skill registrada nesta fonte. Catálogo e carregamento não contam
          como uso.
        </p>
      )}
      {authorized && summary.records.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-2">
                  Skill
                </th>
                <th scope="col" className="p-2">
                  Usos
                </th>
                <th scope="col" className="p-2">
                  PASS
                </th>
                <th scope="col" className="p-2">
                  FAIL
                </th>
                <th scope="col" className="p-2">
                  BLOCKED
                </th>
                <th scope="col" className="p-2">
                  Último evento
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.records.map((row) => (
                <tr key={row.skill} className="border-b border-border/50">
                  <td className="p-2 font-mono">{row.skill}</td>
                  <td className="p-2">{row.executions}</td>
                  <td className="p-2">{row.pass}</td>
                  <td className="p-2">{row.fail}</td>
                  <td className="p-2">{row.blocked}</td>
                  <td className="p-2">{new Date(row.lastSeen).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {authorized && summary.invalid > 0 && (
        <p className="mt-2 text-xs text-amber-500">
          {summary.invalid} evento(s) ignorado(s): contrato de prova incompleto.
        </p>
      )}
      {authorized && summary.repeated > 0 && (
        <p className="mt-2 text-xs text-amber-500">
          {summary.repeated} recibo(s) duplicado(s) ignorado(s).
        </p>
      )}
      {query.data?.partial && (
        <p className="mt-2 text-xs text-amber-500">
          PARTIAL: apenas as {MAX_ROWS} linhas mais recentes; não declarar total histórico.
        </p>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        STREAM_ON indica conexão Supabase Realtime, não prova de execução. Os resultados refletem recibos declarados pelo owner e exigem contraprova independente. INSERT atualiza por
        assinatura; reconciliação a cada 60s. Fonte: agent_events/skill-usage.
        {query.data?.sampledAt
          ? " Medido: " + new Date(query.data.sampledAt).toLocaleString("pt-BR")
          : ""}
      </p>
    </section>
  );
}
