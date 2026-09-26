# COMANDO - AdminQrConnectionsSection.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\admin\AdminQrConnectionsSection.tsx
**SHA:** 1e6155d3990f0b89
**Timestamp:** 2026-08-26T19:31:35.946275
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- restart: {
- run: () => restartM.mutate(confirm.row),
- run: () => logoutM.mutate(confirm.row),
- run: () => delM.mutate(confirm.row),

### Ouro Bruto (primeiros 5000 chars)
```
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
          `
```