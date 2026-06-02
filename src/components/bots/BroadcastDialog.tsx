import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Send,
  Users,
  UserCheck,
  UserX,
  Flame,
  PartyPopper,
  Heart,
  ThumbsUp,
  Image,
  Mic,
  FileVideo,
  Type,
  X,
  Eye,
  Link2,
} from "lucide-react";

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
  botToken: string;
}

type AudienceType = "all" | "active" | "expired";
type MediaType = "text" | "photo" | "audio" | "animation";

interface MessageEffect {
  id: string;
  name: string;
  emoji: string;
  icon: React.ReactNode;
}

const MESSAGE_EFFECTS: MessageEffect[] = [
  { id: "", name: "Nenhum", emoji: "✖️", icon: null },
  { id: "5104841245755180586", name: "Fogo", emoji: "🔥", icon: <Flame className="h-3.5 w-3.5 text-orange-500" /> },
  { id: "5046509860385561286", name: "Festa", emoji: "🎉", icon: <PartyPopper className="h-3.5 w-3.5 text-yellow-500" /> },
  { id: "5044134455711629726", name: "Coração", emoji: "❤️", icon: <Heart className="h-3.5 w-3.5 text-red-500" /> },
  { id: "5107584321108051014", name: "Like", emoji: "👍", icon: <ThumbsUp className="h-3.5 w-3.5 text-blue-500" /> },
];

const MEDIA_TYPES = [
  { value: "text" as MediaType, label: "Texto", icon: Type, description: "Mensagem de texto" },
  { value: "photo" as MediaType, label: "Foto", icon: Image, description: "Imagem JPG/PNG" },
  { value: "audio" as MediaType, label: "Áudio", icon: Mic, description: "Arquivo de áudio" },
  { value: "animation" as MediaType, label: "GIF", icon: FileVideo, description: "GIF animado" },
];

export function BroadcastDialog({ open, onOpenChange, botId, botToken }: BroadcastDialogProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<AudienceType>("all");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaInputMode, setMediaInputMode] = useState<"file" | "url">("file");
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [audienceCounts, setAudienceCounts] = useState<{ all: number; active: number; expired: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !botId) return;
    let cancelled = false;
    (async () => {
      setAudienceCounts(null);
      const { data, error } = await supabase
        .from("telegram_subscriptions")
        .select("status, expires_at")
        .eq("bot_id", botId);
      if (cancelled || error || !data) return;
      const now = new Date();
      const active = data.filter((s) => s.status === "active" && new Date(s.expires_at) > now).length;
      setAudienceCounts({ all: data.length, active, expired: data.length - active });
    })();
    return () => { cancelled = true; };
  }, [open, botId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max for Telegram)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 50MB.");
      return;
    }

    setMediaFile(file);

    // Generate preview for images/gifs
    if (file.type.startsWith("image/") || file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaUrl("");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getAcceptTypes = () => {
    switch (mediaType) {
      case "photo": return "image/jpeg,image/png,image/webp";
      case "audio": return "audio/*";
      case "animation": return "image/gif";
      default: return "";
    }
  };

  const hasMedia = mediaFile || mediaUrl.trim();
  const hasContent = mediaType === "text" ? message.trim() : hasMedia;

  const handleSend = async () => {
    if (!hasContent) {
      toast.error(mediaType === "text" ? "Digite uma mensagem" : "Selecione um arquivo ou URL");
      return;
    }

    setSending(true);
    setProgress({ sent: 0, failed: 0, total: 0 });

    try {
      // Fetch target users
      const { data: subscriptions, error: subError } = await supabase
        .from("telegram_subscriptions")
        .select("telegram_user_id, status, expires_at")
        .eq("bot_id", botId);

      if (subError) throw subError;

      let targetUsers = subscriptions || [];
      const now = new Date();

      if (audience === "active") {
        targetUsers = targetUsers.filter(
          (s) => s.status === "active" && new Date(s.expires_at) > now
        );
      } else if (audience === "expired") {
        targetUsers = targetUsers.filter(
          (s) => s.status !== "active" || new Date(s.expires_at) <= now
        );
      }

      if (targetUsers.length === 0) {
        toast.warning("Nenhum usuário encontrado para esta audiência");
        setSending(false);
        setProgress(null);
        return;
      }

      setProgress({ sent: 0, failed: 0, total: targetUsers.length });

      // Build inline keyboard
      const replyMarkup: any = buttonText && buttonUrl
        ? { inline_keyboard: [[{ text: buttonText, url: buttonUrl }]] }
        : undefined;

      // Prepare media (convert file to base64 if needed)
      let mediaBase64: string | null = null;
      if (mediaFile && mediaType !== "text") {
        const buffer = await mediaFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        mediaBase64 = btoa(binary);
      }

      let sentCount = 0;
      let failedCount = 0;
      const BATCH_SIZE = 25;

      for (let i = 0; i < targetUsers.length; i += BATCH_SIZE) {
        const batch = targetUsers.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (user) => {
            try {
              let endpoint: string;
              let body: any;

              if (mediaType === "text") {
                endpoint = "sendMessage";
                body = {
                  chat_id: user.telegram_user_id,
                  text: message,
                  parse_mode: "HTML",
                };
                if (selectedEffect) body.message_effect_id = selectedEffect;
              } else if (mediaType === "photo") {
                endpoint = "sendPhoto";
                body = {
                  chat_id: user.telegram_user_id,
                  parse_mode: "HTML",
                };
                if (caption) body.caption = caption;
              } else if (mediaType === "audio") {
                endpoint = "sendAudio";
                body = {
                  chat_id: user.telegram_user_id,
                  parse_mode: "HTML",
                };
                if (caption) body.caption = caption;
              } else {
                endpoint = "sendAnimation";
                body = {
                  chat_id: user.telegram_user_id,
                  parse_mode: "HTML",
                };
                if (caption) body.caption = caption;
              }

              if (replyMarkup) body.reply_markup = replyMarkup;

              let response: Response;

              if (mediaType !== "text" && mediaFile) {
                // Send via multipart/form-data for file uploads
                const formData = new FormData();
                Object.entries(body).forEach(([key, value]) => {
                  if (key === "reply_markup") {
                    formData.append(key, JSON.stringify(value));
                  } else {
                    formData.append(key, String(value));
                  }
                });

                const fieldName = mediaType === "photo" ? "photo" : mediaType === "audio" ? "audio" : "animation";
                formData.append(fieldName, mediaFile, mediaFile.name);

                response = await fetch(
                  `https://api.telegram.org/bot${botToken}/${endpoint}`,
                  { method: "POST", body: formData }
                );
              } else if (mediaType !== "text" && mediaUrl) {
                // Send via URL
                const fieldName = mediaType === "photo" ? "photo" : mediaType === "audio" ? "audio" : "animation";
                body[fieldName] = mediaUrl;

                response = await fetch(
                  `https://api.telegram.org/bot${botToken}/${endpoint}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  }
                );
              } else {
                response = await fetch(
                  `https://api.telegram.org/bot${botToken}/${endpoint}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  }
                );
              }

              const result = await response.json();
              if (result.ok) {
                sentCount++;
              } else {
                failedCount++;
                console.error("Erro ao enviar para", user.telegram_user_id, result);
              }
            } catch (err) {
              failedCount++;
              console.error("Erro ao enviar para", user.telegram_user_id, err);
            }
          })
        );

        setProgress({ sent: sentCount, failed: failedCount, total: targetUsers.length });

        if (i + BATCH_SIZE < targetUsers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1100));
        }
      }

      toast.success(
        `Broadcast concluído! ✅ ${sentCount} enviados${failedCount > 0 ? `, ❌ ${failedCount} falhas` : ""}`
      );
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Erro no broadcast:", error);
      toast.error("Erro ao enviar broadcast");
    } finally {
      setSending(false);
      setProgress(null);
    }
  };

  const resetForm = () => {
    setMessage("");
    setCaption("");
    setAudience("all");
    setSelectedEffect("");
    setButtonText("");
    setButtonUrl("");
    setMediaType("text");
    setMediaFile(null);
    setMediaUrl("");
    setPreview(null);
    setMediaInputMode("file");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!sending) { onOpenChange(v); if (!v) resetForm(); } }}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Broadcast
          </DialogTitle>
          <DialogDescription>
            Envie mensagens, fotos, áudios ou GIFs para seus usuários
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Audience Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Audiência
            </Label>
            <RadioGroup
              value={audience}
              onValueChange={(v) => setAudience(v as AudienceType)}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { value: "all", label: "Todos", icon: Users, color: "" },
                { value: "active", label: "Ativos", icon: UserCheck, color: "text-green-500" },
                { value: "expired", label: "Expirados", icon: UserX, color: "text-red-500" },
              ].map((opt) => (
                <div key={opt.value}>
                  <RadioGroupItem value={opt.value} id={`aud-${opt.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`aud-${opt.value}`}
                    className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-border bg-secondary/30 p-2.5 text-sm font-medium cursor-pointer transition-all hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary"
                  >
                    <opt.icon className={`h-4 w-4 ${opt.color}`} />
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Media Type Tabs */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de Conteúdo
            </Label>
            <Tabs value={mediaType} onValueChange={(v) => { setMediaType(v as MediaType); removeMedia(); }}>
              <TabsList className="w-full bg-secondary/50 h-10">
                {MEDIA_TYPES.map((mt) => (
                  <TabsTrigger key={mt.value} value={mt.value} className="flex-1 gap-1.5 text-xs">
                    <mt.icon className="h-3.5 w-3.5" />
                    {mt.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Text Content */}
              <TabsContent value="text" className="mt-3 space-y-3">
                <Textarea
                  placeholder="Digite sua mensagem... (suporta HTML: <b>, <i>, <code>)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-secondary/30 min-h-[120px] resize-none"
                />
              </TabsContent>

              {/* Photo / Audio / GIF Content */}
              {["photo", "audio", "animation"].map((type) => (
                <TabsContent key={type} value={type} className="mt-3 space-y-3">
                  {/* Toggle between file upload and URL */}
                  <div className="flex gap-1 p-0.5 bg-secondary/30 rounded-lg w-fit">
                    <Button
                      type="button"
                      variant={mediaInputMode === "file" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-xs px-3"
                      onClick={() => { setMediaInputMode("file"); setMediaUrl(""); }}
                    >
                      Arquivo
                    </Button>
                    <Button
                      type="button"
                      variant={mediaInputMode === "url" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-xs px-3"
                      onClick={() => { setMediaInputMode("url"); removeMedia(); }}
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      URL
                    </Button>
                  </div>

                  {mediaInputMode === "file" ? (
                    <div>
                      {!mediaFile ? (
                        <label className="flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed border-border bg-secondary/20 cursor-pointer hover:bg-secondary/30 hover:border-primary/50 transition-all">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={getAcceptTypes()}
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          {type === "photo" && <Image className="h-8 w-8 text-muted-foreground" />}
                          {type === "audio" && <Mic className="h-8 w-8 text-muted-foreground" />}
                          {type === "animation" && <FileVideo className="h-8 w-8 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">
                            Clique para selecionar {type === "photo" ? "uma foto" : type === "audio" ? "um áudio" : "um GIF"}
                          </span>
                        </label>
                      ) : (
                        <div className="relative rounded-xl border border-border bg-secondary/20 p-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                            onClick={removeMedia}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {preview ? (
                            <img src={preview} alt="Preview" className="max-h-32 rounded-lg mx-auto object-contain" />
                          ) : (
                            <div className="flex items-center gap-3 py-2">
                              {type === "audio" ? <Mic className="h-6 w-6 text-primary" /> : <FileVideo className="h-6 w-6 text-primary" />}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{mediaFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      placeholder={`URL ${type === "photo" ? "da foto" : type === "audio" ? "do áudio" : "do GIF"}`}
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="bg-secondary/30"
                    />
                  )}

                  {/* Caption for media */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Legenda (opcional)</Label>
                    <Textarea
                      placeholder="Legenda da mídia... (suporta HTML)"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="bg-secondary/30 min-h-[60px] resize-none"
                      rows={2}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Visual Effect (only for text) */}
          {mediaType === "text" && (
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Efeito Visual
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {MESSAGE_EFFECTS.map((effect) => (
                  <Button
                    key={effect.id}
                    type="button"
                    variant={selectedEffect === effect.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEffect(effect.id)}
                    className="h-8 gap-1 text-xs"
                  >
                    {effect.icon || effect.emoji}
                    {effect.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Inline Button */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Botão Inline (opcional)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Texto do botão"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="bg-secondary/30"
              />
              <Input
                placeholder="URL do botão"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                className="bg-secondary/30"
              />
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </span>
                <div className="flex items-center gap-2">
                  {progress.sent > 0 && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                      ✅ {progress.sent}
                    </Badge>
                  )}
                  {progress.failed > 0 && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-xs">
                      ❌ {progress.failed}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {progress.sent + progress.failed}/{progress.total}
                  </Badge>
                </div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                  style={{
                    width: `${((progress.sent + progress.failed) / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            variant="glow"
            className="w-full gap-2 h-11"
            onClick={handleSend}
            disabled={sending || !hasContent}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando broadcast...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar {mediaType === "text" ? "Mensagem" : mediaType === "photo" ? "Foto" : mediaType === "audio" ? "Áudio" : "GIF"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
