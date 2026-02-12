import { Bot, TrendingUp, Zap, Plus } from "lucide-react";
import { BotStatusCard } from "./BotStatusCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Bot {
  id: string;
  name: string;
  bot_username: string | null;
  health_status: string | null;
  is_active: boolean | null;
}

interface BotsSectionProps {
  bots: Bot[];
  onToggleActive?: (botId: string, newState: boolean) => void;
}

export function BotsSection({ bots, onToggleActive }: BotsSectionProps) {
  const navigate = useNavigate();
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (bots.length === 0) return;

    const fetchCounts = async () => {
      // Fetch message totals from bot_analytics
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

      // Fetch active user counts from telegram_subscriptions
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
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
            <Bot className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Seus Bots</h2>
            <p className="text-xs text-muted-foreground">{bots.length} bot(s) configurado(s)</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-1.5 text-xs h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => navigate("/bots")}
        >
          Ver todos
          <TrendingUp className="h-3 w-3" />
        </Button>
      </div>

      {/* Bots Grid or Empty State */}
      {bots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-8 text-center">
          <div className="relative mx-auto mb-4 w-fit">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-amber-600/10 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/20">
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Nenhum bot configurado</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px] mx-auto">
            Adicione seu primeiro bot do Telegram para gerenciar assinaturas e consultas
          </p>
          <Button
            className="gap-2 bg-gradient-to-r from-primary to-amber-600 hover:opacity-90 shadow-lg shadow-primary/25"
            onClick={() => navigate("/bots")}
          >
            <Plus className="h-4 w-4" />
            Adicionar Bot
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bots.slice(0, 3).map((bot, index) => (
            <div key={bot.id} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <BotStatusCard
                botId={bot.id}
                name={bot.name}
                username={bot.bot_username || "Não sincronizado"}
                status={bot.health_status === "online" ? "online" : "offline"}
                messages={messageCounts[bot.id] || 0}
                users={userCounts[bot.id] || 0}
                isActive={bot.is_active ?? false}
                onToggleActive={onToggleActive}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
