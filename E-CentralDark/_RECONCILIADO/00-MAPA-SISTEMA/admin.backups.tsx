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
          <p className="text-sm text-muted-foreground mt-1">
            Tudo do MultiZap salvo num lugar só, dividido em <strong>3 pastas</strong>: banco de dados, site e servidor do WhatsApp.
            Roda sozinho todo dia às 04h.
          </p>
        </div>
        <Button onClick={() => requestM.mutate()} disabled={requestM.isPending} className="gap-2">
          <Play className="h-4 w-4" />
          {requestM.isPending ? "Iniciando..." : "Fazer cópia agora"}
        </Button>
      </div>

      {/* Assistente: como a cópia é organizada e em que ordem é instalada */}
      <InstallWizard running={requestM.isPending || rows.some((r: any) => r.status === "running" || r.status === "requested")} />

      {/* Acompanhamento em tempo real */}
      {(() => {
        const lastRun = rows[0];
        const hasActive =
          requestM.isPending ||
          rows.some((r: any) => r.status === "running" || r.status === "requested");
        // ajusta polling: rápido quando há ação, lento quando ocioso
        if (hasActive && pollMs !== activePoll) setPollMs(activePoll);
        if (!hasActive && pollMs !== idlePoll) setPollMs(idlePoll);

        // Mostra o painel grande sempre que houver uma execução visível
        // (ativa OU recém terminada — para o usuário ver o resultado final)
        const showFinalFor =
          lastRun &&
          (lastRun.status === "success" || lastRun.status === "error") &&
          lastRun.finished_at &&
          Date.now() - new Date(lastRun.finished_at).getTime() < 60_000;

        if (!hasActive && !showFinalFor) return null;

        return (
          <BackupLiveProgress
            run={lastRun}
            isPendingClick={requestM.isPending}
            destination={dest.data?.destination}
          />
        );
      })()}



      {s?.consecutiveFailures && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Atenção:</strong> os 2 últimos backups falharam. Verifique o log na VPS:
            <code className="ml-1 px-1.5 py-0.5 rounded bg-background text-xs">tail -100 /var/log/multizap-backup.log</code>
          </div>
        </div>
      )}

      {/* Seletor de destino do backup */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Destino dos backups</h2>
          {dest.data && (
            <span className="text-xs text-muted-foreground ml-auto">
              Atual: <strong className="text-foreground">{dest.data.destination.toUpperCase()}</strong>
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Escolha onde a VPS vai enviar cada backup. A mudança vale a partir da próxima execução.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "github", label: "GitHub", desc: "Releases privados (recomendado agora)", Icon: Github, ready: true },
            { id: "b2", label: "Backblaze B2", desc: "≈ R$ 0,03/GB/mês (futuro)", Icon: Cloud, ready: false },
            { id: "s3", label: "AWS S3", desc: "Glacier para arquivar (futuro)", Icon: Cloud, ready: false },
            { id: "local", label: "Só VPS", desc: "Sem upload remoto", Icon: Server, ready: true },
          ].map((opt) => {
            const Icon = opt.Icon;
            const active = dest.data?.destination === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setDestM.mutate(opt.id as any)}
                disabled={setDestM.isPending}
                className={`text-left rounded-md border p-3 transition ${
                  active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"
                } ${setDestM.isPending ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto" />}
                  {!opt.ready && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      em breve
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Os segredos (token, repo, senha) ficam no cofre abaixo — nunca no <code>.env</code> da VPS.
        </p>
      </div>

      {/* Cofre de credenciais */}
      <SecretsVault />




      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Último backup"
          value={s?.last ? formatDateTimeBR(s.last.started_at) : "Nenhum"}
          sub={s?.last ? statusBadge(s.last.status) : "—"}
          Icon={Clock}
        />
        <StatCard
          title="Último sucesso"
          value={s?.lastSuccess ? formatDateTimeBR(s.lastSuccess.started_at) : "Nunca"}
          sub={s?.lastSuccess ? bytesHuman(s.lastSuccess.size_bytes) : "—"}
          Icon={CheckCircle2}
        />
        <StatCard
          title="Sucessos / Erros (7d)"
          value={`${s?.successLast7 ?? 0} ✓ / ${s?.errorLast7 ?? 0} ✗`}
          sub="últimos 7 dias"
          Icon={HardDrive}
        />
        <StatCard
          title="Total armazenado (7d)"
          value={bytesHuman(s?.totalSizeLast7)}
          sub="soma dos backups da semana"
          Icon={Cloud}
        />
      </div>

      {/* Histórico */}
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold">Histórico (últimos 30)</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              qc.invalidateQueries({ queryKey: ["backup-runs"] });
              qc.invalidateQueries({ queryKey: ["backup-stats"] });
            }}
          >
            Atualizar
          </Button>
        </div>
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum backup ainda. Clique em "Rodar backup agora" ou aguarde a execução automática das 04:00.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Início</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Origem</th>
                  <th className="text-left p-3">Duração</th>
                  <th className="text-left p-3">Tamanho total</th>
                  <th className="text-left p-3">Banco</th>
                  <th className="text-left p-3">Mídias</th>
                  <th className="text-left p-3">Sessões</th>
                  <th className="text-left p-3">Nuvem</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="border-t hover:bg-muted/20">
                    <td className="p-3 whitespace-nowrap">{formatDateTimeBR(r.started_at)}</td>
                    <td className="p-3">{statusBadge(r.status)}</td>
                    <td className="p-3 text-xs">{r.trigger_source}</td>
                    <td className="p-3 text-xs">
                      {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td className="p-3">{bytesHuman(r.size_bytes)}</td>
                    <td className="p-3 text-xs">{bytesHuman(r.db_size_bytes)}</td>
                    <td className="p-3 text-xs">{bytesHuman(r.media_size_bytes)}</td>
                    <td className="p-3 text-xs">{bytesHuman(r.sessions_size_bytes)}</td>
                    <td className="p-3">
                      {r.cloud_uploaded ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 text-xs">
                          <Cloud className="h-3 w-3" /> {r.cloud_location || "OK"}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {r.status === "success" && r.file_path && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(r.file_path);
                            markM.mutate(r.id);
                            toast.success(
                              `Caminho copiado. Baixe via SSH: scp root@VPS:${r.file_path} ~/Downloads/`,
                              { duration: 8000 },
                            );
                          }}
                          className="gap-1 text-xs"
                        >
                          <Download className="h-3 w-3" /> Caminho
                        </Button>
                      )}
                      {r.error_message && (
                        <span title={r.error_message} className="text-xs text-red-400">
                          {r.error_message.slice(0, 40)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
        <p><strong>Onde fica salvo:</strong> tudo na pasta <code>/root/backups/multizap/&lt;data&gt;/</code>, dividida em <code>banco/</code>, <code>site/</code> e <code>servidor/</code>.</p>
        <p><strong>Quando roda:</strong> automaticamente todo dia às 04h, e a qualquer momento pelo botão acima.</p>
        <p><strong>Para restaurar:</strong> veja o guia em <code>docs/BACKUP_RESTORE.md</code>.</p>
      </div>
    </div>
  );
}

// ───────────── Assistente de instalação (3 etapas) ─────────────

function InstallWizard({ running }: { running: boolean }) {
  const steps = [
    {
      n: 1,
      title: "Banco de dados",
      desc: "Salva todas as conversas, contatos e configurações.",
      folder: "banco/",
      Icon: Database,
      color: "#22c55e",
    },
    {
      n: 2,
      title: "Site (painel)",
      desc: "O painel mora na nuvem — guardamos só a referência pra republicar pelo GitHub.",
      folder: "site/",
      Icon: Cloud,
      color: "#3b82f6",
    },
    {
      n: 3,
      title: "Servidor do WhatsApp",
      desc: "Código do servidor que fica na VPS conectando o WhatsApp.",
      folder: "servidor/",
      Icon: Server,
      color: "#a855f7",
    },
  ];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Play className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-sm">Como sua cópia é organizada</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          pasta única → 3 subpastas → ordem de instalação
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((s, i) => {
          const Icon = s.Icon;
          return (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-md border bg-background/40 p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="h-6 w-6 rounded-full grid place-items-center text-xs font-bold"
                  style={{ background: `${s.color}22`, color: s.color }}
                >
                  {s.n}
                </span>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
                <span className="font-semibold text-sm">{s.title}</span>
                {running && (
                  <motion.span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: s.color }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{s.desc}</p>
              <code className="text-[11px] px-1.5 py-0.5 rounded bg-muted">{s.folder}</code>
            </motion.div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Quando você for restaurar, o sistema instala nessa mesma ordem: <strong>1º banco</strong>, <strong>2º site</strong>, <strong>3º servidor do WhatsApp</strong>.
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  Icon,
}: {
  title: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  Icon: typeof Database;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

// ───────────── Cofre de credenciais ─────────────

type SecretStatus = { set: boolean; mask: string | null; inherited?: boolean; source?: string };
type SecretsStatusMap = Record<string, SecretStatus> & { updated_at?: string };

const SECRET_FIELDS: Array<{
  key: string;
  label: string;
  hint: string;
  type: "password" | "text";
  group: "github" | "crypto" | "b2" | "s3";
}> = [
  { key: "github_token",          label: "GitHub Token (PAT)",         hint: "Personal Access Token com Contents: read & write",                          type: "password", group: "github" },
  { key: "github_repo",           label: "GitHub Repo",                hint: "Ex.: segredounlock/multizap-backups",                                       type: "text",     group: "github" },
  { key: "encryption_password",   label: "Senha de criptografia",      hint: "AES-256 dos arquivos. Guarde OFFLINE — sem ela não dá pra restaurar.",     type: "password", group: "crypto" },
  { key: "b2_key_id",             label: "B2 Key ID",                  hint: "Backblaze B2 — futuro",                                                     type: "password", group: "b2" },
  { key: "b2_application_key",    label: "B2 Application Key",         hint: "Backblaze B2 — futuro",                                                     type: "password", group: "b2" },
  { key: "b2_bucket_name",        label: "B2 Bucket",                  hint: "Backblaze B2 — futuro",                                                     type: "text",     group: "b2" },
  { key: "aws_s3_bucket",         label: "S3 Bucket",                  hint: "AWS S3 — futuro",                                                           type: "text",     group: "s3" },
  { key: "aws_access_key_id",     label: "AWS Access Key ID",          hint: "AWS S3 — futuro",                                                           type: "password", group: "s3" },
  { key: "aws_secret_access_key", label: "AWS Secret Access Key",      hint: "AWS S3 — futuro",                                                           type: "password", group: "s3" },
];

function SecretsVault() {
  const qc = useQueryClient();
  const getFn = useServerFn(getBackupSecretsStatus);
  const setFn = useServerFn(setBackupSecret);
  const clearFn = useServerFn(clearBackupSecret);

  const status = useQuery({
    queryKey: ["backup-secrets-status"],
    queryFn: () => getFn({ data: undefined }),
  });

  const saveM = useMutation({
    mutationFn: (p: { key: string; value: string }) => setFn({ data: p as any }),
    onSuccess: (_d, v) => {
      toast.success(`${v.key} salvo com segurança no cofre.`);
      qc.invalidateQueries({ queryKey: ["backup-secrets-status"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const clearM = useMutation({
    mutationFn: (key: string) => clearFn({ data: { key: key as any } }),
    onSuccess: (_d, key) => {
      toast.success(`${key} removido do cofre.`);
      qc.invalidateQueries({ queryKey: ["backup-secrets-status"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao limpar"),
  });

  const groups: Array<{ id: "github" | "crypto" | "b2" | "s3"; title: string; defaultOpen: boolean }> = [
    { id: "github", title: "GitHub", defaultOpen: true },
    { id: "crypto", title: "Criptografia (obrigatório)", defaultOpen: true },
    { id: "b2", title: "Backblaze B2 (futuro)", defaultOpen: false },
    { id: "s3", title: "AWS S3 (futuro)", defaultOpen: false },
  ];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-emerald-500" />
        <h2 className="font-semibold text-sm">Cofre de credenciais</h2>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">criptografado no banco</span>
        {status.data?.status?.updated_at && (
          <span className="text-xs text-muted-foreground ml-auto">
            atualizado em {formatDateTimeBR(status.data.status.updated_at)}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Tudo que você salvar aqui vai direto pro banco com RLS travada. A chave nunca volta pro navegador —
        a VPS busca via endpoint autenticado pelo <code>CRON_SECRET</code> no momento do backup.
      </p>

      {status.isLoading ? (
        <div className="py-4"><LoadingDots /></div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const fields = SECRET_FIELDS.filter((f) => f.group === g.id);
            return (
              <SecretGroup
                key={g.id}
                title={g.title}
                defaultOpen={g.defaultOpen}
                fields={fields}
                statusMap={status.data?.status ?? {}}
                onSave={(key, value) => saveM.mutate({ key, value })}
                onClear={(key) => clearM.mutate(key)}
                pending={saveM.isPending || clearM.isPending}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SecretGroup({
  title,
  defaultOpen,
  fields,
  statusMap,
  onSave,
  onClear,
  pending,
}: {
  title: string;
  defaultOpen: boolean;
  fields: typeof SECRET_FIELDS;
  statusMap: SecretsStatusMap;
  onSave: (key: string, value: string) => void;
  onClear: (key: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border bg-background/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted/30"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
        {title}
        <span className="ml-auto text-xs text-muted-foreground">
          {fields.filter((f) => statusMap[f.key]?.set).length}/{fields.length} preenchidos
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2">
              {fields.map((f) => (
                <SecretRow
                  key={f.key}
                  field={f}
                  status={statusMap[f.key] ?? { set: false, mask: null }}
                  onSave={(v) => onSave(f.key, v)}
                  onClear={() => onClear(f.key)}
                  pending={pending}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SecretRow({
  field,
  status,
  onSave,
  onClear,
  pending,
}: {
  field: (typeof SECRET_FIELDS)[number];
  status: SecretStatus;
  onSave: (value: string) => void;
  onClear: () => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const isPassword = field.type === "password";
  return (
    <div className="rounded border bg-card/60 p-2.5 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs font-medium">{field.label}</label>
        {status.inherited ? (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">
            <Github className="h-3 w-3" /> herdado da integração GitHub
          </span>
        ) : status.set ? (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> configurado
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">vazio</span>
        )}
        {status.set && status.mask && (
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">{status.mask}</span>
        )}
      </div>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Input
            type={isPassword && !show ? "password" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={status.set ? "Digite pra substituir…" : field.hint}
            className="h-8 text-xs pr-8"
            autoComplete="off"
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => { if (value.trim()) { onSave(value.trim()); setValue(""); } }}
          disabled={pending || !value.trim()}
          className="h-8 gap-1 text-xs"
        >
          <Save className="h-3 w-3" /> Salvar
        </Button>
        {status.set && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { if (confirm(`Remover ${field.label} do cofre?`)) onClear(); }}
            disabled={pending}
            className="h-8 text-xs"
            title="Limpar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {status.inherited
          ? "Reutilizando o valor já configurado em Integração GitHub. Salve aqui só se quiser sobrescrever só para os backups."
          : field.hint}
      </p>
    </div>
  );
}


