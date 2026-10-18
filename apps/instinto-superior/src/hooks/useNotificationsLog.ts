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
  metadata?: Record<string, unknown> | null;
}

export type PeriodoFiltro = "1h" | "24h" | "7d";

const PERIODO_MS: Record<PeriodoFiltro, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

const MAX_FEED = 200;
export type RealtimeEstado = "CONNECTING" | "LIVE" | "DISCONNECTED";

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
  const lastEventAt = items[0] ? new Date(items[0].created_at) : null;
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeEstado>("CONNECTING");

  // O recorte de tempo precisa avançar a cada consulta; sessões longas não
  // podem manter um "sinceIso" congelado desde a montagem do componente.
  const buscar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    setErro(null);
    const limiteMs = Date.now() - PERIODO_MS[periodo];
    const sinceIso = new Date(limiteMs).toISOString();
    try {
      // `notifications_log` não está no Database gerado localmente (tabela existe no banco
      // real, mas o types.ts deste projeto não foi regenerado); cast pontual e documentado.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as unknown as { from: (t: string) => any })
        .from("notifications_log")
        .select("id, created_at, origem, tipo, titulo, mensagem, metadata")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(MAX_FEED);
      if (error) throw error;
      const linhas = (data ?? []) as unknown as NotificationLog[];
      // Um INSERT via WebSocket pode chegar durante o SELECT. Mesclar por UUID
      // impede perder ou duplicar o receipt que acabou de chegar.
      setItems((anteriores) => {
        const porId = new Map<string, NotificationLog>();
        for (const linha of [...anteriores, ...linhas]) {
          if (Date.parse(linha.created_at) >= limiteMs) porId.set(linha.id, linha);
        }
        return [...porId.values()]
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
          .slice(0, MAX_FEED);
      });
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    void buscar();
    // Recuperação de eventos após queda/ausência de Realtime. É a mesma
    // consulta com RLS, não outro ledger, outro WebSocket ou novo executor.
    const intervalo = window.setInterval(() => void buscar(true), 20_000);
    return () => window.clearInterval(intervalo);
  }, [buscar]);

  useEffect(() => {
    const canal = supabase
      .channel("cockpit-notifications-log")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications_log" },
        (payload) => {
          const linha = payload.new as NotificationLog;
          if (!linha.id || Date.parse(linha.created_at) < Date.now() - PERIODO_MS[periodo]) return;
          setItems((prev) => [linha, ...prev.filter((item) => item.id !== linha.id)]
            .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
            .slice(0, MAX_FEED));
        },
      )
      .subscribe((status) => {
        // SUBSCRIBED prova conexão, não entrega E2E. O SELECT de reconciliação
        // é read-only e recupera eventos emitidos durante a desconexão.
        if (status === "SUBSCRIBED") void buscar(true);
        setRealtimeStatus(
          status === "SUBSCRIBED"
            ? "LIVE"
            : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED"
              ? "DISCONNECTED"
              : "CONNECTING",
        );
      });
    return () => {
      supabase.removeChannel(canal);
    };
  }, [periodo, buscar]);

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

  return { items, loading, erro, stats, lastEventAt, realtimeStatus, refresh: buscar };
}
