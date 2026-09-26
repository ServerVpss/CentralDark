import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminHome, type HomePayload } from "@/lib/dashboard.functions";
import { KpiCard } from "@/components/ui/kpi-card";
import { ApexAreaChart } from "@/components/dashboard/ApexAreaChart";
import { UnovisDonut } from "@/components/dashboard/UnovisDonut";
import { MessageSquare, Users, Radio, Headphones, Clock, CheckCircle2, Activity, Crown } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/dashboard-executivo")({
  component: AdminDashboardExecutivo,
});

function fmtSec(s: number) {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
}

function AdminDashboardExecutivo() {
  const fn = useServerFn(getAdminHome);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-exec"],
    staleTime: 60_000,
    queryFn: () => fn(),
  });

  if (isLoading || !data) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>;
  }
  const d = data as HomePayload;
  const totalConv = d.conversations_monthly.reduce((a, m) => a + m.ativas + m.encerradas, 0);
  const totalContacts = d.contacts_monthly.reduce((a, m) => a + m.total, 0);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Crown className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard Executivo · Master</h1>
            <p className="text-sm text-muted-foreground">Visão consolidada de toda a plataforma</p>
          </div>
        </div>
        <div className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">Atualizado agora</div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard variant="primary" icon={MessageSquare} label="Conversas globais (12m)" value={totalConv.toLocaleString("pt-BR")} hint={`${d.counts.active_conversations} ativas`} />
        <KpiCard icon={Users} label="Contatos totais" value={d.counts.contacts.used.toLocaleString("pt-BR")} hint={`+${totalContacts} no período`} />
        <KpiCard icon={Radio} label="Canais conectados" value={`${d.channels_status.connected}/${d.counts.channels.total}`} />
        <KpiCard icon={Headphones} label="Atendimentos" value={d.metrics.total_attendances.toLocaleString("pt-BR")} hint={`Produtividade ${d.metrics.productivity_pct}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard variant="glass" icon={Clock} label="Tempo médio resposta" value={fmtSec(d.metrics.avg_response_seconds)} />
        <KpiCard variant="glass" icon={CheckCircle2} label="Tempo médio resolução" value={fmtSec(d.metrics.avg_resolution_seconds)} />
        <KpiCard variant="glass" icon={Activity} label="Bots ativos" value={`${d.counts.chatbots_active.used}/${d.counts.chatbots_active.total}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Evolução de Conversas (toda plataforma)</h3>
          <ApexAreaChart series={[
            { name: "Ativas", data: d.conversations_monthly.map((m) => ({ x: m.month, y: m.ativas })) },
            { name: "Encerradas", data: d.conversations_monthly.map((m) => ({ x: m.month, y: m.encerradas })) },
          ]} />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Distribuição por Setor</h3>
          <UnovisDonut data={d.sectors_distribution} />
        </div>
      </div>
    </div>
  );
}
