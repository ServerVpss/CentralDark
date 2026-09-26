import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { getWorkspaceHome } from "@/lib/dashboard.functions";
import { KpiCard } from "@/components/ui/kpi-card";
import { ApexAreaChart } from "@/components/dashboard/ApexAreaChart";
import { UnovisDonut } from "@/components/dashboard/UnovisDonut";
import {
  MessageSquare, Users, Radio, Headphones, Clock, CheckCircle2, TrendingUp, Activity,
} from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardExecutivo,
});

function fmtSec(s: number) {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}min`;
}

function DashboardExecutivo() {
  const { data: ws } = useCurrentWorkspace();
  const fn = useServerFn(getWorkspaceHome);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-exec", ws?.id],
    enabled: !!ws?.id,
    staleTime: 60_000,
    queryFn: () => fn({ data: { workspaceId: ws!.id } }),
  });

  if (!ws || isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando dashboard executivo" /></div>
    );
  }

  const totalConv = data.conversations_monthly.reduce((a, m) => a + m.ativas + m.encerradas, 0);
  const totalContacts = data.contacts_monthly.reduce((a, m) => a + m.total, 0);
  const channelsPct = data.counts.channels.total
    ? Math.round((data.channels_status.connected / data.counts.channels.total) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Executivo</h1>
          <p className="text-sm text-muted-foreground">
            Visão consolidada — {ws.name} · últimos 12 meses
          </p>
        </div>
        <div className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
          Atualizado agora
        </div>
      </header>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          variant="primary"
          icon={MessageSquare}
          label="Conversas (12m)"
          value={totalConv.toLocaleString("pt-BR")}
          hint={`${data.counts.active_conversations} ativas agora`}
        />
        <KpiCard
          icon={Users}
          label="Contatos"
          value={data.counts.contacts.used.toLocaleString("pt-BR")}
          hint={`+${totalContacts} novos no período`}
        />
        <KpiCard
          icon={Radio}
          label="Canais conectados"
          value={`${data.channels_status.connected}/${data.counts.channels.total}`}
          hint={`${channelsPct}% online`}
          delta={channelsPct - 50}
        />
        <KpiCard
          icon={Headphones}
          label="Atendimentos"
          value={data.metrics.total_attendances.toLocaleString("pt-BR")}
          hint={`Produtividade ${data.metrics.productivity_pct}%`}
          delta={data.metrics.productivity_pct - 70}
        />
      </div>

      {/* Métricas de tempo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          variant="glass"
          icon={Clock}
          label="Tempo médio resposta"
          value={fmtSec(data.metrics.avg_response_seconds)}
        />
        <KpiCard
          variant="glass"
          icon={CheckCircle2}
          label="Tempo médio resolução"
          value={fmtSec(data.metrics.avg_resolution_seconds)}
        />
        <KpiCard
          variant="glass"
          icon={Activity}
          label="Bots ativos"
          value={`${data.counts.chatbots_active.used}/${data.counts.chatbots_active.total}`}
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Evolução de Conversas</h3>
              <p className="text-xs text-muted-foreground">Ativas vs encerradas — últimos 12 meses</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <ApexAreaChart
            series={[
              { name: "Ativas", data: data.conversations_monthly.map((m) => ({ x: m.month, y: m.ativas })) },
              { name: "Encerradas", data: data.conversations_monthly.map((m) => ({ x: m.month, y: m.encerradas })) },
            ]}
          />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Distribuição por Setor</h3>
            <p className="text-xs text-muted-foreground">Tickets nos últimos 12 meses</p>
          </div>
          <UnovisDonut data={data.sectors_distribution} />
          <div className="mt-3 space-y-1">
            {data.sectors_distribution.slice(0, 5).map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: s.color || "hsl(var(--primary))" }}
                  />
                  {s.name}
                </span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Crescimento de Contatos</h3>
          <ApexAreaChart
            height={240}
            series={[{ name: "Novos contatos", data: data.contacts_monthly.map((m) => ({ x: m.month, y: m.total })) }]}
          />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Atendimentos da Semana</h3>
          <ApexAreaChart
            height={240}
            series={[{ name: "Realizados", data: data.weekly_attendance.map((m) => ({ x: m.day, y: m.realizados })) }]}
          />
        </div>
      </div>
    </div>
  );
}
