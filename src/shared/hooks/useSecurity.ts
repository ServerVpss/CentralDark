import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTelegramBots } from "@/shared/hooks/telegram";
import { useBotSecuritySettings } from "@/shared/hooks/telegram/useBotSecuritySettings";

export interface SecurityStats {
  linksBlocked: number;
  spamRemoved: number;
  floodBlocked: number;
  protectionRate: number;
}

export interface BlockedMessage {
  id: string;
  message_text: string | null;
  blocked_reason: string | null;
  from_username: string | null;
  from_first_name: string | null;
  created_at: string;
  chat_type: string | null;
}

export function useSecurity() {
  const { bots, loading: botsLoading } = useTelegramBots();
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [stats, setStats] = useState<SecurityStats>({
    linksBlocked: 0,
    spamRemoved: 0,
    floodBlocked: 0,
    protectionRate: 0,
  });
  const [blockedMessages, setBlockedMessages] = useState<BlockedMessage[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const {
    settings: securitySettings,
    loading: settingsLoading,
    updateSettings,
  } = useBotSecuritySettings(selectedBotId);

  // Auto-select first bot
  useEffect(() => {
    if (bots.length > 0 && !selectedBotId) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!selectedBotId) return;
    setStatsLoading(true);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: analyticsData } = await supabase
        .from("bot_analytics")
        .select("links_blocked, spam_detected, blocked_messages, messages_received")
        .eq("bot_id", selectedBotId)
        .gte("date", today.toISOString().split("T")[0]);

      const linksBlocked = analyticsData?.reduce(
        (acc, item) => acc + (item.links_blocked || 0),
        0
      ) || 0;

      const spamRemoved = analyticsData?.reduce(
        (acc, item) => acc + (item.spam_detected || 0),
        0
      ) || 0;

      const blockedMessagesCount = analyticsData?.reduce(
        (acc, item) => acc + (item.blocked_messages || 0),
        0
      ) || 0;

      const messagesReceived = analyticsData?.reduce(
        (acc, item) => acc + (item.messages_received || 0),
        0
      ) || 0;

      const totalActions = messagesReceived + blockedMessagesCount;
      const protectionRate = totalActions > 0
        ? (blockedMessagesCount / totalActions) * 100
        : 0;

      setStats({
        linksBlocked,
        spamRemoved,
        floodBlocked: blockedMessagesCount - linksBlocked - spamRemoved,
        protectionRate: Math.min(protectionRate, 100),
      });
    } catch (error) {
      console.error("Error fetching security stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedBotId]);

  // Fetch blocked messages history
  const fetchBlockedHistory = useCallback(async () => {
    if (!selectedBotId) return;
    setHistoryLoading(true);

    try {
      const { data, error } = await supabase
        .from("telegram_messages")
        .select("id, message_text, blocked_reason, from_username, from_first_name, created_at, chat_type")
        .eq("bot_id", selectedBotId)
        .eq("is_blocked", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setBlockedMessages(data || []);
    } catch (error) {
      console.error("Error fetching blocked messages:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedBotId]);

  useEffect(() => {
    if (selectedBotId) {
      fetchStats();
      fetchBlockedHistory();
    }
  }, [selectedBotId, fetchStats, fetchBlockedHistory]);

  const saveSettings = async (updates: Record<string, unknown>) => {
    const success = await updateSettings(updates);
    if (success) {
      toast.success("Configurações salvas!");
    }
    return success;
  };

  return {
    bots,
    selectedBotId,
    setSelectedBotId,
    stats,
    statsLoading,
    securitySettings,
    settingsLoading,
    blockedMessages,
    historyLoading,
    saveSettings,
    refreshStats: fetchStats,
    refreshHistory: fetchBlockedHistory,
    isLoading: botsLoading || settingsLoading,
  };
}
