import { Bot, MoreVertical, Power, Settings, Users, MessageSquare, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BotStatusCardProps {
  name: string;
  username: string;
  status: "online" | "offline" | "error";
  messages: number;
  users: number;
  botId?: string;
  isActive?: boolean;
  onToggleActive?: (botId: string, newState: boolean) => void;
}

export function BotStatusCard({ name, username, status, messages, users, botId, isActive = true, onToggleActive }: BotStatusCardProps) {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (botId) {
      navigate(`/bots/${botId}/settings`);
    } else {
      navigate('/bots');
    }
  };

  const handleTogglePower = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!botId) return;

    setIsToggling(true);
    try {
      const newState = !isActive;
      
      const { error } = await supabase
        .from("telegram_bots")
        .update({ is_active: newState })
        .eq("id", botId);

      if (error) throw error;

      toast.success(newState ? "Bot ativado com sucesso!" : "Bot desativado com sucesso!");
      
      if (onToggleActive) {
        onToggleActive(botId, newState);
      }
    } catch (err) {
      console.error("Error toggling bot:", err);
      toast.error("Erro ao alterar status do bot");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
      style={{
        background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
      }}
      onClick={() => botId && navigate(`/bots/${botId}/settings`)}
    >
      {/* Decorative gradient */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/5 blur-2xl transition-all duration-500 group-hover:from-cyan-500/20 group-hover:to-blue-500/10" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2",
                status === "online" && "border-background bg-gradient-to-br from-emerald-400 to-green-500 animate-ping",
                status === "offline" && "border-background bg-gradient-to-br from-slate-400 to-slate-500",
                status === "error" && "border-background bg-gradient-to-br from-rose-400 to-red-500 shadow-rose-500/50"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              @{username}
              <ExternalLink className="h-3 w-3" />
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border/50" style={{
            background: "linear-gradient(145deg, hsl(220 20% 10%), hsl(220 20% 8%))",
          }}>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleConfigure}>
              <Settings className="h-4 w-4" />
              Configurar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn(
                "gap-2 cursor-pointer",
                isActive ? "text-destructive focus:text-destructive" : "text-success focus:text-success"
              )}
              onClick={handleTogglePower}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              {isActive ? "Desligar" : "Ligar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border border-white/5" style={{
          background: "linear-gradient(135deg, hsl(220 20% 10%), hsl(220 20% 8%))",
        }}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
            <p className="text-xs text-muted-foreground">Mensagens</p>
          </div>
          <p className="text-lg font-bold text-foreground">{messages.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-3 border border-white/5" style={{
          background: "linear-gradient(135deg, hsl(220 20% 10%), hsl(220 20% 8%))",
        }}>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <p className="text-xs text-muted-foreground">Usuários</p>
          </div>
          <p className="text-lg font-bold text-foreground">{users.toLocaleString()}</p>
        </div>
      </div>

      {/* Status indicator line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300",
        status === "online" && "bg-gradient-to-r from-emerald-500 to-green-500",
        status === "offline" && "bg-gradient-to-r from-slate-500 to-slate-400 opacity-50",
        status === "error" && "bg-gradient-to-r from-rose-500 to-red-500"
      )} />
    </div>
  );
}