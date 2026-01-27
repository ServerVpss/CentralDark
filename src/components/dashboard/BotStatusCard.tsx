import { Bot, MoreVertical, Power, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BotStatusCardProps {
  name: string;
  username: string;
  status: "online" | "offline" | "error";
  messages: number;
  users: number;
}

export function BotStatusCard({ name, username, status, messages, users }: BotStatusCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card",
                status === "online" && "bg-success",
                status === "offline" && "bg-muted-foreground",
                status === "error" && "bg-destructive"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" /> Configurar
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Power className="h-4 w-4" /> {status === "online" ? "Desligar" : "Ligar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Mensagens/dia</p>
          <p className="text-lg font-semibold">{messages.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Usuários</p>
          <p className="text-lg font-semibold">{users.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
