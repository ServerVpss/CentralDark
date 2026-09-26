import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminAllTickets } from "@/lib/admin.functions";
import { History } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/tickets")({ component: AdminTickets });

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600",
  in_progress: "bg-amber-500/10 text-amber-600",
  waiting_client: "bg-purple-500/10 text-purple-600",
  resolved: "bg-emerald-500/10 text-emerald-600",
  closed: "bg-zinc-500/10 text-zinc-600",
};

function AdminTickets() {
  const fn = useServerFn(adminAllTickets);
  const { data, isLoading } = useQuery({ queryKey: ["admin-tickets"], queryFn: () => fn() });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Todos os Tickets</h1>
        <p className="text-sm text-muted-foreground">Últimos 100 tickets de todas as empresas.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Última mensagem</th><th className="px-4 py-3">Workspace</th>
              <th className="px-4 py-3">Aberto em</th>
              <th className="px-4 py-3 text-right">Auditoria</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
            {(data ?? []).map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status] ?? ""}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-xs">{t.priority}</td>
                <td className="px-4 py-3 max-w-md truncate">{t.last_message_preview ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{t.workspace_id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDateTimeBR(t.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/admin/auditoria"
                    search={{ entity: "tickets", entityId: t.id, workspaceId: t.workspace_id }}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    title="Ver tudo que aconteceu com este ticket"
                  >
                    <History className="h-3 w-3" /> Ver histórico
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
