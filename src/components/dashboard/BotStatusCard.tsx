import { MessageSquare, Users, Settings, Bot as BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  photoUrl?: string | null;
  onToggleActive?: (botId: string, newState: boolean) => void;
}

export function BotStatusCard({ botId, name, username, status, messages, users, photoUrl }: BotStatusCardProps) {
  const navigate = useNavigate();
  const initial = (name?.[0] || "B").toUpperCase();

  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-9 w-9 border border-border/40">
            {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {photoUrl ? initial : <BotIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">@{username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
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
