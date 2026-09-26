import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListChatbots, adminToggleChatbot, listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotList } from "@/components/chatbot/ChatbotList";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { Bot, Workflow, Download, Pause, Play } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/chatbots")({ component: Page });

function Page() {
  const fnList = useServerFn(adminListChatbots);
  const fnWs = useServerFn(listAllWorkspaces);
  const fnToggle = useServerFn(adminToggleChatbot);
  const qc = useQueryClient();
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");

  const { data = [], isLoading } = useQuery({ queryKey: ["admin-chatbots"], queryFn: () => fnList() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => fnToggle({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-chatbots"] }); toast.success("Atualizado"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const filtered = useMemo(() => data.filter((r) =>
    (ws === "all" || r.workspace_id === ws) &&
    (!q || r.name.toLowerCase().includes(q.toLowerCase()) || (r.workspace_name ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [data, ws, q]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chatbots / IA</h1>
        <p className="text-sm text-muted-foreground">Agentes IA e fluxos de resposta automática de todos os clientes.</p>
      </div>

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents"><Bot className="mr-2 h-4 w-4" /> Agentes IA</TabsTrigger>
          <TabsTrigger value="flows"><Workflow className="mr-2 h-4 w-4" /> Fluxos (todos)</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-6 space-y-4">
          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCsv("chatbots.csv", filtered)}>
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
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Temp</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
                {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum agente.</td></tr>}
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.workspace_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.model}</td>
                    <td className="px-4 py-3">{r.temperature}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.active ? "default" : "secondary"}>{r.active ? "Ativo" : "Pausado"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => toggle.mutate({ id: r.id, active: !r.active })}>
                        {r.active ? <><Pause className="mr-1 h-3 w-3" />Pausar</> : <><Play className="mr-1 h-3 w-3" />Ativar</>}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="flows" className="mt-6">
          <ChatbotList scope="admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
