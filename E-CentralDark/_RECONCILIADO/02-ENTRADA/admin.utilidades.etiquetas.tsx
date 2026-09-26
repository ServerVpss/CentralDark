import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListTags } from "@/lib/admin-utilidades.functions";
import { listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Download, Tag } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/utilidades/etiquetas")({ component: Page });

function Page() {
  const fn = useServerFn(adminListTags);
  const fnWs = useServerFn(listAllWorkspaces);
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-tags"], queryFn: () => fn() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const filtered = useMemo(() => data.filter((r: any) =>
    (ws === "all" || r.workspace_id === ws) && (!q || r.name.toLowerCase().includes(q.toLowerCase()))
  ), [data, ws, q]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="h-6 w-6" /> Etiquetas</h1>
          <p className="text-sm text-muted-foreground">Todas as etiquetas cadastradas em todos os workspaces.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv("etiquetas.csv", filtered)}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <AdminFilters workspaces={workspaces} workspaceId={ws} onWorkspace={setWs} search={q} onSearch={setQ} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Cor</th><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Criada em</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center"><div className="flex justify-center"><LoadingDots size="sm" /></div></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhuma etiqueta.</td></tr>}
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3"><span className="inline-block h-4 w-4 rounded-full border" style={{ background: r.color || "#94a3b8" }} /></td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDateTimeBR(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
