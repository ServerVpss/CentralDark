import { useEffect, useState, useCallback } from "react";
import { RefreshCw, KeyRound, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { OverviewTab } from "@/components/OverviewTab";
import { ToolsTab } from "@/components/ToolsTab";
import { AuditTab } from "@/components/AuditTab";
import { OAuthClientsTab } from "@/components/OAuthClientsTab";
import { ConnectorTab } from "@/components/ConnectorTab";
import { KeysTab } from "@/components/KeysTab";
import { api, type ToolsResponse, type HealthResponse, type HealthDeepResponse } from "@/lib/api";

// Página principal do painel — header + 6 cards de métrica + abas.
// Métricas reais consumidas de /admin/api/tools, /health e /health/deep
// (todos endpoints já existentes no backend, ver apps/modulos/mcp/src/{index,admin,health-deep}.js).
export default function AdminPage({ onLogout }: { onLogout: () => void }) {
  const [tools, setTools] = useState<ToolsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthDeep, setHealthDeep] = useState<HealthDeepResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    setRefreshing(true);
    const [t, h, hd] = await Promise.allSettled([api.tools(), api.health(), api.healthDeep()]);
    if (t.status === "fulfilled") setTools(t.value);
    if (h.status === "fulfilled") setHealth(h.value);
    if (hd.status === "fulfilled") setHealthDeep(hd.value);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 30000);
    return () => clearInterval(id);
  }, [carregar]);

  async function sair() {
    await api.logout();
    onLogout();
  }

  const toolCount = tools?.total ?? health?.toolCount ?? 0;
  const uptime = healthDeep?.uptimeLegivel
    ?? (healthDeep?.uptimeSec ? `${Math.round(healthDeep.uptimeSec / 60)} min` : "—");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              MCP CentralDark <span className="text-primary">· Admin</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Painel operacional · tools, OAuth, auditoria e conector
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={carregar} disabled={refreshing}>
              <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Atualizar
            </Button>
            <Button size="sm">
              <KeyRound className="h-4 w-4" /> Nova chave
            </Button>
            <Button variant="ghost" size="sm" onClick={sair}>
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Status MCP" value={health?.ok ? "Online" : "—"} dot={health?.ok ? "ok" : "warn"} />
          <MetricCard label="Tools totais" value={toolCount} />
          <MetricCard label="Tools ativas" value={toolCount} />
          <MetricCard label="Bloqueadas" value={0} />
          <MetricCard label="Uptime" value={uptime} />
          <MetricCard label="Versão" value={health?.version ?? "—"} />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
            <TabsTrigger value="oauth">Clientes OAuth</TabsTrigger>
            <TabsTrigger value="connector">Conector</TabsTrigger>
            <TabsTrigger value="keys">Chaves</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab toolCount={toolCount} /></TabsContent>
          <TabsContent value="tools"><ToolsTab /></TabsContent>
          <TabsContent value="audit"><AuditTab /></TabsContent>
          <TabsContent value="oauth"><OAuthClientsTab /></TabsContent>
          <TabsContent value="connector"><ConnectorTab /></TabsContent>
          <TabsContent value="keys"><KeysTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
