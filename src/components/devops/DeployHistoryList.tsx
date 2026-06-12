import { CheckCircle2, XCircle, Loader2, GitCommit } from "lucide-react";
import { DeployRow } from "@/hooks/useVpsDeploy";
import { cn } from "@/lib/utils";

interface Props {
  history: DeployRow[];
  loading?: boolean;
  emptyText?: string;
}

function fmt(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return d;
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: any; cls: string; label: string }> = {
    success: { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Sucesso" },
    error: { icon: XCircle, cls: "text-rose-600 bg-rose-50 border-rose-200", label: "Erro" },
    running: { icon: Loader2, cls: "text-amber-600 bg-amber-50 border-amber-200 [&_svg]:animate-spin", label: "Rodando" },
  };
  const cfg = map[status] ?? map.running;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium", cfg.cls)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export function DeployHistoryList({ history, loading, emptyText }: Props) {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando histórico…</div>;
  }
  if (!history.length) {
    return (
      <div className="text-sm text-muted-foreground">
        {emptyText ?? "Nenhum deploy registrado ainda."}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border/40">
      {history.map((h) => (
        <li key={h.id} className="py-2 flex items-center gap-3 text-sm">
          <StatusBadge status={h.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-foreground">
              <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-xs truncate">
                {h.commit_hash?.slice(0, 8) ?? h.workflow_run_id ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground">· {h.environment}</span>
            </div>
            {h.log_summary && (
              <div className="text-xs text-muted-foreground truncate">{h.log_summary}</div>
            )}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {fmt(h.started_at)}
          </div>
        </li>
      ))}
    </ul>
  );
}
