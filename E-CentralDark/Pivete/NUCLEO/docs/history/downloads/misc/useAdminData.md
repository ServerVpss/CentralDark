# OUTRO - useAdminData.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\src\shared\hooks\useAdminData.ts
**SHA:** 425bf21ec64d2ad3
**Timestamp:** 2026-08-28T02:55:36.991229
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

### Ouro Bruto (primeiros 5000 chars)
```
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/hub-client";
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
      const ba
```