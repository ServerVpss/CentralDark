import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FakeEngagementSettingsProps {
  botId: string;
  settings: {
    fake_engagement_enabled?: boolean;
    fake_engagement_interval_minutes?: number;
    fake_engagement_names?: string[];
  } | null;
  onUpdate: () => void;
}

const DEFAULT_NAMES = [
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Lucas Souza',
  'Juliana Lima', 'Rafael Pereira', 'Camila Rodrigues', 'Bruno Almeida', 'Fernanda Martins',
  'Gabriel Ferreira', 'Larissa Gomes', 'Thiago Ribeiro', 'Beatriz Carvalho', 'Matheus Nascimento',
  'Amanda Barbosa', 'Felipe Araújo', 'Letícia Dias', 'Gustavo Moreira', 'Carolina Nunes'
];

export function FakeEngagementSettings({ botId, settings, onUpdate }: FakeEngagementSettingsProps) {
  const [enabled, setEnabled] = useState(settings?.fake_engagement_enabled ?? false);
  const [interval, setInterval] = useState(settings?.fake_engagement_interval_minutes ?? 30);
  const [names, setNames] = useState(
    (settings?.fake_engagement_names ?? DEFAULT_NAMES).join('\n')
  );
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setEnabled(settings?.fake_engagement_enabled ?? false);
    setInterval(settings?.fake_engagement_interval_minutes ?? 30);
    setNames((settings?.fake_engagement_names ?? DEFAULT_NAMES).join('\n'));
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const namesArray = names
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      const { error } = await supabase
        .from('bot_settings')
        .update({
          fake_engagement_enabled: enabled,
          fake_engagement_interval_minutes: interval,
          fake_engagement_names: namesArray
        })
        .eq('bot_id', botId);

      if (error) throw error;
      
      toast.success('Configurações de engajamento salvas!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // Temporariamente resetar o last_sent para forçar envio
      await supabase
        .from('bot_settings')
        .update({ 
          fake_engagement_enabled: true,
          fake_engagement_last_sent: null 
        })
        .eq('bot_id', botId);

      const response = await supabase.functions.invoke('fake-engagement');
      
      if (response.error) throw response.error;
      
      toast.success('Mensagem de teste enviada no grupo!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao testar:', error);
      toast.error('Erro ao enviar mensagem de teste');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Engajamento Automático</h3>
          <p className="text-sm text-muted-foreground">
            Simula novas assinaturas para gerar engajamento no grupo
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Toggle Principal */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <Zap className={cn(
              "h-5 w-5 transition-colors",
              enabled ? "text-violet-400" : "text-muted-foreground"
            )} />
            <div>
              <Label className="text-base font-medium">Ativar Engajamento</Label>
              <p className="text-xs text-muted-foreground">
                Envia mensagens automáticas no grupo
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-purple-600"
          />
        </div>

        {/* Intervalo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label>Intervalo entre mensagens: {interval} minutos</Label>
          </div>
          <Slider
            value={[interval]}
            onValueChange={(v) => setInterval(v[0])}
            min={5}
            max={120}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 min</span>
            <span>30 min</span>
            <span>1 hora</span>
            <span>2 horas</span>
          </div>
        </div>

        {/* Lista de Nomes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label>Nomes para Sortear (um por linha)</Label>
          </div>
          <Textarea
            value={names}
            onChange={(e) => setNames(e.target.value)}
            placeholder="João Silva&#10;Maria Santos&#10;Pedro Oliveira"
            className="min-h-[150px] bg-muted/20 border-border/50 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {names.split('\n').filter(n => n.trim()).length} nomes configurados
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          <Button
            onClick={handleTest}
            disabled={testing}
            variant="outline"
            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
          >
            {testing ? 'Enviando...' : 'Testar Agora'}
          </Button>
        </div>

        {/* Aviso */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400">
            ⚠️ Este recurso simula assinaturas fictícias. Use com moderação para não parecer artificial.
            O sistema verifica a cada minuto se há mensagens para enviar.
          </p>
        </div>
      </div>
    </Card>
  );
}
