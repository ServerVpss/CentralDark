import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Trash2, Edit2, Save, X, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const [messages, setMessages] = useState<EngagementMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
          is_active: true
        });

      if (error) throw error;

      toast.success('Mensagem adicionada!');
      setNewMessage("");
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
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim()) return;

    try {
      const { error } = await supabase
        .from('engagement_messages')
        .update({ message_template: editingText.trim() })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Mensagem atualizada!');
      setEditingId(null);
      setEditingText("");
      fetchMessages();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar mensagem');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
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
          is_active: true
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
