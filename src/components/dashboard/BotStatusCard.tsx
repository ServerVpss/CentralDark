import { MessageSquare, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BotStatusCardProps {
  botId?: string;
  name: string;
  username: string;
  status: "online" | "offline" | "error";
  messages: number;
  users: number;
  isActive?: boolean;
  onToggleActive?: (botId: string, newState: boolean) => void;
}

export function BotStatusCard({ botId, name, username, status, messages, users }: BotStatusCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">@{username}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "h-2 w-2 rounded-full",
            status === "online" ? "bg-emerald-500" : "bg-muted-foreground/40"
          )} />
          <span className="text-[10px] text-muted-foreground capitalize">{status}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {messages.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {users}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => navigate(botId ? `/bots/${botId}/settings` : "/bots")}
      >
        <Settings className="h-3 w-3 mr-1" />
        Configurar
      </Button>
    </div>
  );
}
