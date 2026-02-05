import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  History,
  User,
  Settings,
  CreditCard,
  Shield,
  Bot,
  Loader2,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs, AuditLog } from "@/hooks/useAuditLogs";
import { cn } from "@/lib/utils";
import { useState } from "react";

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  settings: Settings,
  payment: CreditCard,
  security: Shield,
  bot: Bot,
};

const actionColors: Record<string, string> = {
  create: "text-green-500 bg-green-500/10",
  update: "text-blue-500 bg-blue-500/10",
  delete: "text-red-500 bg-red-500/10",
  login: "text-amber-500 bg-amber-500/10",
  logout: "text-muted-foreground bg-muted",
};

interface LogItemProps {
  log: AuditLog;
  style: React.CSSProperties;
}

const LogItem = memo(function LogItem({ log, style }: LogItemProps) {
  const Icon = actionIcons[log.entity_type] || History;
  const colorClass = actionColors[log.action] || "text-muted-foreground bg-muted";

  return (
    <div
      style={style}
      className="flex items-start gap-3 p-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {log.action}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {log.entity_type}
            {log.entity_id && ` #${log.entity_id.slice(0, 8)}`}
          </span>
        </div>
        {log.details && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {JSON.stringify(log.details)}
          </p>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
      </span>
    </div>
  );
});

export function AuditLogsViewer() {
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  
  const { logs, isLoading, refetch } = useAuditLogs({
    entityType: entityFilter === "all" ? undefined : entityFilter,
    action: actionFilter === "all" ? undefined : actionFilter,
    limit: 100,
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Logs de Auditoria
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Atualizar
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="bot">Bot</SelectItem>
              <SelectItem value="payment">Pagamento</SelectItem>
              <SelectItem value="settings">Configurações</SelectItem>
              <SelectItem value="security">Segurança</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="create">Criar</SelectItem>
              <SelectItem value="update">Atualizar</SelectItem>
              <SelectItem value="delete">Deletar</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[400px] overflow-auto"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualItems.map((virtualItem) => (
                <LogItem
                  key={logs[virtualItem.index].id}
                  log={logs[virtualItem.index]}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
