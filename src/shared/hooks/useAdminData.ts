import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/shared/auth/AuthProvider";
import type { TelegramBot } from "@/shared/hooks/telegram/types";

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
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  // Carrega dados essenciais rapidamente e libera a UI
  const fetchFastData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user) return;

    try {
      if (!opts?.silent) setLoading(true);
      setError(null);

      // Dados essenciais em paralelo
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
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true })
          .limit(50),
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
          .gte("date", new Date().toISOString().split("T")[0])
          .limit(100),
      ]);

      if (!mountedRef.current) return;

      const botsData = (botsResult.data || []) as TelegramBot[];
      setBots(botsData);

      const plansData = (plansResult.data || []) as SubscriptionPlan[];
      setPlans(plansData);

      const messagesReceived = (analyticsResult.data || []).reduce(
        (acc, a) => acc + (a.messages_received || 0),
        0
      );

      const botsOnline = botsData.filter((b) => b.health_status === "online").length;

      setStats((prev) => ({
        ...prev,
        botsOnline,
        queriesTotal: queryCountResult.count || 0,
        queriesToday: queryTodayCountResult.count || 0,
        messagesReceived,
      }));
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      clearSafetyTimer();
    }
  }, [user, clearSafetyTimer]);

  // Carrega assinaturas em segundo plano (pode ser pesado)
  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;

    try {
      // Resumo rápido via RPC se existir; senão pagina com limite razoável
      let allSubs: TelegramSubscription[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      const maxBatches = 50; // limite de segurança: 50k registros
      let batches = 0;

      while (hasMore && batches < maxBatches) {
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
          batches++;
        } else {
          hasMore = false;
        }
        if (!mountedRef.current) return;
      }

      if (!mountedRef.current) return;

      setSubscriptions(allSubs);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const activeSubscribers = allSubs.filter(
        (s) => new Date(s.expires_at) >= now && s.status === "active"
      ).length;

      const monthlyRevenue = allSubs
        .filter((s) => new Date(s.created_at) >= monthStart)
        .reduce((acc, s) => acc + Number(s.value || 0), 0);

      const totalRevenue = allSubs.reduce((acc, s) => acc + Number(s.value || 0), 0);

      setStats((prev) => ({
        ...prev,
        totalSubscribers: allSubs.length,
        activeSubscribers,
        monthlyRevenue,
        totalRevenue,
      }));
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    }
  }, [user]);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user) return;

    // Timer de segurança: mesmo que algo trave, a UI não fica presa no loading
    clearSafetyTimer();
    safetyTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, 8000);

    await fetchFastData(opts);
    // Subscriptions rodam em background sem travar o loading
    fetchSubscriptions();
  }, [user, fetchFastData, fetchSubscriptions, clearSafetyTimer]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
      clearSafetyTimer();
    };
  }, [fetchData, clearSafetyTimer]);

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

