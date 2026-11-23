import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { HeroStatsCard } from "@/apps/modulos/telepainel/components/dashboard/HeroStatsCard";
import { StatsCard } from "@/apps/modulos/telepainel/components/dashboard/StatsCard";
import { ApiStatusCard } from "@/apps/modulos/telepainel/components/dashboard/ApiStatusCard";
import { useAdminData } from "@/shared/hooks/useAdminData";
import { useAuthContext } from "@/shared/auth/AuthProvider";
import { Skeleton } from "@/shared/ui/skeleton";
import { Bot, CreditCard, MessageSquare, Users } from "lucide-react";

// 👇 Componentes below-the-fold — carregados/hidratados sob demanda (code-split)
const BotsSection = lazy(() =>
  import("@/apps/modulos/telepainel/components/dashboard/BotsSection").then((m) => ({ default: m.BotsSection })),
);
const DashboardAnalyticsChart = lazy(() =>
  import("@/apps/modulos/telepainel/components/dashboard/DashboardAnalyticsChart").then((m) => ({
    default: m.DashboardAnalyticsChart,
  })),
);
const QueryMonitor = lazy(() =>
  import("@/apps/modulos/telepainel/components/dashboard/QueryMonitor").then((m) => ({ default: m.QueryMonitor })),
);
const ActivityFeed = lazy(() =>
  import("@/apps/modulos/telepainel/components/dashboard/ActivityFeed").then((m) => ({ default: m.ActivityFeed })),
);
const QuickActions = lazy(() =>
  import("@/apps/modulos/telepainel/components/dashboard/QuickActions").then((m) => ({ default: m.QuickActions })),
);
const SystemStatus = lazy(() =>
  import("@/apps/modulos/telepainel/components/dashboard/SystemStatus").then((m) => ({ default: m.SystemStatus })),
);
const MaintenanceToggle = lazy(() =>
  import("@/apps/modulos/telepainel/components/dashboard/MaintenanceToggle").then((m) => ({
    default: m.MaintenanceToggle,
  })),
);

const BlockFallback = ({ h = 200 }: { h?: number }) => (
  <div className="card-premium flex items-center justify-center" style={{ minHeight: h }}>
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Bom dia", emoji: "☀️" };
  if (h < 18) return { text: "Boa tarde", emoji: "🌅" };
  return { text: "Boa noite", emoji: "🌙" };
}

function HeroSkeleton() {
  return (
    <div className="card-premium hover-lift group relative overflow-hidden p-6 md:col-span-2 ring-1 ring-primary/30">
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-14 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card-premium hover-lift group p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}

export default function Index() {
  const { bots, stats, loading } = useAdminData();
  const { profile, user } = useAuthContext();

  const firstName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

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

        {/* HERO row — Receita destacada */}
        <section className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            <>
              <HeroSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </section>

        {/* Secondary stats row */}
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <CardSkeleton />
              <div className="col-span-2 lg:col-span-3">
                <div className="card-premium p-5 h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </section>

        {/* Bots + Chart */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<BlockFallback h={320} />}>
              <BotsSection bots={bots} />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<BlockFallback h={320} />}>
              <DashboardAnalyticsChart />
            </Suspense>
          </div>
        </section>

        {/* Monitor de Consultas */}
        <Suspense fallback={<BlockFallback h={240} />}>
          <QueryMonitor />
        </Suspense>

        {/* Activity + Sidebar */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<BlockFallback h={400} />}>
              <ActivityFeed />
            </Suspense>
          </div>
          <div className="space-y-4">
            <Suspense fallback={<BlockFallback h={140} />}>
              <QuickActions />
            </Suspense>
            <Suspense fallback={<BlockFallback h={140} />}>
              <SystemStatus botsTotal={bots.length} botsOnline={stats.botsOnline} />
            </Suspense>
            <Suspense fallback={<BlockFallback h={100} />}>
              <MaintenanceToggle botId={bots[0]?.id ?? null} />
            </Suspense>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
