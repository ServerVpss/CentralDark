import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BotAnalytics {
  id: string;
  bot_id: string;
  date: string;
  messages_received: number;
  messages_sent: number;
  new_users: number;
  active_users: number;
  blocked_messages: number;
  spam_detected: number;
  links_blocked: number;
}

export interface AnalyticsSummary {
  totalMessages: number;
  totalUsers: number;
  blockedMessages: number;
  spamDetected: number;
  linksBlocked: number;
  dailyData: BotAnalytics[];
}

export function useBotAnalytics(botId?: string, days = 30) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalMessages: 0,
    totalUsers: 0,
    blockedMessages: 0,
    spamDetected: 0,
    linksBlocked: 0,
    dailyData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from("bot_analytics")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (botId) {
        query = query.eq("bot_id", botId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
        return;
      }

      const dailyData = data || [];

      // Calculate totals
      const summary = dailyData.reduce(
        (acc, day) => ({
          totalMessages: acc.totalMessages + (day.messages_received || 0),
          totalUsers: acc.totalUsers + (day.new_users || 0),
          blockedMessages: acc.blockedMessages + (day.blocked_messages || 0),
          spamDetected: acc.spamDetected + (day.spam_detected || 0),
          linksBlocked: acc.linksBlocked + (day.links_blocked || 0),
        }),
        {
          totalMessages: 0,
          totalUsers: 0,
          blockedMessages: 0,
          spamDetected: 0,
          linksBlocked: 0,
        }
      );

      setAnalytics({
        ...summary,
        dailyData,
      });
      setLoading(false);
    };

    fetchAnalytics();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("bot_analytics_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bot_analytics" },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [botId, days]);

  return { analytics, loading };
}

export function useRecentMessages(botId?: string, limit = 50) {
  const [messages, setMessages] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      let query = supabase
        .from("telegram_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (botId) {
        query = query.eq("bot_id", botId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("telegram_messages_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_messages" },
        (payload) => {
          if (!botId || payload.new.bot_id === botId) {
            setMessages((prev) => [payload.new, ...prev.slice(0, limit - 1)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [botId, limit]);

  return { messages, loading };
}
