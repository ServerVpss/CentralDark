import { Bot, Plus } from "lucide-react";
import { BotStatusCard } from "./BotStatusCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BotData {
  id: string;
  name: string;
  bot_username: string | null;
  health_status: string | null;
  is_active: boolean | null;
  bot_photo_url?: string | null;
}

interface BotsSectionProps {
  bots: BotData[];
  onToggleActive?: (botId: string, newState: boolean) => void;
}

export function BotsSection({ bots, onToggleActive }: BotsSectionProps) {
  const navigate = useNavigate();
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (bots.length === 0) return;

    const fetchCounts = async () => {
      const { data: analyticsData } = await supabase
        .from("bot_analytics")
        .select("bot_id, messages_received");

      if (analyticsData) {
        const msgMap: Record<string, number> = {};
        for (const row of analyticsData) {
          if (row.bot_id) {
            msgMap[row.bot_id] = (msgMap[row.bot_id] || 0) + (row.messages_received || 0);
          }
        }
        setMessageCounts(msgMap);
      }

      const { data: subsData } = await supabase
        .from("telegram_subscriptions")
        .select("bot_id, telegram_user_id")
        .eq("status", "active");

      if (subsData) {
        const userMap: Record<string, Set<number>> = {};
        for (const row of subsData) {
          if (row.bot_id) {
            if (!userMap[row.bot_id]) userMap[row.bot_id] = new Set();
            userMap[row.bot_id].add(row.telegram_user_id);
          }
        }
        const countMap: Record<string, number> = {};
        for (const [botId, userSet] of Object.entries(userMap)) {
          countMap[botId] = userSet.size;
        }
        setUserCounts(countMap);
      }
    };

    fetchCounts();
  }, [bots]);

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Seus Bots</h3>
          <span className="text-xs text-muted-foreground">({bots.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={() => navigate("/bots")}
        >
          Ver todos
        </Button>
      </div>

      {bots.length === 0 ? (
        <div className="p-8 text-center">
          <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Nenhum bot configurado</p>
          <Button size="sm" onClick={() => navigate("/bots")} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Adicionar Bot
          </Button>
        </div>
      ) : (
        <div className="p-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {bots.slice(0, 3).map((bot) => (
            <BotStatusCard
              key={bot.id}
              botId={bot.id}
              name={bot.name}
              username={bot.bot_username || "Não sincronizado"}
              status={bot.health_status === "online" ? "online" : "offline"}
              messages={messageCounts[bot.id] || 0}
              users={userCounts[bot.id] || 0}
              isActive={bot.is_active ?? false}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
