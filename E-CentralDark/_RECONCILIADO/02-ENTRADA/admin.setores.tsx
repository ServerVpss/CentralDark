import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListSectors, listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/setores")({ component: Page });

function Page() {
  const fnList = useServerFn(adminListSectors);
  const fnWs = useServerFn(listAllWorkspaces);
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-sectors"], queryFn: () => fnList() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const filtered = useMemo(() => data.filter((r) =>
    (ws === "all" || r.workspace_id === ws) && (!q || r.name.toLowerCase().includes(q.toLowerCase()))
  ), [data, ws, q]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Setores</h1>
          <p className="text-sm text-muted-foreground">Setores criados em cada empresa.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv("setores.csv", filtered)}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <AdminFilters workspaces={workspaces} workspaceId={ws} onWorkspace={setWs} search={q} onSearch={setQ} />
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Cor</th>
              <th className="px-4 py-3">Criado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhum setor.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
                <td className="px-4 py-3">
                  <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: r.color ?? "#888" }} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDateBR(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
