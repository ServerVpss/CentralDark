import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListRandomGroups } from "@/lib/admin-utilidades.functions";
import { listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Shuffle } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/utilidades/mensagens-aleatorias")({ component: Page });

function Page() {
  const fn = useServerFn(adminListRandomGroups);
  const fnWs = useServerFn(listAllWorkspaces);
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-random-groups"], queryFn: () => fn() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const filtered = useMemo(() => data.filter((r: any) =>
    (ws === "all" || r.workspace_id === ws) && (!q || r.name.toLowerCase().includes(q.toLowerCase()))
  ), [data, ws, q]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shuffle className="h-6 w-6" /> Mensagens Aleatórias</h1>
          <p className="text-sm text-muted-foreground">Grupos de variações cadastrados em todos os workspaces.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv("mensagens-aleatorias.csv", filtered)}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <AdminFilters workspaces={workspaces} workspaceId={ws} onWorkspace={setWs} search={q} onSearch={setQ} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Grupo</th><th className="px-4 py-3">Variações</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Criado em</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center"><div className="flex justify-center"><LoadingDots size="sm" /></div></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum grupo.</td></tr>}
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.variants_count}</td>
                <td className="px-4 py-3"><Badge variant={r.active ? "secondary" : "outline"}>{r.active ? "Ativo" : "Inativo"}</Badge></td>
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
