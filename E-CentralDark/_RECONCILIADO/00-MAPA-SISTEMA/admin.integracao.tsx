import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListWebhooks } from "@/lib/admin-utilidades.functions";
import { listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Plug, Github } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";
import { GithubDeployPanel } from "@/components/admin/github-deploy-panel";

import { formatDateTimeBR } from "@/lib/datetime";

export const Route = createFileRoute("/admin/integracao")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) || "webhooks",
  }),
  component: Page,
});


function Page() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const fn = useServerFn(adminListWebhooks);
  const fnWs = useServerFn(listAllWorkspaces);
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-integrations"], queryFn: () => fn() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const webhooks = data?.webhooks ?? [];
  const tokens = data?.tokens ?? [];
  const deliveries = data?.deliveries ?? [];

  const f = <T extends { workspace_id: string; workspace_name?: string }>(arr: T[], key: keyof T = "workspace_name" as any) => arr.filter((r) =>
    (ws === "all" || r.workspace_id === ws) && (!q || String(r[key] ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  const fw = f(webhooks);
  const ft = f(tokens);
  const fd = f(deliveries);

  const isGithub = tab === "github";

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Plug className="h-6 w-6" /> Integrações</h1>
          <p className="text-sm text-muted-foreground">Webhooks, tokens de API, entregas e deploy do sistema.</p>
        </div>
      </div>
      {!isGithub && (
        <AdminFilters workspaces={workspaces} workspaceId={ws} onWorkspace={setWs} search={q} onSearch={setQ} />
      )}
      <Tabs
        value={tab}
        onValueChange={(v) => navigate({ search: { tab: v } as any, replace: true })}
      >
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks ({fw.length})</TabsTrigger>
          <TabsTrigger value="tokens">Tokens ({ft.length})</TabsTrigger>
          <TabsTrigger value="deliveries">Entregas ({fd.length})</TabsTrigger>
          <TabsTrigger value="github" className="gap-1.5">
            <Github className="h-3.5 w-3.5" /> GitHub / Deploy VPS
          </TabsTrigger>
        </TabsList>

        {isLoading && !isGithub ? (
          <div className="flex justify-center py-12"><LoadingDots size="sm" /></div>
        ) : (
          <Fragment>


          <TabsContent value="webhooks" className="space-y-3">
            <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => exportCsv("webhooks.csv", fw)}><Download className="mr-2 h-4 w-4" /> CSV</Button></div>
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">URL</th><th className="px-4 py-3">Eventos</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Empresa</th></tr>
                </thead>
                <tbody>
                  {fw.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum webhook.</td></tr>}
                  {fw.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs max-w-xs truncate">{r.target_url}</td>
                      <td className="px-4 py-3 text-muted-foreground">{(r.events ?? []).length}</td>
                      <td className="px-4 py-3"><Badge variant={r.active ? "secondary" : "outline"}>{r.active ? "Ativo" : "Pausado"}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-3">
            <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => exportCsv("tokens.csv", ft)}><Download className="mr-2 h-4 w-4" /> CSV</Button></div>
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Prefixo</th><th className="px-4 py-3">Escopos</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Último uso</th><th className="px-4 py-3">Empresa</th></tr>
                </thead>
                <tbody>
                  {ft.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum token.</td></tr>}
                  {ft.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.token_prefix}…</td>
                      <td className="px-4 py-3 text-muted-foreground">{(r.scopes ?? []).join(", ")}</td>
                      <td className="px-4 py-3"><Badge variant={r.revoked ? "destructive" : "secondary"}>{r.revoked ? "Revogado" : "Ativo"}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.last_used_at ? formatDateTimeBR(r.last_used_at) : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-3">
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="px-4 py-3">Quando</th><th className="px-4 py-3">Evento</th><th className="px-4 py-3">HTTP</th><th className="px-4 py-3">Latência</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Empresa</th></tr>
                </thead>
                <tbody>
                  {fd.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhuma entrega registrada.</td></tr>}
                  {fd.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTimeBR(r.created_at)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.event}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.http_status ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.latency_ms != null ? `${r.latency_ms}ms` : "—"}</td>
                      <td className="px-4 py-3"><Badge variant={r.status === "success" ? "secondary" : r.status === "failed" ? "destructive" : "outline"}>{r.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="github" className="space-y-3">
            <GithubDeployPanel />
          </TabsContent>
          </Fragment>
        )}
      </Tabs>
    </div>

  );
}
