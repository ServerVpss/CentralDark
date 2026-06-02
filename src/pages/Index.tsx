import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HeroStatsCard } from "@/components/dashboard/HeroStatsCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BotsSection } from "@/components/dashboard/BotsSection";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MaintenanceToggle } from "@/components/dashboard/MaintenanceToggle";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { ApiStatusCard } from "@/components/dashboard/ApiStatusCard";
import { DashboardAnalyticsChart } from "@/components/dashboard/DashboardAnalyticsChart";
import { QueryMonitor } from "@/components/dashboard/QueryMonitor";
import { useAdminData } from "@/hooks/useAdminData";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Bot, CreditCard, MessageSquare, Users } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Bom dia", emoji: "☀️" };
  if (h < 18) return { text: "Boa tarde", emoji: "🌅" };
  return { text: "Boa noite", emoji: "🌙" };
}

export default function Index() {
  const { bots, stats, loading } = useAdminData();
  const { profile, user } = useAuthContext();

  const firstName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

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

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-1">
              {today}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight flex items-center flex-wrap gap-x-2">
              <span className="inline-block animate-greet-bounce">{greeting.emoji}</span>
              <span>
                {greeting.text}
                {firstName && (
                  <span className="text-gradient-money">, {firstName}</span>
                )}
              </span>
              <span className="inline-block origin-[70%_70%] animate-wave">👋</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Aqui está o resumo do seu negócio
            </p>
          </div>
        </div>

        {/* HERO row — Receita destacada (Nubank-style) */}
        <section className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          <HeroStatsCard
            title="Receita Mensal"
            subtitle="Faturamento dos últimos 30 dias"
            value={stats.monthlyRevenue.toFixed(2).replace(".", ",")}
            prefix="R$"
            change={stats.monthlyRevenue > 0 ? "Este mês" : "Sem receita"}
            changeType={stats.monthlyRevenue > 0 ? "positive" : "neutral"}
            icon={CreditCard}
            variant="primary"
          />
          <HeroStatsCard
            title="Assinantes"
            value={stats.activeSubscribers.toLocaleString("pt-BR")}
            change={stats.activeSubscribers > 0 ? "Ativos" : "—"}
            changeType={stats.activeSubscribers > 0 ? "positive" : "neutral"}
            icon={Users}
          />
          <HeroStatsCard
            title="Consultas Hoje"
            value={stats.queriesToday.toLocaleString("pt-BR")}
            change={stats.queriesToday > 0 ? "Em tempo real" : "—"}
            changeType={stats.queriesToday > 0 ? "positive" : "neutral"}
            icon={MessageSquare}
          />
        </section>

        {/* Secondary stats row */}
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Bots Ativos"
            value={bots.length}
            change={bots.length > 0 ? `${stats.botsOnline} online` : "Nenhum"}
            changeType={bots.length > 0 ? "positive" : "neutral"}
            icon={Bot}
            gradient="green"
          />
          <div className="col-span-2 lg:col-span-3">
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

        {/* Monitor de Consultas */}
        <QueryMonitor />

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
