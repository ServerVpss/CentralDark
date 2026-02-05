import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Send,
  Users,
  X,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useScheduledBroadcasts, ScheduledBroadcast } from "@/hooks/useScheduledBroadcasts";

interface ScheduledBroadcastManagerProps {
  botId: string;
}

export function ScheduledBroadcastManager({ botId }: ScheduledBroadcastManagerProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const {
    broadcasts,
    isLoading,
    createBroadcast,
    cancelBroadcast,
    deleteBroadcast,
  } = useScheduledBroadcasts(botId);

  const handleSubmit = () => {
    if (!message || !scheduledDate || !scheduledTime) return;

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    createBroadcast.mutate({
      bot_id: botId,
      message_template: message,
      target_audience: audience,
      scheduled_at: scheduledAt,
    });

    setOpen(false);
    setMessage("");
    setScheduledDate("");
    setScheduledTime("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Agendado</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">Enviando</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Concluído</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">Falhou</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Broadcasts Programados</h3>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Send className="h-4 w-4" />
              Agendar Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Broadcast</DialogTitle>
              <DialogDescription>
                Configure uma mensagem para ser enviada automaticamente em uma data futura.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Audiência</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    <SelectItem value="active">Assinantes ativos</SelectItem>
                    <SelectItem value="expired">Assinaturas expiradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!message || !scheduledDate || !scheduledTime || createBroadcast.isPending}
              >
                {createBroadcast.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* List of scheduled broadcasts */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum broadcast agendado</p>
          </div>
        ) : (
          broadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(broadcast.status)}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(broadcast.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">
                  {broadcast.message_template}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {broadcast.target_audience === "all" ? "Todos" : 
                     broadcast.target_audience === "active" ? "Ativos" : "Expirados"}
                  </span>
                  {broadcast.sent_count > 0 && (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="h-3 w-3" />
                      {broadcast.sent_count} enviados
                    </span>
                  )}
                  {broadcast.failed_count > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-3 w-3" />
                      {broadcast.failed_count} falhas
                    </span>
                  )}
                </div>
              </div>

              {broadcast.status === "pending" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => cancelBroadcast.mutate(broadcast.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
