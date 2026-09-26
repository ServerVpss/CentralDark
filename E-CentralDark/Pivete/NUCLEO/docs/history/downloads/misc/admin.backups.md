# OUTRO - admin.backups.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\admin.backups.tsx
**SHA:** 75b9d39127aa9874
**Timestamp:** 2026-08-26T19:32:02.766540
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const lastRun = rows[0];
- run={lastRun}

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listBackupRuns,
  getBackupStats,
  requestManualBackup,
  markBackupDownloaded,
  getBackupDestination,
  setBackupDestination,
  getBackupSecretsStatus,
  setBackupSecret,
  clearBackupSecret,
} from "@/lib/backup.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingDots } from "@/components/ui/loading-dots";
import { EnergyBar } from "@/components/ui/energy-bar";
import { BackupLiveProgress } from "@/components/backups/backup-live-progress";

import { formatDateTimeBR } from "@/lib/datetime";
import { toast } from "sonner";
import { Database, HardDrive, Cloud, AlertTriangle, CheckCircle2, XCircle, Clock, Play, Download, Github, Server, Lock, Eye, EyeOff, Trash2, Save } from "lucide-react";


export const Route = createFileRoute("/admin/backups")({ component: BackupsPage });

function bytesHuman(n: number | null | undefined) {
  const v = Number(n || 0);
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  if (v < 1024 * 1024 * 1024) return `${(v / 1024 / 1024).toFixed(1)} MB`;
  return `${(v / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string; label: string; Icon: typeof CheckCircle2 }> = {
    success: { bg: "rgba(34,197,94,.15)", color: "#22c55e", label: "Sucesso", Icon: CheckCircle2 },
    error: { bg: "rgba(239,68,68,.15)", color: "#ef4444", label: "Erro", Icon: XCircle },
    running: { bg: "rgba(59,130,246,.15)", color: "#3b82f6", label: "Rodando", Icon: Clock },
    requested: { bg: "rgba(234,179,8,.15)", color: "#eab308", label: "Aguardando VPS", Icon: Clock },
  };
  const s = map[status] ?? { bg: "rgba(148,163,184,.15)", color: "#94a3b8", label: status, Icon: Clock };
  const Icon = s.Icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}

function BackupsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listBackupRuns);
  const statsFn = useServerFn(getBackupStats);
  const requestFn = useServerFn(requestManualBackup);
  const markFn = useServerFn(markBackupDownloaded);
  const getDestFn = useServerFn(getBackupDestination);
  const setDestFn = useServerFn(setBackupDestination);

  // Detecta se há backup ativo pra acelerar refetch (3s) — fora disso, 30s.
  const activePoll = 3_000;
  const idlePoll = 30_000;
  const [pollMs, setPollMs] = useState(idlePoll);

  const stats = useQuery({
    queryKey: ["backup-stats"],
    queryFn: () => statsFn({ data: undefined }),
    refetchInterval: pollMs,
  });

  const list = useQuery({
    queryKey: ["backup-runs"],
    queryFn: () => listFn({ data: { limit: 30 } }),
    refetchInterval: pollMs,
  });

  const dest = useQuery({
    queryKey: ["backup-destination"],
    queryFn: () => getDestFn({ data: undefined }),
  });

  const setDestM = useMutation({
    mutationFn: (destination: "github" | "b2" | "s3" | "local") =>
      setDestFn({ data: { destination } }),
    onSuccess: (_r, v) => {
      toast.success(`Destino alterado para ${v.toUpperCase()}. A VPS usa essa preferência na próxima execução.`);
      qc.invalidateQueries({ queryKey: ["backup-destination"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao trocar destino"),
  });


  const requestM = useMutation({
    mutationFn: () => requestFn({ data: undefined }),
    onSuccess: (r) => {
      if (r.alreadyPending) {
        toast.info("Já existe um backup pendente. Aguarde a VPS processar.");
      } else {
        toast.success("Backup solicitado! A VPS vai processar nos próximos minutos.");
      }
      qc.invalidateQueries({ queryKey: ["backup-runs"] });
      qc.invalidateQueries({ queryKey: ["backup-stats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao solicitar backup"),
  });

  const markM = useMutation({
    mutationFn: (id: string) => markFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backup-runs"] }),
  });

  if (stats.isLoading || list.isLoading) {
    return <EnergyBar fullscreen label="Carregando backups" sublabel="Sincronizando histórico da VPS" />;
  }

  const s = stats.data;
  const rows = list.data?.rows ?? [];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" /> Cópias de segurança
          </h1>
          <p 
```