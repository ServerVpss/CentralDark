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
    fake_engagement_max_per_day?: number;
    fake_engagement_names?: string[];
  } | null;
  onUpdate: () => void;
  onAutoSave?: (key: string, value: boolean) => void;
}

const DEFAULT_NAMES = [
  // Nomes masculinos
  'João Silva', 'Pedro Oliveira', 'Lucas Souza', 'Rafael Pereira', 'Bruno Almeida',
  'Gabriel Ferreira', 'Thiago Ribeiro', 'Matheus Nascimento', 'Felipe Araújo', 'Gustavo Moreira',
  'Leonardo Santos', 'Carlos Eduardo', 'André Luiz', 'Rodrigo Costa', 'Fernando Lima',
  'Vinícius Martins', 'Diego Carvalho', 'Marcelo Gomes', 'Ricardo Dias', 'Alexandre Nunes',
  'Henrique Barbosa', 'Paulo César', 'Eduardo Mendes', 'Caio Henrique', 'Victor Hugo',
  'Daniel Rocha', 'Leandro Cardoso', 'Fábio Junior', 'Roberto Campos', 'Guilherme Lopes',
  'Renato Freitas', 'Sérgio Melo', 'Anderson Silva', 'Marcos Vinícius', 'Adriano Castro',
  'Cristiano Ramos', 'Maurício Teixeira', 'Rogério Azevedo', 'Luciano Pinto', 'Márcio Correia',
  'Antônio Carlos', 'José Roberto', 'Francisco Assis', 'Manoel Filho', 'Sebastião Neto',
  'Raimundo Costa', 'Geraldo Souza', 'Valdecir Lima', 'Cláudio Silva', 'Reginaldo Santos',
  'Alessandro Fernandes', 'Evandro Nascimento', 'Emerson Oliveira', 'Wesley Rodrigues', 'Igor Alves',
  'Douglas Pereira', 'Jonathan Costa', 'Patrick Sousa', 'William Borges', 'Bryan Santos',
  'Ryan Ferreira', 'Kevin Lima', 'Nathan Ribeiro', 'Enzo Gabriel', 'Pietro Carvalho',
  'Davi Lucca', 'Miguel Artur', 'Arthur Henrique', 'Heitor Augusto', 'Bernardo Luís',
  'Samuel Costa', 'Benício Santos', 'Lorenzo Oliveira', 'Joaquim Filho', 'Théo Gabriel',
  'Noah Henrique', 'Isaac Miguel', 'Gael Lucas', 'Benjamin Costa', 'Anthony Silva',
  'Murilo Henrique', 'Cauã Gabriel', 'Erick Matheus', 'Kaique Santos', 'Luís Felipe',
  'Otávio Augusto', 'Raul Henrique', 'Pietro Gabriel', 'Henry Lucas', 'Yuri Alexandre',
  
  // Nomes femininos
  'Maria Santos', 'Ana Costa', 'Juliana Lima', 'Camila Rodrigues', 'Fernanda Martins',
  'Larissa Gomes', 'Beatriz Carvalho', 'Amanda Barbosa', 'Letícia Dias', 'Carolina Nunes',
  'Gabriela Silva', 'Isabela Oliveira', 'Mariana Souza', 'Bruna Ferreira', 'Jéssica Almeida',
  'Aline Pereira', 'Vanessa Costa', 'Patrícia Lima', 'Tatiana Santos', 'Priscila Ribeiro',
  'Natália Carvalho', 'Daniela Gomes', 'Débora Martins', 'Renata Dias', 'Michele Nunes',
  'Cristiane Barbosa', 'Simone Araújo', 'Andréia Moreira', 'Luciana Freitas', 'Cláudia Melo',
  'Sandra Regina', 'Mônica Lima', 'Rosana Costa', 'Elaine Santos', 'Adriana Oliveira',
  'Flávia Souza', 'Viviane Ferreira', 'Carla Mendes', 'Roberta Alves', 'Alessandra Ramos',
  'Bianca Teixeira', 'Thais Azevedo', 'Mayara Pinto', 'Sabrina Correia', 'Rafaela Castro',
  'Lívia Cardoso', 'Helena Campos', 'Laura Lopes', 'Giovanna Freitas', 'Sophia Santos',
  'Alice Costa', 'Valentina Oliveira', 'Cecília Souza', 'Manuela Lima', 'Lara Beatriz',
  'Lorena Santos', 'Isadora Silva', 'Melissa Carvalho', 'Yasmin Costa', 'Marina Fernandes',
  'Clara Ribeiro', 'Luísa Nascimento', 'Antonella Martins', 'Emanuelly Dias', 'Heloísa Nunes',
  'Catarina Barbosa', 'Esther Araújo', 'Lavínia Moreira', 'Maria Eduarda', 'Maria Luísa',
  'Ana Clara', 'Ana Beatriz', 'Ana Júlia', 'Ana Luíza', 'Maria Fernanda',
  'Maria Vitória', 'Maria Alice', 'Maria Cecília', 'Stella Maris', 'Aurora Costa',
  'Eloá Santos', 'Alícia Oliveira', 'Luna Souza', 'Isis Helena', 'Olívia Lima',
  'Elisa Carvalho', 'Agatha Ferreira', 'Milena Almeida', 'Sarah Pereira', 'Nicole Costa',
  'Rebeca Santos', 'Emily Oliveira', 'Sophie Lima', 'Vitória Santos', 'Luana Costa',
  
  // Nomes compostos e variações
  'João Pedro Silva', 'Pedro Henrique Oliveira', 'Lucas Gabriel Souza', 'Rafael Augusto Costa',
  'Maria Clara Santos', 'Ana Laura Lima', 'Luiz Fernando Ribeiro', 'José Carlos Almeida',
  'Francisco José Costa', 'Antônio José Lima', 'Maria José Santos', 'Ana Maria Oliveira',
  'João Victor Pereira', 'Pedro Lucas Ferreira', 'Gabriel Santos Silva', 'Miguel Costa Souza',
  'Arthur Silva Lima', 'Enzo Gabriel Costa', 'Heitor Augusto Santos', 'Davi Lucas Oliveira',
  'Bernardo Costa Lima', 'Théo Gabriel Santos', 'Samuel Henrique Souza', 'Joaquim Pedro Lima',
  'Maria Eduarda Santos', 'Julia Beatriz Costa', 'Ana Sophia Lima', 'Isabella Maria Santos',
  'Valentina Costa Souza', 'Helena Santos Lima', 'Laura Maria Oliveira', 'Giovanna Costa Santos',
  'Sophia Helena Lima', 'Alice Maria Costa', 'Cecília Santos Souza', 'Manuela Costa Lima',
  'Lorena Maria Santos', 'Isadora Costa Oliveira', 'Marina Helena Souza', 'Clara Beatriz Lima',
  
  // Nomes regionais e tradicionais
  'Raimundo Nonato', 'Francisco das Chagas', 'José Maria', 'Maria da Conceição',
  'Antônio Francisco', 'João Batista', 'Pedro Paulo', 'Carlos Alberto', 'Luiz Carlos',
  'José Roberto', 'Paulo Roberto', 'Roberto Carlos', 'Carlos Roberto', 'Luiz Roberto',
  'Maria das Graças', 'Maria Aparecida', 'Maria de Fátima', 'Maria do Socorro',
  'Ana Paula', 'Paula Fernanda', 'Fernanda Paula', 'Paula Regina', 'Regina Célia',
  'Célia Regina', 'Vera Lúcia', 'Lúcia Helena', 'Helena Maria', 'Maria Helena',
  'Rosângela Maria', 'Maria Rosa', 'Rosa Maria', 'Terezinha Maria', 'Maria Terezinha'
];

export function FakeEngagementSettings({ botId, settings, onUpdate, onAutoSave }: FakeEngagementSettingsProps) {
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
      // Forçar envio imediato (mesmo que exista intervalo) e limitar ao bot atual
      const { error: upsertError } = await supabase
        .from('bot_settings')
        .upsert(
          {
            bot_id: botId,
            fake_engagement_enabled: true,
            fake_engagement_last_sent: null,
          },
          { onConflict: 'bot_id' }
        );

      if (upsertError) throw upsertError;

      // Chamar a função com parâmetro para usar mensagem PADRÃO de assinatura
      const response = await supabase.functions.invoke('fake-engagement', {
        body: { useDefaultMessage: true, botId, forceSend: true }
      });
      
      if (response.error) throw response.error;

      const results = (response.data as any)?.results as Array<{ bot_id: string; status: string; error?: string }> | undefined;
      const mine = results?.find(r => r.bot_id === botId);
      if (mine && mine.status !== 'sent') {
        throw new Error(mine.error || 'Mensagem não foi enviada (status inesperado)');
      }
      
      toast.success('Mensagem de simulação de assinatura enviada!');
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
            onCheckedChange={(checked) => {
              setEnabled(checked);
              onAutoSave?.("fake_engagement_enabled", checked);
            }}
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
            min={1}
            max={120}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 min</span>
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
