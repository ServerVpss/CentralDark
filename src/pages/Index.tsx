import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BotsSection } from "@/components/dashboard/BotsSection";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MaintenanceToggle } from "@/components/dashboard/MaintenanceToggle";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { ApiStatusCard } from "@/components/dashboard/ApiStatusCard";
import { DashboardAnalyticsChart } from "@/components/dashboard/DashboardAnalyticsChart";
import { useAdminData } from "@/hooks/useAdminData";
import { Bot, CreditCard, MessageSquare, Users } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Index() {
  const { bots, stats, loading } = useAdminData();

  const statsCards = [
    {
      title: "Bots",
      value: bots.length,
      change: bots.length > 0 ? `${bots.length} ativo(s)` : "Nenhum",
      changeType: bots.length > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Bot,
      gradient: "cyan" as const,
    },
    {
      title: "Assinantes",
      value: stats.activeSubscribers,
      change: stats.activeSubscribers > 0 ? "Ativos" : "Nenhum",
      changeType: stats.activeSubscribers > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Users,
      gradient: "green" as const,
    },
    {
      title: "Consultas Hoje",
      value: stats.queriesToday,
      change: stats.queriesToday > 0 ? "Hoje" : "Nenhuma",
      changeType: stats.queriesToday > 0 ? ("positive" as const) : ("neutral" as const),
      icon: MessageSquare,
      gradient: "purple" as const,
    },
    {
      title: "Receita Mensal",
      value: `R$ ${stats.monthlyRevenue.toFixed(2).replace(".", ",")}`,
      change: stats.monthlyRevenue > 0 ? "Este mês" : "Sem receita",
      changeType: stats.monthlyRevenue > 0 ? ("positive" as const) : ("neutral" as const),
      icon: CreditCard,
      gradient: "gold" as const,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{getGreeting()} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumo do seu sistema TelePanel</p>
        </div>

        {/* Stats + API Status row */}
        <section className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          {statsCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
          <div className="col-span-2 lg:col-span-1">
            <ApiStatusCard />
          </div>
        </section>

        {/* Bots + Chart */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BotsSection bots={bots} />
          </div>
          <div>
            <DashboardAnalyticsChart />
          </div>
        </section>

        {/* Activity + Sidebar */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
          <div className="space-y-4">
            <QuickActions />
            <SystemStatus botsTotal={bots.length} botsOnline={stats.botsOnline} />
            <MaintenanceToggle botId={bots[0]?.id ?? null} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
