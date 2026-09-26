import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListContacts, adminToggleContactBlock, listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { Ban, CheckCircle2, Download, History } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/contatos")({ component: Page });

function Page() {
  const fnList = useServerFn(adminListContacts);
  const fnWs = useServerFn(listAllWorkspaces);
  const fnBlock = useServerFn(adminToggleContactBlock);
  const qc = useQueryClient();
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");

  const { data = [], isLoading } = useQuery({ queryKey: ["admin-contacts"], queryFn: () => fnList() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const block = useMutation({
    mutationFn: (v: { id: string; blocked: boolean }) => fnBlock({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-contacts"] }); toast.success("Atualizado"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const filtered = useMemo(() => data.filter((r) =>
    (ws === "all" || r.workspace_id === ws) &&
    (!q || (r.name ?? "").toLowerCase().includes(q.toLowerCase()) || (r.phone ?? "").includes(q) || (r.email ?? "").includes(q))
  ), [data, ws, q]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contatos</h1>
          <p className="text-sm text-muted-foreground">Todos os contatos de todas as empresas. Bloqueie ou exporte.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv("contatos.csv", filtered)}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <AdminFilters workspaces={workspaces} workspaceId={ws} onWorkspace={setWs} search={q} onSearch={setQ} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Sobrenome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Etiqueta</th>
              <th className="px-4 py-3">Atendente</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Nenhum contato.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{(r as any).last_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{(r as any).label ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{(r as any).assignee_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.blocked ? "destructive" : "secondary"}>{r.blocked ? "Bloqueado" : "Ativo"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to="/admin/auditoria"
                      search={{ entity: "contacts", entityId: r.id, workspaceId: r.workspace_id }}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      title="Ver histórico deste contato"
                    >
                      <History className="h-3 w-3" /> Histórico
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => block.mutate({ id: r.id, blocked: !r.blocked })}>
                      {r.blocked ? <><CheckCircle2 className="mr-1 h-3 w-3" />Desbloquear</> : <><Ban className="mr-1 h-3 w-3" />Bloquear</>}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
