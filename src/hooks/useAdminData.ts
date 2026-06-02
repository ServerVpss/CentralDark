import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import type { TelegramBot } from "@/hooks/telegram/types";

// Re-export for backwards compatibility
export type { TelegramBot };

export interface TelegramSubscription {
  id: string;
  telegram_user_id: number;
  bot_id: string | null;
  plan_id: string | null;
  plan_code: string;
  plan_name: string;
  plan_days: number;
  value: number;
  txid: string | null;
  status: string | null;
  started_at: string;
  expires_at: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  title: string;
  description: string | null;
  price: number;
  days: number;
  is_active: boolean;
  is_popular: boolean;
  features: string[];
  max_bots: number | null;
  max_messages_per_day: number | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  totalRevenue: number;
  queriesTotal: number;
  queriesToday: number;
  messagesReceived: number;
  botsOnline: number;
}

export interface AdminData {
  bot: TelegramBot | null;
  bots: TelegramBot[];
  subscriptions: TelegramSubscription[];
  plans: SubscriptionPlan[];
  stats: AdminStats;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminData(): AdminData {
  const { user } = useAuthContext();
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [subscriptions, setSubscriptions] = useState<TelegramSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    queriesTotal: 0,
    queriesToday: 0,
    messagesReceived: 0,
    botsOnline: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user) return;

    try {
      if (!opts?.silent) setLoading(true);
      setError(null);


      // Fetch all data in parallel - use count for queries, paginate large tables
      const [
        botsResult,
        plansResult,
        queryCountResult,
        queryTodayCountResult,
        analyticsResult,
      ] = await Promise.all([
        supabase
          .from("telegram_bots")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true }),
        supabase
          .from("query_history")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("query_history")
          .select("*", { count: "exact", head: true })
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()),
        supabase
          .from("bot_analytics")
          .select("messages_received, date")
          .gte("date", new Date().toISOString().split("T")[0]),
      ]);

      // Fetch all subscriptions with pagination to bypass 1000 limit
      let allSubs: TelegramSubscription[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from("telegram_subscriptions")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);
        if (error) throw error;
        if (data && data.length > 0) {
          allSubs = allSubs.concat(data as TelegramSubscription[]);
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      // Set bots
      const botsData = (botsResult.data || []) as TelegramBot[];
      setBots(botsData);

      // Set subscriptions (already fetched with pagination above)
      setSubscriptions(allSubs);

      // Set plans
      const plansData = (plansResult.data || []) as SubscriptionPlan[];
      setPlans(plansData);

      // Calculate stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const activeSubscribers = allSubs.filter(
        (s) => new Date(s.expires_at) >= now && s.status === "active"
      ).length;

      const monthlyRevenue = allSubs
        .filter((s) => new Date(s.created_at) >= monthStart)
        .reduce((acc, s) => acc + Number(s.value || 0), 0);

      const totalRevenue = allSubs.reduce((acc, s) => acc + Number(s.value || 0), 0);

      const messagesReceived = (analyticsResult.data || []).reduce(
        (acc, a) => acc + (a.messages_received || 0),
        0
      );

      const botsOnline = botsData.filter((b) => b.health_status === "online").length;

      setStats({
        totalSubscribers: allSubs.length,
        activeSubscribers,
        monthlyRevenue,
        totalRevenue,
        queriesTotal: queryCountResult.count || 0,
        queriesToday: queryTodayCountResult.count || 0,
        messagesReceived,
        botsOnline,
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions (debounced para evitar refetch a cada consulta no Telegram)
  useEffect(() => {
    if (!user) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchData({ silent: true }), 1500);
    };

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_subscriptions" },
        scheduleRefetch
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_bots" },
        scheduleRefetch
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscription_plans" },
        scheduleRefetch
      )
      // Removido listener em `query_history`: cada consulta no Telegram disparava
      // um INSERT que recarregava toda a dashboard. O contador "Consultas hoje"
      // é atualizado no próximo refetch agendado por outras mudanças ou polling.
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  return {
    bot: bots[0] || null,
    bots,
    subscriptions,
    plans,
    stats,
    loading,
    error,
    refresh: fetchData,
  };
}
