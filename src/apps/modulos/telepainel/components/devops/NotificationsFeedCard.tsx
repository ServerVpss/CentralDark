// Card de notificações ao vivo — espelha o canal CentralDark — Status no painel web.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info, Siren } from "lucide-react";
import { useNotificationsLog, type NotifyTipo } from "@/shared/hooks/useNotificationsLog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const ICONE: Record<NotifyTipo, React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5 text-blue-500" />,
  sucesso: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  aviso: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />,
  erro: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  critico: <Siren className="h-3.5 w-3.5 text-red-600" />,
};

export function NotificationsFeedCard({ className }: { className?: string }) {
  const { items, loading, stats, lastEventAt } = useNotificationsLog({ periodo: "24h" });

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Notificações ao vivo
          <Badge variant="outline" className="ml-auto text-[10px]">
            {stats.total} nas últimas 24h
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Mesmo feed que sai no canal <strong>CentralDark — Status</strong> via{" "}
          <code className="text-[10px]">@srver1bot</code>.
          {lastEventAt && (
            <> · último evento {formatDistanceToNow(lastEventAt, { locale: ptBR, addSuffix: true })}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5 max-h-80 overflow-y-auto">
        {loading && <div className="text-xs text-muted-foreground">Carregando…</div>}
        {!loading && items.length === 0 && (
          <div className="text-xs text-muted-foreground py-6 text-center">
            Sem notificações nas últimas 24h.
          </div>
        )}
        {items.slice(0, 30).map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-2 p-2 rounded-lg bg-muted/40 text-xs"
          >
            <div className="mt-0.5">{ICONE[n.tipo] ?? ICONE.info}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{n.titulo}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                  {n.origem}
                </Badge>
                {!n.sent_ok && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0">
                    falhou
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground truncate">{n.mensagem}</div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                {formatDistanceToNow(new Date(n.created_at), { locale: ptBR, addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
