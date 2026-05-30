import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MessageSquarePlus, Trash2, Edit2, Save, X, Info, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EngagementMessage {
  id: string;
  message_template: string;
  is_active: boolean;
  interval_minutes: number;
}

interface EngagementMessagesManagerProps {
  botId: string;
}

const DEFAULT_MESSAGE = `🎉 *NOVA ASSINATURA!*

👤 *{nome}* acabou de assinar!
📋 Plano: *{plano}*
💰 Valor: *R$ {valor}*

🚀 Bem-vindo(a) à família! 🎊`;

const PLACEHOLDERS_INFO = [
  { placeholder: "{nome}", description: "Nome sorteado da lista de nomes" },
  { placeholder: "{plano}", description: "Nome do plano sorteado" },
  { placeholder: "{valor}", description: "Valor do plano (ex: 29.90)" },
];

export function EngagementMessagesManager({ botId }: EngagementMessagesManagerProps) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<EngagementMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [newInterval, setNewInterval] = useState(30);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingInterval, setEditingInterval] = useState(30);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('engagement_messages')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [botId]);

  const handleAdd = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('engagement_messages')
        .insert({
          bot_id: botId,
          user_id: user.id,
          message_template: newMessage.trim(),
          is_active: true,
          interval_minutes: newInterval
        });

      if (error) throw error;

      toast.success('Mensagem adicionada!');
      setNewMessage("");
      setNewInterval(30);
      setDialogOpen(false);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      toast.error('Erro ao adicionar mensagem');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('engagement_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Mensagem removida!');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover mensagem');
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('engagement_messages')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      fetchMessages();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar mensagem');
    }
  };

  const handleEdit = (msg: EngagementMessage) => {
    setEditingId(msg.id);
    setEditingText(msg.message_template);
    setEditingInterval(msg.interval_minutes || 30);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim()) return;

    try {
      const { error } = await supabase
        .from('engagement_messages')
        .update({ 
          message_template: editingText.trim(),
          interval_minutes: editingInterval
        })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Mensagem atualizada!');
      setEditingId(null);
      setEditingText("");
      setEditingInterval(30);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar mensagem');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingInterval(30);
  };

  const handleUpdateInterval = async (id: string, interval: number) => {
    try {
      const { error } = await supabase
        .from('engagement_messages')
        .update({ interval_minutes: interval })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Erro ao atualizar intervalo:', error);
      toast.error('Erro ao atualizar intervalo');
    }
  };

  const handleTestMessage = async (messageId: string) => {
    setTestingId(messageId);
    try {
      // Resetar o last_sent_at da mensagem específica para forçar envio
      await supabase
        .from('engagement_messages')
        .update({ last_sent_at: null })
        .eq('id', messageId);

      // Chamar a função com parâmetro para usar mensagem ESPECÍFICA
      const response = await supabase.functions.invoke('fake-engagement', {
        body: { messageId: messageId }
      });
      
      if (response.error) throw response.error;
      
      toast.success('Mensagem de engajamento enviada!');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao testar:', error);
      toast.error('Erro ao enviar mensagem de teste');
    } finally {
      setTestingId(null);
    }
  };

  const handleAddDefault = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('engagement_messages')
        .insert({
          bot_id: botId,
          user_id: user.id,
          message_template: DEFAULT_MESSAGE,
          is_active: true,
          interval_minutes: 30
        });

      if (error) throw error;

      toast.success('Mensagem padrão adicionada!');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      toast.error('Erro ao adicionar mensagem');
    }
  };

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <MessageSquarePlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Mensagens de Engajamento</h3>
            <p className="text-sm text-muted-foreground">
              Personalize as mensagens enviadas automaticamente
            </p>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="font-medium mb-2">Variáveis disponíveis:</p>
            <ul className="space-y-1 text-xs">
              {PLACEHOLDERS_INFO.map(p => (
                <li key={p.placeholder}>
                  <code className="text-emerald-400">{p.placeholder}</code> - {p.description}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">Nenhuma mensagem cadastrada</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleAddDefault}
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              Usar Mensagem Padrão
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Criar Mensagem
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Mensagem de Engajamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Variáveis disponíveis:</p>
                    <div className="flex flex-wrap gap-2">
                      {PLACEHOLDERS_INFO.map(p => (
                        <code key={p.placeholder} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                          {p.placeholder}
                        </code>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={DEFAULT_MESSAGE}
                    className="min-h-[200px] bg-muted/20 border-border/50"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Intervalo: {newInterval} minutos</Label>
                    </div>
                    <Slider
                      value={[newInterval]}
                      onValueChange={(v) => setNewInterval(v[0])}
                      min={1}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 min</span>
                      <span>1 hora</span>
                      <span>2 horas</span>
                    </div>
                  </div>
                  <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                    Adicionar Mensagem
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lista de mensagens */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3"
              >
                {editingId === msg.id ? (
                  <>
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="min-h-[120px] bg-background/50 border-border/50"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Intervalo: {editingInterval} minutos</Label>
                      </div>
                      <Slider
                        value={[editingInterval]}
                        onValueChange={(v) => setEditingInterval(v[0])}
                        min={1}
                        max={120}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <pre className="text-sm whitespace-pre-wrap font-mono text-foreground/80">
                      {msg.message_template}
                    </pre>
                    
                    {/* Intervalo individual */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <Label className="text-xs">Intervalo: {msg.interval_minutes || 30} minutos</Label>
                      </div>
                      <Slider
                        value={[msg.interval_minutes || 30]}
                        onValueChange={(v) => handleUpdateInterval(msg.id, v[0])}
                        min={1}
                        max={120}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 min</span>
                        <span>30 min</span>
                        <span>1h</span>
                        <span>2h</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={msg.is_active}
                          onCheckedChange={() => handleToggle(msg.id, msg.is_active)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <Label className="text-xs text-muted-foreground">
                          {msg.is_active ? 'Ativa' : 'Inativa'}
                        </Label>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleTestMessage(msg.id)}
                          disabled={testingId === msg.id}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          {testingId === msg.id ? 'Enviando...' : 'Testar'}
                        </Button>
                        <Button
                          onClick={() => handleEdit(msg)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(msg.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Botão adicionar */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-dashed border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Adicionar Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Mensagem de Engajamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Variáveis disponíveis:</p>
                  <div className="flex flex-wrap gap-2">
                    {PLACEHOLDERS_INFO.map(p => (
                      <code key={p.placeholder} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                        {p.placeholder}
                      </code>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={DEFAULT_MESSAGE}
                  className="min-h-[200px] bg-muted/20 border-border/50"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Intervalo: {newInterval} minutos</Label>
                  </div>
                  <Slider
                    value={[newInterval]}
                    onValueChange={(v) => setNewInterval(v[0])}
                    min={1}
                    max={120}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 min</span>
                    <span>1 hora</span>
                    <span>2 horas</span>
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  Adicionar Mensagem
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Card>
  );
}
