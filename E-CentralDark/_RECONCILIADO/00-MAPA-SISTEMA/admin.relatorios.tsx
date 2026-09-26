import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGlobalReports, adminPerWorkspaceMetrics } from "@/lib/admin.functions";
import { TicketsReport, SatisfactionReport } from "@/components/reports/ReportsCharts";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/relatorios")({ component: Page });

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

function Page() {
  const fnG = useServerFn(adminGlobalReports);
  const fnPer = useServerFn(adminPerWorkspaceMetrics);
  const { data: g } = useQuery({ queryKey: ["admin-global-reports"], queryFn: () => fnG(), refetchInterval: 30_000 });
  const { data: per = [] } = useQuery({ queryKey: ["admin-per-ws"], queryFn: () => fnPer() });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Relatórios Globais</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="tickets">Atendimentos</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="per_ws">Por empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Mensagens (24h)" value={g?.messages_24h ?? "—"} />
            <Stat label="Mensagens (7d)" value={g?.messages_7d ?? "—"} />
            <Stat label="WhatsApp enviados (24h)" value={g?.whatsapp_sent_24h ?? "—"} />
            <Stat label="Tickets abertos" value={g?.open_tickets ?? "—"} />
            <Stat label="WhatsApps online" value={`${g?.whatsapp_online ?? 0}/${g?.whatsapp_total ?? 0}`} />
            <Stat label="Agentes IA ativos" value={`${g?.ai_agents_active ?? 0}/${g?.ai_agents_total ?? 0}`} />
          </div>
        </TabsContent>

        <TabsContent value="tickets"><TicketsReport scope="admin" /></TabsContent>
        <TabsContent value="satisfaction"><SatisfactionReport scope="admin" /></TabsContent>

        <TabsContent value="per_ws">
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Por empresa</h2>
              <p className="text-xs text-muted-foreground">Visão consolidada de cada workspace.</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3 text-right">Tickets</th>
                  <th className="px-4 py-3 text-right">Mensagens</th>
                  <th className="px-4 py-3 text-right">Contatos</th>
                  <th className="px-4 py-3 text-right">WhatsApps</th>
                  <th className="px-4 py-3 text-right">Agentes IA</th>
                </tr>
              </thead>
              <tbody>
                {per.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-right">{r.tickets}</td>
                    <td className="px-4 py-3 text-right">{r.messages}</td>
                    <td className="px-4 py-3 text-right">{r.contacts}</td>
                    <td className="px-4 py-3 text-right">{r.whatsapp}</td>
                    <td className="px-4 py-3 text-right">{r.agents}</td>
                  </tr>
                ))}
                {!per.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Sem dados.</td></tr>}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
