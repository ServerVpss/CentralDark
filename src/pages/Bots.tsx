import { useState, useEffect } from "react";
import {
  Bot,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTelegramBots, useBotSecuritySettings, TelegramBot } from "@/hooks/useTelegramBots";
import { BotHealthMonitor } from "@/components/bots/BotHealthMonitor";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";

// Regex para validar formato do token do Telegram: ID:HASH
const TELEGRAM_TOKEN_REGEX = /^\d{8,10}:[A-Za-z0-9_-]{35}$/;

// Mensagens de erro amigáveis
const getTokenErrorMessage = (error: string): string => {
  if (error.includes("Not Found") || error.includes("404")) {
    return "Token inválido ou bot não existe. Verifique se o token está correto ou crie um novo bot no @BotFather.";
  }
  if (error.includes("Unauthorized") || error.includes("401")) {
    return "Token não autorizado. O token pode ter sido revogado. Gere um novo token no @BotFather.";
  }
  if (error.includes("Invalid")) {
    return "Formato do token inválido. O token deve estar no formato: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz";
  }
  return error;
};

export default function Bots() {
  const { bots, loading, createBot, syncBot, deleteBot } = useTelegramBots();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotToken, setNewBotToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBot, setSelectedBot] = useState<TelegramBot | null>(null);
  const [showToken, setShowToken] = useState<string | null>(null);
  const [syncingBot, setSyncingBot] = useState<string | null>(null);

  // Validar formato do token em tempo real
  const validateToken = (token: string): boolean => {
    if (!token.trim()) {
      setTokenError(null);
      return false;
    }
    
    // Verificar se contém ":" (separador básico)
    if (!token.includes(":")) {
      setTokenError("O token deve conter ':' separando o ID do hash");
      return false;
    }
    
    const parts = token.split(":");
    if (parts.length !== 2) {
      setTokenError("Formato inválido. Use: ID:HASH");
      return false;
    }
    
    const [botId, hash] = parts;
    
    // Verificar se o ID é numérico
    if (!/^\d+$/.test(botId)) {
      setTokenError("O ID do bot (antes do ':') deve conter apenas números");
      return false;
    }
    
    // Verificar comprimento do ID (geralmente 9-10 dígitos)
    if (botId.length < 8 || botId.length > 12) {
      setTokenError("O ID do bot deve ter entre 8 e 12 dígitos");
      return false;
    }
    
    // Verificar hash
    if (hash.length < 30 || hash.length > 50) {
      setTokenError("O hash do token parece incorreto. Verifique se copiou o token completo");
      return false;
    }
    
    // Verificar caracteres válidos no hash
    if (!/^[A-Za-z0-9_-]+$/.test(hash)) {
      setTokenError("O hash contém caracteres inválidos");
      return false;
    }
    
    setTokenError(null);
    return true;
  };

  const handleTokenChange = (value: string) => {
    setNewBotToken(value);
    validateToken(value);
  };

  const handleCreateBot = async () => {
    const trimmedToken = newBotToken.trim();
    
    if (!trimmedToken) {
      toast.error("Digite o token do bot");
      return;
    }

    if (!validateToken(trimmedToken)) {
      toast.error(tokenError || "Token inválido");
      return;
    }

    setIsCreating(true);
    const result = await createBot(newBotName || "Novo Bot", trimmedToken);
    setIsCreating(false);

    if (result) {
      setShowAddDialog(false);
      setNewBotName("");
      setNewBotToken("");
      setTokenError(null);
    }
  };

  const handleSyncBot = async (botId: string) => {
    setSyncingBot(botId);
    await syncBot(botId);
    setSyncingBot(null);
  };

  const handleDeleteBot = async (botId: string) => {
    if (confirm("Tem certeza que deseja remover este bot?")) {
      await deleteBot(botId);
      if (selectedBot?.id === botId) {
        setSelectedBot(null);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const getStatusBadge = (bot: TelegramBot) => {
    if (bot.health_status === "online") {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Online
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Gerenciamento de Bots</h1>
            <p className="text-sm text-muted-foreground">
              Configure e monitore seus bots do Telegram em tempo real
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="glow" className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Adicionar Bot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Bot</DialogTitle>
                <DialogDescription>
                  Cole o token do seu bot do Telegram. O webhook será configurado automaticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="botName">Nome do Bot (opcional)</Label>
                  <Input
                    id="botName"
                    placeholder="Meu Bot"
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botToken">Token do Bot *</Label>
                  <Input
                    id="botToken"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={newBotToken}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    className={`bg-secondary/50 font-mono text-sm ${
                      tokenError ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                  {tokenError ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {tokenError}
                    </p>
                  ) : newBotToken && !tokenError ? (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Formato do token válido
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Obtenha o token através do @BotFather no Telegram
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="glow" onClick={handleCreateBot} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar e Sincronizar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Bot List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="bg-card border-border">
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : bots.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum bot configurado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione seu primeiro bot do Telegram para começar
                  </p>
                  <Button variant="glow" onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Bot
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bots.map((bot) => (
                  <Card
                    key={bot.id}
                    className={`bg-card border-border cursor-pointer transition-all ${
                      selectedBot?.id === bot.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedBot(bot)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <Bot className="h-6 w-6 text-primary" />
                            </div>
                            {bot.health_status === "online" && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold truncate">{bot.name}</h3>
                              {getStatusBadge(bot)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              @{bot.bot_username || "Não sincronizado"}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {bot.webhook_active ? (
                                <span className="text-xs text-success flex items-center gap-1">
                                  <Wifi className="h-3 w-3" /> Webhook ativo
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <WifiOff className="h-3 w-3" /> Webhook inativo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSyncBot(bot.id);
                            }}
                            disabled={syncingBot === bot.id}
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${syncingBot === bot.id ? "animate-spin" : ""}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBot(bot);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBot(bot.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Token Field */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <Label className="text-xs text-muted-foreground">Token</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type={showToken === bot.id ? "text" : "password"}
                            value={bot.token}
                            readOnly
                            className="bg-secondary/50 font-mono text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowToken(showToken === bot.id ? null : bot.id);
                            }}
                          >
                            {showToken === bot.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(bot.token);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Analytics Chart */}
            {bots.length > 0 && (
              <AnalyticsChart botId={selectedBot?.id} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Health Monitor */}
            <BotHealthMonitor bots={bots} />

            {/* Bot Settings */}
            {selectedBot && (
              <BotSettingsCard bot={selectedBot} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function BotSettingsCard({ bot }: { bot: TelegramBot }) {
  const { settings, loading, updateSettings } = useBotSecuritySettings(bot.id);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (localSettings) {
      await updateSettings(localSettings);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Configurações</CardTitle>
        <CardDescription>{bot.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger value="security" className="flex-1 text-xs">Segurança</TabsTrigger>
            <TabsTrigger value="welcome" className="flex-1 text-xs">Boas-vindas</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4 mt-4">
            {/* Anti-Link */}
            <div className="space-y-3 p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Anti-Link</Label>
                <Switch
                  checked={localSettings?.anti_link_enabled ?? true}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, anti_link_enabled: checked } : prev
                    )
                  }
                />
              </div>
              {localSettings?.anti_link_enabled && (
                <Select
                  value={localSettings?.anti_link_action}
                  onValueChange={(value) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, anti_link_action: value } : prev
                    )
                  }
                >
                  <SelectTrigger className="bg-secondary/50 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delete">Deletar</SelectItem>
                    <SelectItem value="warn">Avisar</SelectItem>
                    <SelectItem value="mute">Silenciar</SelectItem>
                    <SelectItem value="kick">Expulsar</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Anti-Spam */}
            <div className="space-y-3 p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Anti-Spam</Label>
                <Switch
                  checked={localSettings?.anti_spam_enabled ?? true}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, anti_spam_enabled: checked } : prev
                    )
                  }
                />
              </div>
              {localSettings?.anti_spam_enabled && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Max msgs</Label>
                      <Input
                        type="number"
                        value={localSettings?.anti_spam_max_messages ?? 5}
                        onChange={(e) =>
                          setLocalSettings((prev) =>
                            prev
                              ? { ...prev, anti_spam_max_messages: parseInt(e.target.value) }
                              : prev
                          )
                        }
                        className="bg-secondary/50 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Intervalo (s)</Label>
                      <Input
                        type="number"
                        value={localSettings?.anti_spam_interval_seconds ?? 10}
                        onChange={(e) =>
                          setLocalSettings((prev) =>
                            prev
                              ? { ...prev, anti_spam_interval_seconds: parseInt(e.target.value) }
                              : prev
                          )
                        }
                        className="bg-secondary/50 h-8 text-xs"
                      />
                    </div>
                  </div>
                  <Select
                    value={localSettings?.anti_spam_action}
                    onValueChange={(value) =>
                      setLocalSettings((prev) =>
                        prev ? { ...prev, anti_spam_action: value } : prev
                      )
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delete">Deletar</SelectItem>
                      <SelectItem value="mute">Silenciar 5min</SelectItem>
                      <SelectItem value="kick">Expulsar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Anti-Flood */}
            <div className="space-y-3 p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Anti-Flood</Label>
                <Switch
                  checked={localSettings?.anti_flood_enabled ?? true}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, anti_flood_enabled: checked } : prev
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="welcome" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Mensagem de Boas-vindas</Label>
              <Switch
                checked={localSettings?.welcome_message_enabled ?? false}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) =>
                    prev ? { ...prev, welcome_message_enabled: checked } : prev
                  )
                }
              />
            </div>
            {localSettings?.welcome_message_enabled && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Olá {name}! Bem-vindo ao grupo!"
                  value={localSettings?.welcome_message ?? ""}
                  onChange={(e) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, welcome_message: e.target.value } : prev
                    )
                  }
                  className="bg-secondary/50 text-sm min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{name}"} para o nome e {"{username}"} para o @username
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Button variant="glow" className="w-full" onClick={handleSave}>
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}
