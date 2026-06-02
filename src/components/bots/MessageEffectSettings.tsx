import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { MessageEffectType } from "@/hooks/useBotSettings";

const MESSAGE_EFFECTS: { id: MessageEffectType; emoji: string; label: string; description: string }[] = [
  { id: 'fire', emoji: '🔥', label: 'Fogo', description: 'Efeito de chamas' },
  { id: 'like', emoji: '👍', label: 'Like', description: 'Joinha voando' },
  { id: 'heart', emoji: '❤️', label: 'Coração', description: 'Corações flutuantes' },
  { id: 'party', emoji: '🎉', label: 'Festa', description: 'Confetti colorido' },
  { id: 'none', emoji: '🚫', label: 'Nenhum', description: 'Sem efeito visual' },
];

interface MessageEffectSettingsProps {
  messageEffect: MessageEffectType;
  setMessageEffect: (value: MessageEffectType) => void;
}

export function MessageEffectSettings({
  messageEffect,
  setMessageEffect,
}: MessageEffectSettingsProps) {
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
              onClick={() => setMessageEffect(effect.id)}
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
        
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mt-4">
          <p className="text-xs text-muted-foreground">
            💡 <b>Dica:</b> Clique em um efeito para salvar automaticamente. Ele aparece na mensagem de confirmação da consulta (✅ Consulta concluída) e em confirmações de pagamento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}