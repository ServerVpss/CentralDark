import { useState } from "react";
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
} from "lucide-react";

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
  botToken: string;
}

type AudienceType = "all" | "active" | "expired";

interface MessageEffect {
  id: string;
  name: string;
  emoji: string;
  icon: React.ReactNode;
}

const MESSAGE_EFFECTS: MessageEffect[] = [
  { id: "", name: "Sem efeito", emoji: "✖️", icon: null },
  { id: "5104841245755180586", name: "Fogo", emoji: "🔥", icon: <Flame className="h-4 w-4 text-orange-500" /> },
  { id: "5046509860385561286", name: "Festa", emoji: "🎉", icon: <PartyPopper className="h-4 w-4 text-yellow-500" /> },
  { id: "5044134455711629726", name: "Coração", emoji: "❤️", icon: <Heart className="h-4 w-4 text-red-500" /> },
  { id: "5107584321108051014", name: "Like", emoji: "👍", icon: <ThumbsUp className="h-4 w-4 text-blue-500" /> },
];

export function BroadcastDialog({ open, onOpenChange, botId, botToken }: BroadcastDialogProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<AudienceType>("all");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    setSending(true);
    setProgress({ sent: 0, total: 0 });

    try {
      // Buscar usuários do bot
      const { data: subscriptions, error: subError } = await supabase
        .from("telegram_subscriptions")
        .select("telegram_user_id, status, expires_at")
        .eq("bot_id", botId);

      if (subError) throw subError;

      // Filtrar por audiência
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
        toast.warning("Nenhum usuário encontrado para enviar");
        setSending(false);
        setProgress(null);
        return;
      }

      setProgress({ sent: 0, total: targetUsers.length });

      // Montar botões inline se configurados
      const inlineKeyboard: any = { inline_keyboard: [] };
      if (buttonText && buttonUrl) {
        inlineKeyboard.inline_keyboard.push([{ text: buttonText, url: buttonUrl }]);
      }

      let sentCount = 0;
      let failedCount = 0;

      // Enviar em lotes de 25
      const BATCH_SIZE = 25;
      for (let i = 0; i < targetUsers.length; i += BATCH_SIZE) {
        const batch = targetUsers.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (user) => {
            try {
              const body: any = {
                chat_id: user.telegram_user_id,
                text: message,
                parse_mode: "HTML",
              };

              if (inlineKeyboard.inline_keyboard.length > 0) {
                body.reply_markup = inlineKeyboard;
              }

              if (selectedEffect) {
                body.message_effect_id = selectedEffect;
              }

              const response = await fetch(
                `https://api.telegram.org/bot${botToken}/sendMessage`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                }
              );

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

        setProgress({ sent: sentCount, total: targetUsers.length });

        // Delay entre batches para respeitar rate limit
        if (i + BATCH_SIZE < targetUsers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1100));
        }
      }

      toast.success(
        `Broadcast concluído! ${sentCount} enviados, ${failedCount} falhas`
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
    setAudience("all");
    setSelectedEffect("");
    setButtonText("");
    setButtonUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Broadcast
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem para todos os usuários do bot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Audiência */}
          <div className="space-y-2">
            <Label>Audiência</Label>
            <RadioGroup
              value={audience}
              onValueChange={(v) => setAudience(v as AudienceType)}
              className="flex gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex items-center gap-1 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Todos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="flex items-center gap-1 cursor-pointer">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Ativos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expired" id="expired" />
                <Label htmlFor="expired" className="flex items-center gap-1 cursor-pointer">
                  <UserX className="h-4 w-4 text-red-500" />
                  Expirados
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem... (suporta HTML: <b>, <i>, <code>)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-secondary/50 min-h-[120px]"
            />
          </div>

          {/* Efeito Visual */}
          <div className="space-y-2">
            <Label>Efeito Visual</Label>
            <div className="flex flex-wrap gap-2">
              {MESSAGE_EFFECTS.map((effect) => (
                <Button
                  key={effect.id}
                  type="button"
                  variant={selectedEffect === effect.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEffect(effect.id)}
                  className="gap-1"
                >
                  {effect.icon || effect.emoji}
                  {effect.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Botão Inline (opcional) */}
          <div className="space-y-2">
            <Label>Botão Inline (opcional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Texto do botão"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="bg-secondary/50"
              />
              <Input
                placeholder="URL"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Progresso */}
          {progress && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Enviando...</span>
                <Badge variant="outline">
                  {progress.sent}/{progress.total}
                </Badge>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(progress.sent / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Botão Enviar */}
          <Button
            variant="glow"
            className="w-full gap-2"
            onClick={handleSend}
            disabled={sending || !message.trim()}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Broadcast
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
