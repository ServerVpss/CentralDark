// Feed unificado do Mega Painel — lê `notifications_log` do mesmo projeto Supabase do Cockpit.
// Adaptado de src/shared/hooks/useNotificationsLog.ts (TelePainel). RLS exige sessão
// autenticada com papel admin (has_role(auth.uid(),'admin')); por isso reaproveita o client
// já autenticado do Cockpit em vez de um client anônimo separado.
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
}

export type PeriodoFiltro = "1h" | "24h" | "7d";

const PERIODO_MS: Record<PeriodoFiltro, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

const MAX_FEED = 200;

function extrairMensagemErro(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e)
    return String((e as { message: unknown }).message);
  return String(e);
}

/** Estatísticas honestas: null enquanto não houver leitura real (nunca inventa contagem). */
export type StatsNotificacoes = {
  porTipo: Record<NotifyTipo, number>;
  total: number;
  sucessoPct: number;
} | null;

export function useNotificationsLog(periodo: PeriodoFiltro = "24h") {
  const [items, setItems] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);

  const sinceIso = useMemo(
    () => new Date(Date.now() - PERIODO_MS[periodo]).toISOString(),
    [periodo],
  );

  const buscar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      // `notifications_log` não está no Database gerado localmente (tabela existe no banco
      // real, mas o types.ts deste projeto não foi regenerado); cast pontual e documentado.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as unknown as { from: (t: string) => any })
        .from("notifications_log")
        .select("id, created_at, origem, tipo, titulo, mensagem")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(MAX_FEED);
      if (error) throw error;
      const linhas = (data ?? []) as unknown as NotificationLog[];
      setItems(linhas);
      if (linhas[0]) setLastEventAt(new Date(linhas[0].created_at));
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setLoading(false);
    }
  }, [sinceIso]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  useEffect(() => {
    const canal = supabase
      .channel("cockpit-notifications-log")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications_log" },
        (payload) => {
          const linha = payload.new as NotificationLog;
          setItems((prev) => [linha, ...prev].slice(0, MAX_FEED));
          setLastEventAt(new Date(linha.created_at));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const stats: StatsNotificacoes = useMemo(() => {
    if (erro) return null;
    const porTipo: Record<NotifyTipo, number> = {
      info: 0,
      sucesso: 0,
      aviso: 0,
      erro: 0,
      critico: 0,
    };
    let totalOk = 0;
    for (const item of items) {
      porTipo[item.tipo] = (porTipo[item.tipo] ?? 0) + 1;
      if (item.tipo !== "erro" && item.tipo !== "critico") totalOk++;
    }
    const total = items.length;
    return { porTipo, total, sucessoPct: total > 0 ? Math.round((totalOk / total) * 100) : 0 };
  }, [items, erro]);

  return { items, loading, erro, stats, lastEventAt, refresh: buscar };
}
