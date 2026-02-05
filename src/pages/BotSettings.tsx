import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Save,
  Check,
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
  Upload,
  Send,
  Zap,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentGatewaysGrid } from "@/components/payments/PaymentGatewaysGrid";
import { TypingReactionsSettings } from "@/components/bots/TypingReactionsSettings";
import { MessageEffectSettings } from "@/components/bots/MessageEffectSettings";
import { BroadcastDialog } from "@/components/bots/BroadcastDialog";
import { FakeEngagementSettings } from "@/components/bots/FakeEngagementSettings";
import { EngagementMessagesManager } from "@/components/bots/EngagementMessagesManager";
import { toast } from "sonner";
import { useTelegramBots, TelegramBot } from "@/hooks/useTelegramBots";
import { useBotSettings, MessageEffectType } from "@/hooks/useBotSettings";

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
  
  // Typing & Reactions state
  const [autoDeleteMessages, setAutoDeleteMessages] = useState(true);
  const [showTyping, setShowTyping] = useState(true);
  const [reactToMessages, setReactToMessages] = useState(true);
  const [reactionMode, setReactionMode] = useState<"fixed" | "random">("random");
  const [fixedEmoji, setFixedEmoji] = useState("👍");
  const [customEmojis, setCustomEmojis] = useState<string[]>([]);
  const [announcePayments, setAnnouncePayments] = useState(true);
  const [messageEffect, setMessageEffect] = useState<MessageEffectType>("party");
  
  // Broadcast dialog state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  
  // Photo update state
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const [photoUpdateStep, setPhotoUpdateStep] = useState<"idle" | "connecting" | "fetching" | "saving" | "done">("idle");
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

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
      setAutoDeleteMessages(settings.auto_delete_messages ?? true);
      setShowTyping(settings.show_typing ?? true);
      setReactToMessages(settings.react_to_messages ?? true);
      setReactionMode((settings.reaction_mode as "fixed" | "random") ?? "random");
      setFixedEmoji(settings.fixed_emoji ?? "👍");
      setCustomEmojis(settings.custom_emojis ?? []);
      setMessageEffect((settings.message_effect as MessageEffectType) ?? "party");
    }
  }, [settings, defaultTerms]);

  // Auto-save function for toggles
  const autoSaveToggle = async (key: string, value: boolean) => {
    await updateSettings({ [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    
    const success = await updateSettings({
      group_chat_id: groupChatId ? parseInt(groupChatId) : null,
      group_url: groupUrl || null,
      terms_enabled: termsEnabled,
      terms_text: termsText,
      mute_new_members: muteNewMembers,
      announce_payments: announcePayments,
      auto_delete_messages: autoDeleteMessages,
      show_typing: showTyping,
      react_to_messages: reactToMessages,
      reaction_mode: reactionMode,
      fixed_emoji: fixedEmoji,
      custom_emojis: customEmojis,
      message_effect: messageEffect,
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

  const handleUpdateGroupPhoto = async () => {
    if (!botId || !settings?.group_chat_id) {
      toast.error("Nenhum grupo configurado");
      return;
    }

    setUpdatingPhoto(true);
    setPhotoUpdateStep("connecting");
    
    try {
      // Simulate step progress for better UX
      await new Promise(r => setTimeout(r, 300));
      setPhotoUpdateStep("fetching");
      
      const { data, error } = await supabase.functions.invoke("telegram-update-group-photo", {
        body: { bot_id: botId },
      });

      if (error) throw error;

      setPhotoUpdateStep("saving");
      await new Promise(r => setTimeout(r, 300));

      if (data.success) {
        setPhotoUpdateStep("done");
        toast.success("Foto do grupo atualizada!");
        // Small delay to show success state
        await new Promise(r => setTimeout(r, 800));
        // Reload settings to get the new photo
        window.location.reload();
      } else {
        toast.error(data.error || "Erro ao atualizar foto");
        setPhotoUpdateStep("idle");
      }
    } catch (error) {
      console.error("Error updating group photo:", error);
      toast.error("Erro ao atualizar foto do grupo");
      setPhotoUpdateStep("idle");
    } finally {
      setUpdatingPhoto(false);
    }
  };

  const getPhotoUpdateStepLabel = () => {
    switch (photoUpdateStep) {
      case "connecting": return "Conectando ao Telegram...";
      case "fetching": return "Buscando foto do grupo...";
      case "saving": return "Salvando...";
      case "done": return "Concluído!";
      default: return "Atualizar Foto";
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
          <Button variant="outline" onClick={() => setBroadcastOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Broadcast
          </Button>
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
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Engajamento
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
                  {/* Show detected group info */}
                  {settings?.group_title && settings?.group_chat_id && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {settings.group_photo_url && !photoError ? (
                            <div className="relative h-10 w-10">
                              {photoLoading && (
                                <Skeleton className="absolute inset-0 h-10 w-10 rounded-full" />
                              )}
                              <img 
                                src={settings.group_photo_url} 
                                alt={settings.group_title}
                                className={`h-10 w-10 rounded-full object-cover transition-opacity ${photoLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => setPhotoLoading(false)}
                                onError={() => {
                                  setPhotoLoading(false);
                                  setPhotoError(true);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{settings.group_title}</p>
                            <p className="text-xs text-muted-foreground font-mono">{settings.group_chat_id}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-success border-success/50">
                          Conectado
                        </Badge>
                      </div>
                      {settings.group_url && (
                        <a 
                          href={settings.group_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {settings.group_url}
                        </a>
                      )}
                      {/* Photo update with progress */}
                      {updatingPhoto && (
                        <div className="p-3 rounded-lg bg-secondary/80 border border-primary/30 animate-fade-in">
                          <div className="flex items-center gap-3">
                            {photoUpdateStep === "done" ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                                <Check className="h-4 w-4 text-success" />
                              </div>
                            ) : (
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{getPhotoUpdateStepLabel()}</p>
                              <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    photoUpdateStep === "done" ? "bg-success" : "bg-primary"
                                  }`}
                                  style={{
                                    width: photoUpdateStep === "connecting" ? "25%" : 
                                           photoUpdateStep === "fetching" ? "50%" : 
                                           photoUpdateStep === "saving" ? "75%" : 
                                           photoUpdateStep === "done" ? "100%" : "0%"
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`flex-1 transition-all ${updatingPhoto ? "opacity-50" : ""}`}
                          onClick={handleUpdateGroupPhoto}
                          disabled={updatingPhoto}
                        >
                          {updatingPhoto ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          {updatingPhoto ? "Atualizando..." : "Atualizar Foto"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => {
                            setGroupChatId("");
                            setGroupUrl("");
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Manual configuration (hidden when group is detected) */}
                  {!settings?.group_title && (
                    <>
                      <div className="p-4 rounded-lg bg-secondary/50 border border-dashed border-muted-foreground/30">
                        <p className="text-sm text-muted-foreground text-center">
                          📍 <strong>Detecção Automática:</strong> Adicione o bot ao grupo desejado e envie uma mensagem. O grupo será detectado automaticamente!
                        </p>
                      </div>

                      <Separator />

                      <p className="text-xs text-muted-foreground text-center">Ou configure manualmente:</p>

                      <div className="space-y-2">
                        <Label htmlFor="groupChatId">ID do Grupo</Label>
                        <Input
                          id="groupChatId"
                          placeholder="-1001234567890"
                          value={groupChatId}
                          onChange={(e) => setGroupChatId(e.target.value)}
                          className="bg-secondary/50 font-mono"
                        />
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
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <VolumeX className="h-4 w-4" />
                        Fiscal de Grupo
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Mutar usuários sem assinatura ativa no grupo
                      </p>
                    </div>
                    <Switch
                      checked={muteNewMembers}
                      onCheckedChange={(checked) => {
                        setMuteNewMembers(checked);
                        autoSaveToggle("mute_new_members", checked);
                      }}
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
                      onCheckedChange={(checked) => {
                        setAnnouncePayments(checked);
                        autoSaveToggle("announce_payments", checked);
                      }}
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
                      onCheckedChange={(checked) => {
                        setTermsEnabled(checked);
                        autoSaveToggle("terms_enabled", checked);
                      }}
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

              {/* Typing & Reactions Settings */}
              <div className="lg:col-span-2">
                <TypingReactionsSettings
                  autoDeleteMessages={autoDeleteMessages}
                  setAutoDeleteMessages={setAutoDeleteMessages}
                  showTyping={showTyping}
                  setShowTyping={setShowTyping}
                  reactToMessages={reactToMessages}
                  setReactToMessages={setReactToMessages}
                  reactionMode={reactionMode}
                  setReactionMode={setReactionMode}
                  fixedEmoji={fixedEmoji}
                  setFixedEmoji={setFixedEmoji}
                  customEmojis={customEmojis}
                  setCustomEmojis={setCustomEmojis}
                  onAutoSave={autoSaveToggle}
                />
              </div>

              {/* Message Effect Settings */}
              <div className="lg:col-span-2">
                <MessageEffectSettings
                  messageEffect={messageEffect}
                  setMessageEffect={setMessageEffect}
                />
              </div>

            </div>
          </TabsContent>

          <TabsContent value="engagement" className="mt-6 space-y-6">
            <FakeEngagementSettings
              botId={botId || ""}
              settings={settings}
              onUpdate={() => {}}
              onAutoSave={autoSaveToggle}
            />
            <EngagementMessagesManager botId={botId || ""} />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentGatewaysGrid />
          </TabsContent>
        </Tabs>

        {/* Broadcast Dialog */}
        <BroadcastDialog
          open={broadcastOpen}
          onOpenChange={setBroadcastOpen}
          botId={botId || ""}
          botToken={bot.token}
        />
      </div>
    </DashboardLayout>
  );
}
