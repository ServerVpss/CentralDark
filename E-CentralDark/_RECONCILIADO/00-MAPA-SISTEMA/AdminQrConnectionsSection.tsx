// Painel Master — seção que lista TODAS as conexões WhatsApp QR de todos os
// workspaces. Design intencionalmente sóbrio: tabela limpa, ações diretas,
// sem brilhos ou efeitos chamativos. A linguagem fala com o usuário final
// (operador master), em PT-BR claro.

import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Search,
  RefreshCw,
  PowerOff,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminListAllQrConnections,
  adminRestartQrConnectionMaster,
  adminLogoutQrConnectionMaster,
  adminDeleteQrConnectionMaster,
  adminRepairAllQrWebhooks,
  diagnoseMultizapGateway,
} from "@/lib/multizap-qr-admin.functions";
import { formatDateTimeBR } from "@/lib/datetime";
import { cn } from "@/lib/utils";

type Row = {
  connection_id: string;
  workspace_id: string | null;
  workspace_name: string | null;
  name: string | null;
  label: string | null;
  status: string;
  phone_number: string | null;
  last_connected_at: string | null;
  last_disconnected_at: string | null;
  created_at: string | null;
};

type ConfirmKind = "restart" | "logout" | "delete";

export function AdminQrConnectionsSection() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListAllQrConnections);
  const restartFn = useServerFn(adminRestartQrConnectionMaster);
  const logoutFn = useServerFn(adminLogoutQrConnectionMaster);
  const delFn = useServerFn(adminDeleteQrConnectionMaster);
  const repairAllFn = useServerFn(adminRepairAllQrWebhooks);
  const repairAllM = useMutation({
    mutationFn: () => repairAllFn(),
    onSuccess: (r) => {
      const total = r?.total ?? 0;
      const repaired = r?.repaired ?? 0;
      const failed = r?.failed ?? 0;
      if (failed === 0) {
        toast.success(`Recebimento reparado em ${repaired} de ${total} conexões.`);
      } else {
        toast.warning(`Reparadas ${repaired} de ${total}. ${failed} ainda com problema — veja detalhes no console.`);
        // eslint-disable-next-line no-console
        console.warn("[repair-all] details:", r?.details);
      }
      qc.invalidateQueries({ queryKey: ["admin", "qr-connections"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao reparar conexões."),
  });
  const diagnoseFn = useServerFn(diagnoseMultizapGateway);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; row: Row } | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-qr-connections"],
    queryFn: () => listFn(),
    refetchInterval: 20_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-qr-connections"] });

  const restartM = useMutation({
    mutationFn: (r: Row) =>
      restartFn({ data: { connection_id: r.connection_id, workspace_id: r.workspace_id } }),
    onSuccess: () => {
      toast.success("Sessão reconectada.");
      setConfirm(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const logoutM = useMutation({
    mutationFn: (r: Row) =>
      logoutFn({ data: { connection_id: r.connection_id, workspace_id: r.workspace_id } }),
    onSuccess: () => {
      toast.success("WhatsApp desconectado.");
      setConfirm(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (r: Row) =>
      delFn({ data: { connection_id: r.connection_id, workspace_id: r.workspace_id } }),
    onSuccess: () => {
      toast.success("Conexão removida.");
      setConfirm(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows: Row[] = (data?.connections ?? []) as Row[];
  const totals = data?.totals;
  const gatewayDown = data && data.gateway_up === false;
  const gatewayErr = (data as { gateway_error?: { kind: string; message: string; http_status: number | null; latency_ms: number } | null } | undefined)?.gateway_error ?? null;

  const diagM = useMutation({
    mutationFn: () => diagnoseFn(),
    onSuccess: (r) => {
      const where = r.url_masked ?? "(URL não configurada)";
      if (r.reachable) {
        toast.success(
          `Gateway ${where} respondeu em ${r.latency_ms}ms (HTTP ${r.http_status}). Tudo OK.`,
        );
        refresh();
      } else {
        toast.error(
          `Falha em ${where}: ${r.error?.message ?? "erro desconhecido"} (tipo: ${r.error?.kind}, ${r.latency_ms}ms)`,
          { duration: 8000 },
        );
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!term) return true;
      const blob = [
        r.workspace_name ?? "",
        r.workspace_id ?? "",
        r.name ?? "",
        r.label ?? "",
        r.phone_number ?? "",
        r.connection_id,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(term);
    });
  }, [rows, search, statusFilter]);

  const confirmText = confirm
    ? (
        {
          restart: {
            title: "Reconectar sessão deste número?",
            body:
              "Vou pedir pro Gateway desconectar e reiniciar a sessão. Preserva o pareamento (não pede QR novo). Demora ~5 a 15 segundos.",
            cta: "Reconectar agora",
            tone: "default" as const,
            pending: restartM.isPending,
            run: () => restartM.mutate(confirm.row),
          },
          logout: {
            title: "Desconectar este WhatsApp?",
            body:
              "O número vai sair do ar. Pra voltar, o cliente precisa abrir o WhatsApp dele e escanear o QR de novo.",
            cta: "Desconectar",
            tone: "destructive" as const,
            pending: logoutM.isPending,
            run: () => logoutM.mutate(confirm.row),
          },
          delete: {
            title: "Remover esta conexão?",
            body:
              "Vai apagar a sessão do Gateway. O cliente perde o vínculo e precisa criar uma nova conexão do zero.",
            cta: "Remover de vez",
            tone: "destructive" as const,
            pending: delM.isPending,
            run: () => delM.mutate(confirm.row),
          },
        } as const
      )[confirm.kind]
    : null;

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <QrCode className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp QR — todos os clientes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Conexões via QR Code (MultiZap Gateway). Aqui você vê, reinicia, desconecta
                ou remove qualquer número de qualquer empresa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => repairAllM.mutate()}
              disabled={repairAllM.isPending}
              title="Reaplica webhook e eventos em todas as conexões WuzAPI. Não gera QR novo."
            >
              {repairAllM.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <ShieldAlert className="mr-1.5 h-4 w-4" />
              )}
              Reparar recebimento (todas)
            </Button>
            <Button variant="outline" size="sm" onClick={refresh} disabled={isFetching}>
              <RefreshCw className={cn("mr-1.5 h-4 w-4", isFetching && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Totais — discreto, sem coloridos pesados */}
        {totals && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <StatChip label="Total" value={totals.total} />
            <StatChip label="Conectados" value={totals.connected} tone="emerald" />
            <StatChip label="Aguardando QR" value={totals.waiting_qr} tone="amber" />
            <StatChip label="Com erro" value={totals.error} tone="red" />
            <StatChip label="Desligados" value={totals.offline} tone="zinc" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {gatewayDown && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="font-medium">Não consegui falar com o MultiZap-Gateway agora.</p>
              {gatewayErr && (
                <p>
                  Motivo: <span className="font-mono">{gatewayErr.kind}</span>
                  {gatewayErr.http_status ? ` · HTTP ${gatewayErr.http_status}` : ""} · {gatewayErr.latency_ms}ms
                  <br />
                  <span className="text-amber-800/80">{gatewayErr.message}</span>
                </p>
              )}
              <div className="pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => diagM.mutate()}
                  disabled={diagM.isPending}
                >
                  {diagM.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Diagnosticar agora
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por empresa, número, nome ou ID…"
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-52">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="connected">Conectados</SelectItem>
              <SelectItem value="qr">Aguardando QR</SelectItem>
              <SelectItem value="error">Com erro</SelectItem>
              <SelectItem value="disconnected">Desligados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">Empresa</th>
                <th className="px-3 py-2.5">Número / Nome</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Última atividade</th>
                <th className="px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma conexão QR encontrada.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.connection_id} className="border-t">
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{r.workspace_name || "—"}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {r.workspace_id?.slice(0, 8) ?? "sem workspace"}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{r.phone_number || r.name || "Sem número"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.label || r.name || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {r.last_connected_at
                      ? `Conectou ${formatDateTimeBR(r.last_connected_at)}`
                      : r.last_disconnected_at
                        ? `Caiu ${formatDateTimeBR(r.last_disconnected_at)}`
                        : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Reconectar sessão (sem pedir QR novo)"
                        onClick={() => setConfirm({ kind: "restart", row: r })}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Desconectar WhatsApp"
                        onClick={() => setConfirm({ kind: "logout", row: r })}
                        disabled={r.status !== "connected"}
                      >
                        <PowerOff className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Remover conexão"
                        onClick={() => setConfirm({ kind: "delete", row: r })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Modal de confirmação — sóbrio, foco na frase */}
      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="max-w-md">
          {confirmText && confirm && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <ShieldAlert
                    className={cn(
                      "h-5 w-5",
                      confirmText.tone === "destructive" ? "text-destructive" : "text-amber-500",
                    )}
                  />
                  {confirmText.title}
                </DialogTitle>
                <DialogDescription className="pt-1">{confirmText.body}</DialogDescription>
              </DialogHeader>

              <div className="rounded-md border bg-muted/30 p-3 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Empresa</span>
                  <span className="font-medium">{confirm.row.workspace_name || "—"}</span>
                </div>
                <div className="mt-1.5 flex justify-between gap-2">
                  <span className="text-muted-foreground">Número</span>
                  <span className="font-medium">
                    {confirm.row.phone_number || confirm.row.name || "—"}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between gap-2">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-[11px]">{confirm.row.connection_id}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setConfirm(null)}>
                  Cancelar
                </Button>
                <Button
                  variant={confirmText.tone}
                  onClick={confirmText.run}
                  disabled={confirmText.pending}
                >
                  {confirmText.pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {confirmText.cta}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "amber" | "red" | "zinc";
}) {
  const toneCls =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : tone === "red"
          ? "text-red-600"
          : tone === "zinc"
            ? "text-zinc-500"
            : "text-foreground";
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <div className={cn("text-lg font-semibold tabular-nums", toneCls)}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    connected: { label: "Conectado", cls: "text-emerald-700 bg-emerald-500/10 border-emerald-500/30" },
    qr: { label: "Aguardando QR", cls: "text-amber-700 bg-amber-500/10 border-amber-500/30" },
    error: { label: "Com erro", cls: "text-red-700 bg-red-500/10 border-red-500/30" },
    disconnected: { label: "Desligado", cls: "text-zinc-600 bg-zinc-500/10 border-zinc-500/30" },
  };
  const it = map[status] || { label: status, cls: "text-zinc-600 bg-zinc-500/10 border-zinc-500/30" };
  return (
    <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-medium", it.cls)}>
      {it.label}
    </span>
  );
}
