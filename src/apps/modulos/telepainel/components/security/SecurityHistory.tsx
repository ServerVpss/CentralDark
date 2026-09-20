import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, User, MessageSquare, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import type { BlockedMessage } from "@/shared/hooks/useSecurity";

interface SecurityHistoryProps {
  messages: BlockedMessage[];
  loading?: boolean;
}

const reasonLabels: Record<string, { label: string; variant: "destructive" | "secondary" | "default" }> = {
  link: { label: "Link", variant: "destructive" },
  spam: { label: "Spam", variant: "secondary" },
  flood: { label: "Flood", variant: "secondary" },
  bot: { label: "Bot", variant: "destructive" },
  default: { label: "Outro", variant: "default" },
};

export function SecurityHistory({ messages, loading }: SecurityHistoryProps) {
  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 rounded-lg border border-border/50 bg-secondary/20 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Bloqueios
        </CardTitle>
        <CardDescription>
          Últimas 50 mensagens bloqueadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum bloqueio registrado</h3>
            <p className="text-sm text-muted-foreground">
              As mensagens bloqueadas aparecerão aqui
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {messages.map((msg) => {
                const reason = reasonLabels[msg.blocked_reason || "default"] || reasonLabels.default;
                const username = msg.from_username || msg.from_first_name || "Desconhecido";

                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-4 rounded-lg border border-border/50 bg-secondary/20 p-4 transition-all hover:bg-secondary/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{username}</span>
                        <Badge variant={reason.variant} className="text-xs">
                          {reason.label}
                        </Badge>
                        {msg.chat_type && (
                          <Badge variant="outline" className="text-xs">
                            {msg.chat_type}
                          </Badge>
                        )}
                      </div>
                      {msg.message_text && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          <MessageSquare className="mr-1 inline h-3 w-3" />
                          {msg.message_text}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
