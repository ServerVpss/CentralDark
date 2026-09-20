import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Rocket, Terminal, ShieldAlert } from "lucide-react";
import { useVpsDeploy } from "@/shared/hooks/useVpsDeploy";
import { useIsAdmin } from "@/shared/hooks/useIsAdmin";
import { DeployHistoryList } from "./DeployHistoryList";
import { cn } from "@/shared/lib/utils";
import { SyncStatusIcon } from "@/shared/ui/sync-status-icon";

interface Props {
  className?: string;
  /** Limita a quantidade de itens do histórico exibidos no plugin. */
  historyLimit?: number;
  /** Esconde o histórico (útil quando outra tela já mostra a lista grande). */
  showHistory?: boolean;
}

/**
 * Plugin autocontido de Deploy VPS.
 * Pode ser dropado em qualquer tela (Settings, Dashboard, Status…).
 * Verifica role admin internamente — usuários sem permissão veem um aviso.
 */
export function VpsDeployPlugin({ className, historyLimit = 5, showHistory = true }: Props) {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { history, loading, running, checking, lastCheckLog, runSync, checkCron, reload } =
    useVpsDeploy();
  const [logOpen, setLogOpen] = useState(false);

  if (roleLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4 text-sm text-muted-foreground">Carregando permissões…</CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className={cn("border-amber-200 bg-amber-50/40", className)}>
        <CardContent className="p-4 flex items-center gap-2 text-sm text-amber-700">
          <ShieldAlert className="h-4 w-4" />
          Acesso restrito — apenas administradores podem disparar deploys.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              Deploy VPS — CentralDark
            </CardTitle>
            <CardDescription className="text-xs">
              Dispara o sync do Lovable → monorepo → build → Caddy.
            </CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={reload}
            aria-label="Atualizar histórico de deploys"
            disabled={loading}
          >
            <SyncStatusIcon
              status={loading ? "syncing" : running ? "loading" : "idle"}
              size={16}
              tooltipLabel={loading ? "Atualizando histórico…" : running ? "Disparando deploy…" : "Atualizar histórico"}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={runSync} disabled={running} className="gap-2">
            <Rocket className={cn("h-4 w-4", running && "animate-pulse")} />
            {running ? "Disparando…" : "Rodar sync agora"}
          </Button>
          <Button variant="outline" onClick={checkCron} disabled={checking} className="gap-2">
            <Terminal className={cn("h-4 w-4", checking && "animate-pulse")} />
            {checking ? "Verificando…" : "Verificar cron"}
          </Button>
          {lastCheckLog && (
            <Button variant="ghost" size="sm" onClick={() => setLogOpen((v) => !v)}>
              {logOpen ? "Fechar log" : "Ver log"}
            </Button>
          )}
        </div>

        {logOpen && lastCheckLog && (
          <pre className="text-[11px] leading-tight bg-muted/40 border border-border/40 rounded-lg p-3 max-h-60 overflow-auto whitespace-pre-wrap">
            {lastCheckLog}
          </pre>
        )}

        {showHistory && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Últimas execuções</div>
            <DeployHistoryList
              history={history.slice(0, historyLimit)}
              loading={loading}
              emptyText="Sem deploys ainda — clique em 'Rodar sync agora' pra testar."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
