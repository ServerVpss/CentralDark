import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/hub-client";
import type { MessageEffectType } from "@/shared/hooks/useBotSettings";

// Lista oficial — DEVE bater com EFFECT_MAP da edge function `test-message-effect`
// e do `efi-webhook`. Alterar aqui exige alterar nos dois lados.
const SUPPORTED_EFFECT_IDS: Record<Exclude<MessageEffectType, 'none'>, string> = {
  fire:  '5104841245755180586',
  like:  '5107584321108051014',
  heart: '5159385139981059251',
  party: '5046509860389126442',
};

const VALID_EFFECTS: MessageEffectType[] = ['fire', 'like', 'heart', 'party', 'none'];

const MESSAGE_EFFECTS: { id: MessageEffectType; emoji: string; label: string; description: string }[] = [
  { id: 'fire',  emoji: '🔥', label: 'Fogo',    description: 'Efeito de chamas' },
  { id: 'like',  emoji: '👍', label: 'Like',    description: 'Joinha voando' },
  { id: 'heart', emoji: '❤️', label: 'Coração', description: 'Corações flutuantes' },
  { id: 'party', emoji: '🎉', label: 'Festa',   description: 'Confetti colorido' },
  { id: 'none',  emoji: '🚫', label: 'Nenhum',  description: 'Sem efeito visual' },
];

interface MessageEffectSettingsProps {
  botId: string;
  messageEffect: MessageEffectType;
  setMessageEffect: (value: MessageEffectType) => void;
}

export function MessageEffectSettings({
  botId,
  messageEffect,
  setMessageEffect,
}: MessageEffectSettingsProps) {
  const [testing, setTesting] = useState(false);

  const handleSelect = (id: MessageEffectType) => {
    // Validação dura: só aceita efeitos suportados
    if (!VALID_EFFECTS.includes(id)) {
      toast.error(`Efeito inválido: "${id}"`);
      return;
    }
    if (id !== 'none' && !SUPPORTED_EFFECT_IDS[id as Exclude<MessageEffectType, 'none'>]) {
      toast.error(`Efeito "${id}" sem effect_id configurado`);
      return;
    }
    setMessageEffect(id);
  };

  const handleTest = async () => {
    if (!botId) {
      toast.error('Bot não identificado');
      return;
    }
    if (!VALID_EFFECTS.includes(messageEffect)) {
      toast.error('Selecione um efeito válido antes de testar');
      return;
    }
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-message-effect', {
        body: { botId, effect: messageEffect },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Teste enviado no privado do master! 🚀');
    } catch (e: any) {
      toast.error(`Falha no teste: ${e?.message || e}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Efeitos Visuais
        </CardTitle>
        <CardDescription>
          Escolha o efeito visual que aparece nas mensagens de resultado de consultas e confirmações de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label className="text-sm text-muted-foreground">
          Selecione o efeito para mensagens de sucesso:
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MESSAGE_EFFECTS.map((effect) => (
            <button
              key={effect.id}
              onClick={() => handleSelect(effect.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2",
                messageEffect === effect.id
                  ? "bg-primary/20 border-primary ring-2 ring-primary/50"
                  : "bg-secondary/30 border-transparent hover:bg-secondary/50 hover:border-primary/30"
              )}
            >
              <span className="text-4xl">{effect.emoji}</span>
              <span className="text-sm font-medium">{effect.label}</span>
              <span className="text-xs text-muted-foreground text-center">
                {effect.description}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mt-4">
          <div className="flex-1 text-xs text-muted-foreground">
            🧪 <b>Pré-visualizar:</b> envia uma mensagem de teste com o efeito selecionado direto no privado do master — sem confirmar pagamento.
            {messageEffect !== 'none' && (
              <span className="block mt-1 font-mono opacity-70">
                effect_id: {SUPPORTED_EFFECT_IDS[messageEffect as Exclude<MessageEffectType, 'none'>]}
              </span>
            )}
          </div>
          <Button
            onClick={handleTest}
            disabled={testing || !botId}
            size="sm"
            variant="default"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Testar agora
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            💡 <b>Dica:</b> Clique em um efeito para salvar automaticamente. Ele aparece na mensagem de confirmação da consulta (✅ Consulta concluída) e em confirmações de pagamento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
