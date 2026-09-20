import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { History, RefreshCw, Clock, Loader2 } from "lucide-react";
import { useQueryHistory, QueryHistoryItem } from "@/shared/hooks/useQueryHistory";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QueryHistoryListProps {
  onSelectQuery?: (type: string, input: string) => void;
}

export function QueryHistoryList({ onSelectQuery }: QueryHistoryListProps) {
  const { history, isLoading, refresh } = useQueryHistory(10);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'agora';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico Recente
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && history.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma consulta realizada
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((query) => (
              <button
                key={query.id}
                onClick={() => onSelectQuery?.(query.query_type, query.query_input)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{query.query_type.toUpperCase()}</p>
                    <Badge
                      variant="outline"
                      className={
                        query.status === 'success'
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-destructive/10 text-destructive border-destructive/30"
                      }
                    >
                      {query.status === 'success' ? 'OK' : 'Erro'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {query.query_input}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                  <Clock className="h-3 w-3" />
                  {formatTime(query.created_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
