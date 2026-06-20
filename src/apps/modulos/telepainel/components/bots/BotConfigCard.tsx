import { useState, useEffect } from "react";
import {
  Bot,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Save,
  CheckCircle,
  Wifi,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { TelegramBot } from "@/shared/hooks/useTelegramBots";
import { supabase } from "@/integrations/supabase/client";

interface BotConfigCardProps {
  bot: TelegramBot;
  onSync: (botId: string) => Promise<boolean>;
  onUpdate: (botId: string, updates: Partial<TelegramBot>) => Promise<boolean>;
}

export function BotConfigCard({ bot, onSync, onUpdate }: BotConfigCardProps) {
  const [showToken, setShowToken] = useState(false);
  const [isActive, setIsActive] = useState(bot.is_active);
  const [token, setToken] = useState(bot.token);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Webhook URL gerada via env vars (sem hardcode do project ID)
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook?botId=${bot.id}`;

  useEffect(() => {
    setIsActive(bot.is_active);
    setToken(bot.token);
    setHasChanges(false);
  }, [bot]);

  const handleActiveChange = (checked: boolean) => {
    setIsActive(checked);
    setHasChanges(true);
  };

  const handleTokenChange = (value: string) => {
    setToken(value);
    setHasChanges(token !== value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onSync(bot.id);
    setIsSyncing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // If token changed, we need to re-sync
    if (token !== bot.token) {
      try {
        const { data, error } = await supabase.functions.invoke("telegram-bot", {
          body: { action: "syncBot", botId: bot.id, token },
        });

        if (error || !data?.success) {
          toast.error(data?.error || "Erro ao validar token");
          setIsSaving(false);
          return;
        }
      } catch (err) {
        toast.error("Erro ao sincronizar bot");
        setIsSaving(false);
        return;
      }
    }

    const success = await onUpdate(bot.id, {
      is_active: isActive,
      token: token,
    });

    if (success) {
      setHasChanges(false);
      toast.success("Configuração salva e webhook sincronizado!");
    }
    
    setIsSaving(false);
  };

  return (
    <Card className="bg-card border-border">
      {/* Header with sync status */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20">
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
          <Wifi className="h-3 w-3 mr-1" />
          Sincronizado em tempo real
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="text-xs gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Configuração do Bot</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={isActive 
              ? "bg-success/10 text-success border-success/30" 
              : "bg-muted/50 text-muted-foreground border-muted"
            }
          >
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <CardDescription>
          Configure o token e ative seu bot do Telegram
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bot Active Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="bot-active" className="font-medium">Bot Ativo</Label>
          <Switch
            id="bot-active"
            checked={isActive}
            onCheckedChange={handleActiveChange}
          />
        </div>

        {/* Token Field */}
        <div className="space-y-2">
          <Label className="font-medium">Token do Bot</Label>
          <div className="relative">
            <Input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="bg-secondary/50 font-mono text-sm pr-10"
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Obtenha o token através do @BotFather no Telegram
          </p>
        </div>

        {/* Webhook URL (Read-only) */}
        <div className="space-y-2">
          <Label className="font-medium">Webhook URL</Label>
          <div className="relative">
            <Input
              value={webhookUrl}
              readOnly
              className="bg-secondary/50 font-mono text-xs pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => copyToClipboard(webhookUrl)}
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            URL configurada automaticamente ao salvar
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button
            variant="glow"
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Configuração
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(webhookUrl)}
            title="Copiar Webhook URL"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* Sync Status Info */}
        {bot.webhook_active && (
          <div className="flex items-center gap-2 text-xs text-success bg-success/10 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Webhook configurado e funcionando</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
