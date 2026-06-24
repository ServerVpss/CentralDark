// Hook do Mega Painel — feed unificado em tempo real.
// Lê só da tabela `notifications_log`. NÃO duplica o `useNotifications`
// (esse outro lê de telegram_subscriptions / query_history / telegram_messages).
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NotifyTipo = "info" | "sucesso" | "aviso" | "erro" | "critico";

export interface NotificationLog {
  id: string;
  created_at: string;
  origem: string;
  tipo: NotifyTipo;
  titulo: string;
  mensagem: string;
  metadata: Record<string, unknown> | null;
  telegram_message_id: number | null;
  telegram_chat_id: number | null;
  sent_ok: boolean;
  send_error: string | null;
  dedupe_hash: string | null;
}

export type PeriodoFiltro = "1h" | "24h" | "7d" | "30d";

const PERIODO_MS: Record<PeriodoFiltro, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const MAX_FEED = 200;

export function useNotificationsLog(opts?: {
  periodo?: PeriodoFiltro;
  origem?: string | null;
  tipo?: NotifyTipo | null;
}) {
  const periodo = opts?.periodo ?? "24h";
  const origem = opts?.origem ?? null;
  const tipo = opts?.tipo ?? null;

  const [items, setItems] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);

  const sinceIso = useMemo(
    () => new Date(Date.now() - PERIODO_MS[periodo]).toISOString(),
    [periodo],
  );

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase
      .from("notifications_log")
      .select("*")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(MAX_FEED);

    if (origem) q = q.eq("origem", origem);
    if (tipo) q = q.eq("tipo", tipo);

    const { data, error: err } = await q;
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setItems((data ?? []) as NotificationLog[]);
    if (data && data.length > 0) {
      setLastEventAt(new Date(data[0].created_at));
    }
    setLoading(false);
  }, [sinceIso, origem, tipo]);

  // Carrega inicial e quando filtros mudam
  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  // Realtime — INSERTs novos entram no topo
  useEffect(() => {
    const channel = supabase
      .channel("notifications-log-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications_log" },
        (payload) => {
          const row = payload.new as NotificationLog;
          // Aplica filtros client-side pra não estourar o feed
          if (origem && row.origem !== origem) return;
          if (tipo && row.tipo !== tipo) return;
          setItems((prev) => [row, ...prev].slice(0, MAX_FEED));
          setLastEventAt(new Date(row.created_at));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications_log" },
        (payload) => {
          const row = payload.new as NotificationLog;
          setItems((prev) =>
            prev.map((it) => (it.id === row.id ? { ...it, ...row } : it)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [origem, tipo]);

  // Estatísticas derivadas (para os cards do painel)
  const stats = useMemo(() => {
    const porTipo: Record<NotifyTipo, number> = {
      info: 0,
      sucesso: 0,
      aviso: 0,
      erro: 0,
      critico: 0,
    };
    const porOrigem = new Map<string, number>();
    let ultimoCritico: NotificationLog | null = null;
    let totalOk = 0;

    for (const it of items) {
      porTipo[it.tipo] = (porTipo[it.tipo] ?? 0) + 1;
      porOrigem.set(it.origem, (porOrigem.get(it.origem) ?? 0) + 1);
      if (it.tipo === "critico" && !ultimoCritico) ultimoCritico = it;
      if (it.sent_ok) totalOk++;
    }

    const topOrigens = Array.from(porOrigem.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = items.length;
    const sucessoPct = total > 0 ? Math.round((totalOk / total) * 100) : 0;

    return { porTipo, topOrigens, ultimoCritico, total, sucessoPct };
  }, [items]);

  return {
    items,
    loading,
    error,
    stats,
    lastEventAt,
    refresh: fetchInitial,
  };
}
