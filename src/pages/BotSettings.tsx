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
import { QueryModulesManager } from "@/components/bots/QueryModulesManager";
import { ButtonEmojiConfig } from "@/components/bots/ButtonEmojiConfig";
import { toast } from "sonner";
import { useTelegramBots, TelegramBot } from "@/hooks/useTelegramBots";
import { useBotSettings, MessageEffectType } from "@/hooks/useBotSettings";

export default function BotSettings() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { bots, loading: botsLoading } = useTelegramBots();
  const { settings, loading: settingsLoading, updateSettings, addOwner, removeOwner, defaultTerms, refetch: refetchSettings } = useBotSettings(botId || null);

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
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Header — Premium glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/bots")} className="shrink-0 rounded-xl hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">{bot.name}</h1>
                <p className="text-sm text-muted-foreground truncate">
                  @{bot.bot_username || "não sincronizado"} • Configurações
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setBroadcastOpen(true)} className="rounded-xl border-border/50 hover:bg-primary/10">
                <Send className="h-4 w-4 mr-2" />
                Broadcast
              </Button>
              <Button variant="glow" size="sm" onClick={handleSave} disabled={saving} className="rounded-xl">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-1.5 max-w-2xl">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto gap-1">
              <TabsTrigger value="general" className="gap-2 rounded-lg data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configurações</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="gap-2 rounded-lg data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Módulos</span>
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-2 rounded-lg data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Engajamento</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 rounded-lg data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Pagamentos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="mt-6">
            {/* Maintenance Mode Banner */}
            <Card className={`mb-6 rounded-xl border-2 transition-all ${settings?.maintenance_mode ? "border-amber-500/60 bg-amber-500/5 shadow-lg shadow-amber-500/5" : "border-border/40 bg-card/80 backdrop-blur-sm"}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${settings?.maintenance_mode ? "bg-amber-500/15 border border-amber-500/30" : "bg-emerald-500/15 border border-emerald-500/30"}`}>
                      {settings?.maintenance_mode ? (
                        <Settings className="h-5 w-5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                      ) : (
                        <Check className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">
                        Modo Manutenção
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {settings?.maintenance_mode 
                          ? "Bot em manutenção — consultas desativadas"
                          : "Bot operacional — respondendo normalmente"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.maintenance_mode ?? false}
                    onCheckedChange={(checked) => {
                      autoSaveToggle("maintenance_mode", checked);
                    }}
                  />
                </div>
                {settings?.maintenance_mode && (
                  <div className="space-y-2 pl-15">
                    <Label className="text-sm">Mensagem de manutenção</Label>
                    <Textarea
                      value={settings?.maintenance_message ?? "🔧 Bot em manutenção. Retornaremos em breve."}
                      onChange={(e) => {
                        if (settings) {
                          updateSettings({ maintenance_message: e.target.value });
                        }
                      }}
                      placeholder="Mensagem exibida quando tentam usar consultas"
                      className="bg-secondary/30 text-sm min-h-[60px] rounded-xl border-border/40"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Toggle Menu Antigo x Menu Novo */}
            <Card className={`mb-6 rounded-xl border-2 transition-all ${(settings as any)?.use_legacy_menu ? "border-purple-500/60 bg-purple-500/5 shadow-lg shadow-purple-500/5" : "border-border/40 bg-card/80 backdrop-blur-sm"}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${(settings as any)?.use_legacy_menu ? "bg-purple-500/15 border border-purple-500/30" : "bg-blue-500/15 border border-blue-500/30"}`}>
                      <Sparkles className={`h-5 w-5 ${(settings as any)?.use_legacy_menu ? "text-purple-500" : "text-blue-500"}`} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">
                        {(settings as any)?.use_legacy_menu ? "Robô Antigo (menu legado)" : "Robô Novo (menu por categorias)"}
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {(settings as any)?.use_legacy_menu
                          ? "Mostra todos os módulos numa lista só — como era antes."
                          : "Mostra categorias PESSOAS, VEICULAR e FOTOS com paginação."}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={(settings as any)?.use_legacy_menu ?? false}
                    onCheckedChange={(checked) => {
                      autoSaveToggle("use_legacy_menu" as any, checked);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Owners Section */}
              <Card className="rounded-xl border-border/40 bg-card/80 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    Administradores
                  </CardTitle>
                  <CardDescription className="text-xs">
                    IDs do Telegram com acesso ao painel admin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="ID do Telegram (ex: 123456789)"
                      value={newOwnerId}
                      onChange={(e) => setNewOwnerId(e.target.value)}
                      className="bg-secondary/30 rounded-xl border-border/40"
                    />
                    <Button variant="outline" onClick={handleAddOwner} className="rounded-xl shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {settings?.owner_ids && settings.owner_ids.length > 0 ? (
                      settings.owner_ids.map((ownerId) => (
                        <div
                          key={ownerId}
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Users className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">{ownerId}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOwner(ownerId)}
                            className="text-destructive hover:text-destructive h-8 w-8 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 rounded-xl bg-secondary/20 border border-dashed border-border/40">
                        <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Nenhum owner configurado
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                    💡 Envie /start para @userinfobot no Telegram para descobrir seu ID
                  </p>
                </CardContent>
              </Card>

              {/* Group Settings */}
              <Card className="rounded-xl border-border/40 bg-card/80 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                      <Link className="h-4 w-4 text-violet-500" />
                    </div>
                    Grupo VIP
                  </CardTitle>
                  <CardDescription className="text-xs">
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
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from("bot_settings")
                                .update({ 
                                  group_chat_id: null, 
                                  group_title: null, 
                                  group_link: null,
                                  group_photo_url: null,
                                })
                                .eq("bot_id", botId);
                              if (error) throw error;
                              setGroupChatId("");
                              setGroupUrl("");
                              toast.success("Grupo VIP desconectado com sucesso!");
                              refetchSettings();
                            } catch (err: any) {
                              toast.error("Erro ao desconectar: " + err.message);
                            }
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
              <Card className="rounded-xl border-border/40 bg-card/80 backdrop-blur-sm shadow-sm lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <FileText className="h-4 w-4 text-emerald-500" />
                    </div>
                    Termos de Uso
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Termos que os usuários devem aceitar antes de usar o bot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
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
                      <Separator className="opacity-30" />
                      <div className="space-y-2">
                        <Label htmlFor="termsText" className="text-sm">Texto dos Termos (HTML)</Label>
                        <Textarea
                          id="termsText"
                          placeholder="Digite os termos de uso..."
                          value={termsText}
                          onChange={(e) => setTermsText(e.target.value)}
                          className="bg-secondary/30 min-h-[200px] font-mono text-sm rounded-xl border-border/40"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground">
                            Tags: &lt;b&gt;negrito&lt;/b&gt;, &lt;i&gt;itálico&lt;/i&gt;, &lt;code&gt;código&lt;/code&gt;
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTermsText(defaultTerms)}
                            className="text-xs rounded-lg"
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

            {/* Custom Emojis dos Botões */}
            <ButtonEmojiConfig botId={botId || ""} settingsId={settings?.id || null} />
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

          <TabsContent value="modules" className="mt-6">
            <QueryModulesManager />
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
