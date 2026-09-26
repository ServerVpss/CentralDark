import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListWorkspacesWithControls } from "@/lib/admin-controls.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, PauseCircle } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/workspaces")({ component: AdminWorkspaces });

function statusBadge(c: any) {
  if (!c) return <Badge variant="secondary">—</Badge>;
  if (c.is_paused) return <Badge variant="destructive"><PauseCircle className="h-3 w-3 mr-1" />Pausada</Badge>;
  if (c.subscription_status === "suspended") return <Badge variant="destructive">Suspensa</Badge>;
  if (c.subscription_status === "expired") return <Badge variant="destructive">Vencida</Badge>;
  if (c.subscription_status === "past_due") return <Badge className="bg-amber-500 text-white">Em atraso</Badge>;
  if (c.subscription_status === "trialing") return <Badge variant="outline">Em teste</Badge>;
  return <Badge className="bg-emerald-500 text-white">Ativa</Badge>;
}

function AdminWorkspaces() {
  const fn = useServerFn(adminListWorkspacesWithControls);
  const { data, isLoading } = useQuery({ queryKey: ["admin-workspaces-controls"], queryFn: () => fn() });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Empresas (Workspaces)</h1>
        <p className="text-sm text-muted-foreground">Todas as empresas. Acesse "Controles" para pausar, bloquear ou avisar.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bloqueios ativos</th>
              <th className="px-4 py-3">Criada</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
            {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhuma empresa.</td></tr>}
            {(data ?? []).map((w: any) => {
              const c = w.controls;
              const blocks = c
                ? [
                    c.block_whatsapp_send && "WhatsApp",
                    c.block_ai && "IA",
                    c.block_campaigns && "Campanhas",
                    c.block_new_signups && "Cadastros",
                  ].filter(Boolean) as string[]
                : [];
              return (
                <tr key={w.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{w.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.slug}</td>
                  <td className="px-4 py-3">{statusBadge(c)}</td>
                  <td className="px-4 py-3">
                    {blocks.length === 0
                      ? <span className="text-xs text-muted-foreground">—</span>
                      : <div className="flex flex-wrap gap-1">{blocks.map((b) => <Badge key={b} variant="outline" className="text-xs">{b}</Badge>)}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateBR(w.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/workspaces/$workspaceId/controles" params={{ workspaceId: w.id }}>
                      <Button size="sm" variant="outline"><Settings className="mr-1 h-3.5 w-3.5" /> Controles</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
