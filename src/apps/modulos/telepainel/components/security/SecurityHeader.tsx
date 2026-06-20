import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TelegramBot } from "@/hooks/telegram/types";

interface SecurityHeaderProps {
  bots: TelegramBot[];
  selectedBotId: string | null;
  onBotChange: (botId: string) => void;
  onRefresh: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function SecurityHeader({
  bots,
  selectedBotId,
  onBotChange,
  onRefresh,
  onSave,
  isSaving,
}: SecurityHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Segurança</h1>
          <p className="text-sm text-muted-foreground">
            Configure as proteções dos seus grupos e canais
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedBotId || ""} onValueChange={onBotChange}>
          <SelectTrigger className="w-[200px] bg-secondary/50">
            <SelectValue placeholder="Selecione um bot" />
          </SelectTrigger>
          <SelectContent>
            {bots.map((bot) => (
              <SelectItem key={bot.id} value={bot.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      bot.is_active ? "bg-success" : "bg-muted-foreground"
                    }`}
                  />
                  {bot.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button variant="glow" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
