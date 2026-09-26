import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageScaffold } from "@/components/page-scaffold";
import { Rocket, RefreshCw, RotateCcw, CheckCircle2, AlertTriangle, XCircle, SkipForward, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { formatDateTimeBR } from "@/lib/datetime";
import { LoadingDots } from "@/components/ui/loading-dots";
import {
  adminListDeploys,
  adminDeployStatus,
  adminDeployRollback,
  type DeployEntry,
} from "@/lib/admin-deploys.functions";

export const Route = createFileRoute("/admin/deploys")({ component: Page });

function Page() {
  return (
    <PageScaffold
      title="Master · Deploys"
      description="Histórico de atualizações do Gateway MultiZap (VPS). Veja status, rollback automático e desfaça versões."
      icon={Rocket}
    >
      <TooltipProvider delayDuration={200}>
        <div className="p-6 space-y-4">
          <LastRollbackBanner />
          <StatusCard />
          <DeploysTable />
        </div>
      </TooltipProvider>
    </PageScaffold>
  );
}

// Banner amarelo no topo se o último deploy foi rollback — alerta antes do próximo push.
function LastRollbackBanner() {
  const listFn = useServerFn(adminListDeploys);
  const { data } = useQuery({
    queryKey: ["admin-deploys"],
    queryFn: () => listFn({ data: { limit: 100 } }),
    refetchInterval: 15000,
  });
  const last = data?.deploys?.[0];
  if (!last) return null;
  const wasRollback = last.rollback || last.status === "rolled_back";
  if (!wasRollback) return null;
  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-4 py-3 text-sm flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">Última atualização foi revertida automaticamente.</p>
        <p className="text-xs opacity-90 mt-0.5">
          O deploy mais recente falhou no healthcheck/canário e o gateway voltou pra versão anterior. Investigue o motivo antes do próximo push pra não repetir o problema.
          {last.error && <> Motivo registrado: <span className="font-mono">{last.error}</span>.</>}
        </p>
      </div>
    </div>
  );
}

function StatusCard() {
  const qc = useQueryClient();
  const statusFn = useServerFn(adminDeployStatus);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-deploy-status"],
    queryFn: () => statusFn(),
    refetchInterval: 30000,
  });

  const outdated = (data as { gateway_outdated?: boolean } | undefined)?.gateway_outdated;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Versão atual no ar</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["admin-deploy-status"] });
            qc.invalidateQueries({ queryKey: ["admin-deploys"] });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingDots size="sm" label="Lendo gateway" />}
        {isError && (
          <p className="text-sm text-destructive">
            Não consegui falar com o gateway: {friendlyError(error as Error)}
          </p>
        )}
        {outdated && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
            ⚠️ O gateway na VPS ainda não foi atualizado com as rotas de deploy. Rode <code className="font-mono">multizap-gh-pull</code> na VPS pra ativar este painel.
          </p>
        )}
        {data && (
          <div className="grid gap-4 md:grid-cols-4 text-sm">
            <Field label="Commit no ar" value={shortHash(data.current_commit)} mono />
            <Field label="Última versão estável" value={shortHash(data.last_good_commit)} mono />
            <Field label="Uptime" value={formatUptime(data.uptime_s)} />
            <Field label="PID" value={String(data.pid)} mono />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeploysTable() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListDeploys);
  const rollbackFn = useServerFn(adminDeployRollback);
  const [rollbackTarget, setRollbackTarget] = useState<DeployEntry | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-deploys"],
    queryFn: () => listFn({ data: { limit: 100 } }),
    refetchInterval: 15000,
  });

  const rollbackM = useMutation({
    mutationFn: (commit: string) => rollbackFn({ data: { commit } }),
    onSuccess: () => {
      toast.success("Rollback disparado. A próxima atualização aparece em ~30s.");
      setRollbackTarget(null);
      setTimeout(() => qc.invalidateQueries({ queryKey: ["admin-deploys"] }), 5000);
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico de deploys</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingDots size="sm" label="Carregando histórico" />}
        {isError && (
          <p className="text-sm text-destructive">
            Falha lendo histórico: {friendlyError(error as Error)}
          </p>
        )}
        {data && data.deploys.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum deploy registrado ainda. Após o primeiro push, esta tabela enche.
          </p>
        )}
        {data && data.deploys.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Saúde</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.deploys.map((d) => {
                  const isCurrent = d.status === "success" && d.new_commit && d.new_commit === data.current_commit;
                  return (
                  <TableRow
                    key={d.id}
                    className={isCurrent ? "bg-emerald-500/10 hover:bg-emerald-500/15" : undefined}
                  >
                    <TableCell className="whitespace-nowrap text-xs">
                      {d.started_at ? formatDateTimeBR(d.started_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} rollback={d.rollback} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{shortHash(d.new_commit)}</TableCell>
                    <TableCell className="text-xs">{d.author ?? "—"}</TableCell>
                    <TableCell className="text-xs max-w-sm">
                      {d.message ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">{d.message}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md whitespace-pre-wrap break-words">
                            {d.message}
                          </TooltipContent>
                        </Tooltip>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{d.duration_s}s</TableCell>
                    <TableCell className="text-xs">
                      <HealthBadge health={d.health_ok} canary={d.canary_ok} />
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === "success" && d.new_commit && d.new_commit !== data.current_commit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRollbackTarget(d)}
                          disabled={rollbackM.isPending}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Voltar pra esta
                        </Button>
                      )}
                      {isCurrent && (
                        <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700">Versão atual</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!rollbackTarget} onOpenChange={(o) => !o && setRollbackTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voltar gateway pra esta versão?</AlertDialogTitle>
            <AlertDialogDescription>
              Vou desfazer o deploy atual e colocar a versão{" "}
              <span className="font-mono">{shortHash(rollbackTarget?.new_commit ?? null)}</span>{" "}
              no ar. O gateway reinicia (~10s de instabilidade). Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rollbackTarget?.new_commit && rollbackM.mutate(rollbackTarget.new_commit)}
            >
              Confirmar rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// --- helpers de UI ----------------------------------------------------------

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
    </div>
  );
}

function StatusBadge({ status, rollback }: { status: DeployEntry["status"]; rollback: boolean }) {
  if (rollback || status === "rolled_back") {
    return (
      <Badge variant="destructive" className="gap-1">
        <RotateCcw className="h-3 w-3" /> Rollback
      </Badge>
    );
  }
  if (status === "success") {
    return (
      <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Sucesso
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" /> Falhou
      </Badge>
    );
  }
  if (status === "skipped") {
    return (
      <Badge variant="secondary" className="gap-1">
        <SkipForward className="h-3 w-3" /> Sem mudança
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <AlertTriangle className="h-3 w-3" /> {status}
    </Badge>
  );
}

function HealthBadge({ health, canary }: { health: DeployEntry["health_ok"]; canary: DeployEntry["canary_ok"] }) {
  const parts: string[] = [];
  if (health === "true") parts.push("✓ saúde");
  else if (health === "false") parts.push("✗ saúde");
  if (canary === "true") parts.push("✓ canário");
  else if (canary === "false") parts.push("✗ canário");
  else if (canary === "skipped") parts.push("canário off");
  return <span className="text-xs">{parts.join(" · ") || "—"}</span>;
}

function shortHash(hash: string | null): string {
  if (!hash) return "—";
  return hash.slice(0, 8);
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}
