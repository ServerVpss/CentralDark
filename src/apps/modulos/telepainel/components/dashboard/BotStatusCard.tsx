import { MessageSquare, Users, Settings, Bot as BotIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

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
    <div className="rounded-xl border border-border/40 bg-muted/20 p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-11 w-11 md:h-12 md:w-12 border border-border/40">
            {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {photoUrl ? initial : <BotIcon className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-base md:text-lg font-semibold text-foreground truncate uppercase tracking-wide">{name}</p>
            <p className="text-sm md:text-base text-muted-foreground truncate">@{username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={cn(
            "h-2.5 w-2.5 rounded-full",
            status === "online" ? "bg-emerald-500" : "bg-muted-foreground/40"
          )} />
          <span className="text-xs text-muted-foreground capitalize">{status}</span>
        </div>
      </div>

      <div className="flex items-center gap-5 text-sm md:text-base text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          {messages.toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {users}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full h-9 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => navigate(botId ? `/bots/${botId}/settings` : "/bots")}
      >
        <Settings className="h-4 w-4 mr-1.5" />
        Configurar
      </Button>
    </div>
  );
}
