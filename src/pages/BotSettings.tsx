import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Save,
  Users,
  Bell,
  Link,
  Plus,
  Trash2,
  Loader2,
  FileText,
  VolumeX,
  CreditCard,
  Settings,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentGatewaysGrid } from "@/components/payments/PaymentGatewaysGrid";
import { toast } from "sonner";
import { useTelegramBots, TelegramBot } from "@/hooks/useTelegramBots";
import { useBotSettings } from "@/hooks/useBotSettings";

export default function BotSettings() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { bots, loading: botsLoading } = useTelegramBots();
  const { settings, loading: settingsLoading, updateSettings, addOwner, removeOwner, defaultTerms } = useBotSettings(botId || null);

  const [bot, setBot] = useState<TelegramBot | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [newOwnerId, setNewOwnerId] = useState("");
  const [groupChatId, setGroupChatId] = useState("");
  const [groupUrl, setGroupUrl] = useState("");
  const [termsEnabled, setTermsEnabled] = useState(true);
  const [termsText, setTermsText] = useState(defaultTerms);
  const [muteNewMembers, setMuteNewMembers] = useState(true);
  const [announcePayments, setAnnouncePayments] = useState(true);

  // Find current bot
  useEffect(() => {
    if (!botsLoading && bots.length > 0 && botId) {
      const foundBot = bots.find(b => b.id === botId);
      if (foundBot) {
        setBot(foundBot);
      } else {
        toast.error("Bot não encontrado");
        navigate("/bots");
      }
    }
  }, [bots, botId, botsLoading, navigate]);

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setGroupChatId(settings.group_chat_id?.toString() || "");
      setGroupUrl(settings.group_url || "");
      setTermsEnabled(settings.terms_enabled ?? true);
      setTermsText(settings.terms_text || defaultTerms);
      setMuteNewMembers(settings.mute_new_members ?? true);
      setAnnouncePayments(settings.announce_payments ?? true);
    }
  }, [settings, defaultTerms]);

  const handleSave = async () => {
    setSaving(true);
    
    const success = await updateSettings({
      group_chat_id: groupChatId ? parseInt(groupChatId) : null,
      group_url: groupUrl || null,
      terms_enabled: termsEnabled,
      terms_text: termsText,
      mute_new_members: muteNewMembers,
      announce_payments: announcePayments,
    });

    setSaving(false);
  };

  const handleAddOwner = async () => {
    if (!newOwnerId.trim()) {
      toast.error("Digite um ID de usuário");
      return;
    }

    const ownerId = parseInt(newOwnerId.trim());
    if (isNaN(ownerId)) {
      toast.error("ID deve ser um número");
      return;
    }

    const success = await addOwner(ownerId);
    if (success) {
      setNewOwnerId("");
    }
  };

  const handleRemoveOwner = async (ownerId: number) => {
    if (confirm(`Remover owner ${ownerId}?`)) {
      await removeOwner(ownerId);
    }
  };

  if (botsLoading || settingsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!bot) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Bot não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/bots")}>
            Voltar para Bots
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/bots")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{bot.name}</h1>
                <p className="text-sm text-muted-foreground">
                  @{bot.bot_username || "não sincronizado"} • Configurações do Bot
                </p>
              </div>
            </div>
          </div>
          <Button variant="glow" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Owners Section */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Administradores (Owners)
                  </CardTitle>
                  <CardDescription>
                    IDs do Telegram que terão acesso ao painel admin do bot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="ID do Telegram (ex: 123456789)"
                      value={newOwnerId}
                      onChange={(e) => setNewOwnerId(e.target.value)}
                      className="bg-secondary/50"
                    />
                    <Button variant="outline" onClick={handleAddOwner}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {settings?.owner_ids && settings.owner_ids.length > 0 ? (
                      settings.owner_ids.map((ownerId) => (
                        <div
                          key={ownerId}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{ownerId}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOwner(ownerId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum owner configurado. Adicione seu ID do Telegram para acessar o painel admin.
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    💡 Para descobrir seu ID, envie /start para @userinfobot no Telegram
                  </p>
                </CardContent>
              </Card>

              {/* Group Settings */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-primary" />
                    Grupo VIP
                  </CardTitle>
                  <CardDescription>
                    Configure o grupo privado para assinantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupChatId">ID do Grupo</Label>
                    <Input
                      id="groupChatId"
                      placeholder="-1001234567890"
                      value={groupChatId}
                      onChange={(e) => setGroupChatId(e.target.value)}
                      className="bg-secondary/50 font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      ID do chat do grupo (número negativo começando com -100)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupUrl">Link do Grupo</Label>
                    <Input
                      id="groupUrl"
                      placeholder="https://t.me/+ABC123xyz"
                      value={groupUrl}
                      onChange={(e) => setGroupUrl(e.target.value)}
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link de convite para o grupo VIP (será enviado após pagamento)
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <VolumeX className="h-4 w-4" />
                        Mutar novos membros
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Novos membros são silenciados até confirmar pagamento
                      </p>
                    </div>
                    <Switch
                      checked={muteNewMembers}
                      onCheckedChange={setMuteNewMembers}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Anunciar pagamentos
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Enviar mensagem no grupo quando alguém assina
                      </p>
                    </div>
                    <Switch
                      checked={announcePayments}
                      onCheckedChange={setAnnouncePayments}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Terms Settings */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Termos de Uso
                  </CardTitle>
                  <CardDescription>
                    Termos que os usuários devem aceitar antes de usar o bot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Ativar termos obrigatórios</Label>
                      <p className="text-xs text-muted-foreground">
                        Usuários precisam aceitar os termos antes de assinar
                      </p>
                    </div>
                    <Switch
                      checked={termsEnabled}
                      onCheckedChange={setTermsEnabled}
                    />
                  </div>

                  {termsEnabled && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="termsText">Texto dos Termos (suporta HTML)</Label>
                        <Textarea
                          id="termsText"
                          placeholder="Digite os termos de uso..."
                          value={termsText}
                          onChange={(e) => setTermsText(e.target.value)}
                          className="bg-secondary/50 min-h-[200px] font-mono text-sm"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Use tags HTML: &lt;b&gt;negrito&lt;/b&gt;, &lt;i&gt;itálico&lt;/i&gt;, &lt;code&gt;código&lt;/code&gt;
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTermsText(defaultTerms)}
                          >
                            Restaurar padrão
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentGatewaysGrid />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
