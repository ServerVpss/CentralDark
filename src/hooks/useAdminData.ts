import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TelegramBot {
  id: string;
  name: string;
  token: string;
  bot_id: number | null;
  bot_username: string | null;
  is_active: boolean;
  health_status: string | null;
  webhook_active: boolean;
  webhook_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

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
  const { user } = useAuth();
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

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        botsResult,
        subscriptionsResult,
        plansResult,
        queryHistoryResult,
        analyticsResult,
      ] = await Promise.all([
        supabase
          .from("telegram_bots")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("telegram_subscriptions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true }),
        supabase
          .from("query_history")
          .select("created_at", { count: "exact" }),
        supabase
          .from("bot_analytics")
          .select("messages_received, date")
          .gte("date", new Date().toISOString().split("T")[0]),
      ]);

      // Set bots
      const botsData = (botsResult.data || []) as TelegramBot[];
      setBots(botsData);

      // Set subscriptions
      const subsData = (subscriptionsResult.data || []) as TelegramSubscription[];
      setSubscriptions(subsData);

      // Set plans
      const plansData = (plansResult.data || []) as SubscriptionPlan[];
      setPlans(plansData);

      // Calculate stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const activeSubscribers = subsData.filter(
        (s) => new Date(s.expires_at) >= now && s.status === "active"
      ).length;

      const monthlyRevenue = subsData
        .filter((s) => new Date(s.created_at) >= monthStart)
        .reduce((acc, s) => acc + Number(s.value || 0), 0);

      const totalRevenue = subsData.reduce((acc, s) => acc + Number(s.value || 0), 0);

      const queriesToday = (queryHistoryResult.data || []).filter(
        (q) => new Date(q.created_at) >= todayStart
      ).length;

      const messagesReceived = (analyticsResult.data || []).reduce(
        (acc, a) => acc + (a.messages_received || 0),
        0
      );

      const botsOnline = botsData.filter((b) => b.health_status === "online").length;

      setStats({
        totalSubscribers: subsData.length,
        activeSubscribers,
        monthlyRevenue,
        totalRevenue,
        queriesTotal: queryHistoryResult.count || 0,
        queriesToday,
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

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_subscriptions" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_bots" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscription_plans" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "query_history" },
        () => fetchData()
      )
      .subscribe();

    return () => {
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
