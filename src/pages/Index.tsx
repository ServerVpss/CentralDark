import { Loader2, LayoutDashboard } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BotsSection } from "@/components/dashboard/BotsSection";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MaintenanceToggle } from "@/components/dashboard/MaintenanceToggle";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { ApiStatusCard } from "@/components/dashboard/ApiStatusCard";
import { useAdminData } from "@/hooks/useAdminData";
import { Bot, CreditCard, MessageSquare, Users } from "lucide-react";

export default function Index() {
  const { bots, stats, loading } = useAdminData();

  const statsCards = [
    {
      title: "Total de Bots",
      value: bots.length,
      change: bots.length > 0 ? `${bots.length} ativo(s)` : "Nenhum",
      changeType: bots.length > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Bot,
      gradient: "cyan" as const,
    },
    {
      title: "Assinantes Ativos",
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
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-amber-600 blur-xl opacity-40 animate-pulse" />
              <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Carregando dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <header className="flex items-center gap-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/20 shadow-lg shadow-primary/10">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do seu sistema TelePanel
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <div key={stat.title} className="animate-slide-up" style={{ animationDelay: `${index * 75}ms` }}>
              <StatsCard {...stat} />
            </div>
          ))}
        </section>

        {/* Main Grid: Bots + Sidebar */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BotsSection bots={bots} />
          </div>
          <div className="space-y-4">
            <QuickActions />
            <MaintenanceToggle botId={bots[0]?.id ?? null} />
          </div>
        </section>

        {/* Activity + System Status */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
          <div>
            <SystemStatus botsTotal={bots.length} botsOnline={stats.botsOnline} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
