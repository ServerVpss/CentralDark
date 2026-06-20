import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: "payment" | "subscription" | "security" | "message" | "query" | "success" | "warning";
  title: string;
  description: string;
  time: string;
  createdAt: Date;
  data?: Record<string, unknown>;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

const READ_NOTIFICATIONS_KEY = "read_notifications";

function getReadNotifications(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

function saveReadNotifications(ids: Set<string>): void {
  try {
    // Keep only the last 100 to avoid localStorage bloat
    const arr = Array.from(ids).slice(-100);
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(arr));
  } catch {
    // Ignore storage errors
  }
}

export function useNotifications() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const fetchActivities = useCallback(async () => {
    try {
      // Buscar últimas 15 assinaturas
      const { data: subs, error: subsError } = await supabase
        .from("telegram_subscriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);

      if (subsError) {
        console.error("Erro ao buscar assinaturas:", subsError);
      }

      // Buscar últimas 10 consultas
      const { data: queries, error: queriesError } = await supabase
        .from("query_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (queriesError) {
        console.error("Erro ao buscar consultas:", queriesError);
      }

      // Buscar últimas mensagens bloqueadas (segurança)
      const { data: blockedMessages, error: blockedError } = await supabase
        .from("telegram_messages")
        .select("*")
        .eq("is_blocked", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (blockedError) {
        console.error("Erro ao buscar mensagens bloqueadas:", blockedError);
      }

      // Formatar assinaturas como atividades
      const subActivities: Activity[] = (subs || []).map((s) => ({
        id: `sub_${s.id}`,
        type: "payment" as const,
        title: "Nova Assinatura",
        description: `${s.plan_name} - R$ ${Number(s.value || 0).toFixed(2)}`,
        time: formatTimeAgo(s.created_at),
        createdAt: new Date(s.created_at),
        data: s as Record<string, unknown>,
      }));

      // Formatar consultas como atividades
      const queryActivities: Activity[] = (queries || []).map((q) => ({
        id: `query_${q.id}`,
        type: "query" as const,
        title: `Consulta ${(q.query_type || "").toUpperCase()}`,
        description: q.query_input?.substring(0, 50) + (q.query_input?.length > 50 ? "..." : ""),
        time: formatTimeAgo(q.created_at),
        createdAt: new Date(q.created_at),
      }));

      // Formatar mensagens bloqueadas como atividades de segurança
      const securityActivities: Activity[] = (blockedMessages || []).map((m) => ({
        id: `sec_${m.id}`,
        type: "security" as const,
        title: m.blocked_reason === "anti_link" ? "Link Bloqueado" : "Spam Detectado",
        description: `@${m.from_username || "usuário"} - ${m.blocked_reason}`,
        time: formatTimeAgo(m.created_at),
        createdAt: new Date(m.created_at),
      }));

      // Combinar e ordenar por data
      const allActivities = [...subActivities, ...queryActivities, ...securityActivities]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 15);

      setActivities(allActivities);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar notificação como lida
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      saveReadNotifications(newSet);
      return newSet;
    });
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const newSet = new Set(prev);
      activities.forEach((a) => newSet.add(a.id));
      saveReadNotifications(newSet);
      return newSet;
    });
  }, [activities]);

  // Notificações não lidas
  const unreadActivities = activities.filter((a) => !readIds.has(a.id));
  const unreadCount = unreadActivities.length;

  // Load read notifications on mount
  useEffect(() => {
    const stored = getReadNotifications();
    if (stored.size > 0) {
      setReadIds(stored);
    }
  }, []);

  // Buscar dados iniciais
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Realtime subscription para novas assinaturas e consultas
  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_subscriptions" },
        (payload) => {
          const newSub = payload.new as Record<string, unknown>;
          
          // Disparar toast de sucesso
          toast.success("💰 Nova Compra!", {
            description: `${newSub.plan_name} - R$ ${Number(newSub.value || 0).toFixed(2)}`,
            duration: 6000,
          });
          
          // Atualizar lista de atividades
          fetchActivities();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "query_history" },
        () => {
          // Atualizar lista silenciosamente (sem toast para consultas)
          fetchActivities();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_messages", filter: "is_blocked=eq.true" },
        (payload) => {
          const msg = payload.new as Record<string, unknown>;
          
          // Toast de aviso para mensagens bloqueadas
          toast.warning("🛡️ Segurança", {
            description: `Mensagem bloqueada: ${msg.blocked_reason}`,
            duration: 4000,
          });
          
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  return { 
    activities, 
    unreadActivities,
    unreadCount,
    loading, 
    refresh: fetchActivities,
    markAsRead,
    markAllAsRead,
    isRead: (id: string) => readIds.has(id),
  };
}
