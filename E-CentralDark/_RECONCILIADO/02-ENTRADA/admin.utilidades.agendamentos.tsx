import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListSchedules } from "@/lib/admin-utilidades.functions";
import { listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/utilidades/agendamentos")({ component: Page });

function Page() {
  const fn = useServerFn(adminListSchedules);
  const fnWs = useServerFn(listAllWorkspaces);
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-schedules"], queryFn: () => fn() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const filtered = useMemo(() => data.filter((r: any) =>
    (ws === "all" || r.workspace_id === ws) && (!q || r.title.toLowerCase().includes(q.toLowerCase()))
  ), [data, ws, q]);

  const tone = (s: string) => s === "done" ? "secondary" : s === "cancelled" ? "destructive" : "outline";
  const label = (s: string) => ({ pending: "Pendente", done: "Concluído", cancelled: "Cancelado" }[s] ?? s);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6" /> Agendamentos</h1>
          <p className="text-sm text-muted-foreground">Agendamentos e tarefas de todos os workspaces.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv("agendamentos.csv", filtered)}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <AdminFilters workspaces={workspaces} workspaceId={ws} onWorkspace={setWs} search={q} onSearch={setQ} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Título</th><th className="px-4 py-3">Quando</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Empresa</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center"><div className="flex justify-center"><LoadingDots size="sm" /></div></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhum agendamento.</td></tr>}
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDateTimeBR(r.scheduled_at)}</td>
                <td className="px-4 py-3"><Badge variant={tone(r.status) as any}>{label(r.status)}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
