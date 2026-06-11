import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Database, Copy, RefreshCw, Loader2, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Lista de tabelas conhecidas do projeto (33 tabelas)
const TABLES = [
  "api_providers","api_usage_logs","audit_logs","bot_analytics","bot_conversation_states",
  "bot_query_rate_tracking","bot_security_settings","bot_settings","cleanup_settings",
  "edge_function_health","engagement_messages","menu_tips","module_health_status",
  "paginated_results","payment_gateway_settings","payment_gateways","payment_history",
  "pending_payments","pix_transactions","processed_updates","profiles","query_history",
  "query_modules","scheduled_broadcasts","subscription_plans","telegram_bots",
  "telegram_message_queue","telegram_messages","telegram_referrals","telegram_subscriptions",
  "telegram_user_terms","telegram_users","user_roles","webapp_results",
] as const;

const PROJECT = {
  id: "kagejpghnwdfymddwxuf",
  url: "https://kagejpghnwdfymddwxuf.supabase.co",
  region: "Lovable Cloud (Supabase)",
  anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...AYdE",
};

interface TableInfo {
  name: string;
  count: number | null;
  error?: string;
}

export default function DatabaseInfo() {
  const [tables, setTables] = useState<TableInfo[]>(
    TABLES.map((n) => ({ name: n, count: null }))
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadCounts = async () => {
    setLoading(true);
    const results = await Promise.all(
      TABLES.map(async (name) => {
        try {
          const { count, error } = await (supabase as any)
            .from(name)
            .select("*", { count: "exact", head: true });
          if (error) return { name, count: null, error: error.message };
          return { name, count: count ?? 0 };
        } catch (e: any) {
          return { name, count: null, error: e?.message ?? "erro" };
        }
      })
    );
    setTables(results);
    setLoading(false);
  };

  useEffect(() => { loadCounts(); }, []);

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copiado`);
  };

  const totalRows = tables.reduce((a, t) => a + (t.count ?? 0), 0);
  const filtered = tables.filter((t) => t.name.includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Database className="h-7 w-7 text-primary" />
              Informações do Banco
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visão geral do banco de dados do projeto
            </p>
          </div>
          <Button onClick={loadCounts} disabled={loading} variant="outline" className="shadow-3d-soft">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Atualizar
          </Button>
        </div>

        {/* Project info */}
        <Card className="shadow-3d-soft">
          <CardHeader>
            <CardTitle>Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Project ID" value={PROJECT.id} onCopy={() => copy(PROJECT.id, "Project ID")} />
            <Row label="URL" value={PROJECT.url} onCopy={() => copy(PROJECT.url, "URL")} extra={
              <a href={PROJECT.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                abrir <ExternalLink className="h-3 w-3" />
              </a>
            } />
            <Row label="Ambiente" value={PROJECT.region} />
            <Row label="Anon Key (parcial)" value={PROJECT.anon} />
          </CardContent>
        </Card>

        {/* Stats resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox label="Tabelas" value={TABLES.length} />
          <StatBox label="Total de Linhas" value={totalRows.toLocaleString("pt-BR")} />
          <StatBox label="Com Dados" value={tables.filter(t => (t.count ?? 0) > 0).length} />
          <StatBox label="Vazias" value={tables.filter(t => t.count === 0).length} />
        </div>

        {/* Tables */}
        <Card className="shadow-3d-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <CardTitle>Tabelas ({filtered.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar tabela..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filtered
                .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
                .map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:shadow-3d-soft transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-medium truncate">{t.name}</p>
                    {t.error && <p className="text-[10px] text-destructive truncate">{t.error}</p>}
                  </div>
                  {t.count === null ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : (
                    <Badge variant={t.count > 0 ? "default" : "secondary"} className="font-mono shrink-0">
                      {t.count.toLocaleString("pt-BR")}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value, onCopy, extra }: { label: string; value: string; onCopy?: () => void; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm truncate">{value}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {extra}
        {onCopy && (
          <Button size="sm" variant="ghost" onClick={onCopy}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-3d-soft">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
