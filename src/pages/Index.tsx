import { Bot, CreditCard, MessageSquare, Users, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BotStatusCard } from "@/components/dashboard/BotStatusCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAdminData } from "@/hooks/useAdminData";

export default function Index() {
  const { bots, stats, loading } = useAdminData();

  const statsCards = [
    {
      title: "Total de Bots",
      value: bots.length,
      change: bots.length > 0 ? `${bots.length} configurado(s)` : "Nenhum bot",
      changeType: bots.length > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Bot,
    },
    {
      title: "Assinantes Ativos",
      value: stats.activeSubscribers,
      change: stats.activeSubscribers > 0 ? "Assinaturas ativas" : "Nenhuma assinatura",
      changeType: stats.activeSubscribers > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Users,
    },
    {
      title: "Consultas Hoje",
      value: stats.queriesToday,
      change: stats.queriesToday > 0 ? "Consultas realizadas" : "Nenhuma consulta",
      changeType: stats.queriesToday > 0 ? ("positive" as const) : ("neutral" as const),
      icon: MessageSquare,
    },
    {
      title: "Receita Mensal",
      value: `R$ ${stats.monthlyRevenue.toFixed(2).replace(".", ",")}`,
      change: stats.monthlyRevenue > 0 ? "Este mês" : "Sem receita ainda",
      changeType: stats.monthlyRevenue > 0 ? ("positive" as const) : ("neutral" as const),
      icon: CreditCard,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de bots Telegram
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bots Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seus Bots</h2>
              <a href="/bots" className="text-sm text-primary hover:underline">
                Ver todos
              </a>
            </div>
            {bots.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum bot configurado</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione seu primeiro bot do Telegram para começar
                </p>
                <a
                  href="/bots"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Adicionar Bot
                </a>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bots.slice(0, 3).map((bot) => (
                  <BotStatusCard
                    key={bot.id}
                    name={bot.name}
                    username={bot.bot_username || "Não sincronizado"}
                    status={bot.health_status === "online" ? "online" : "offline"}
                    messages={0}
                    users={0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>

          {/* System Status */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Status do Sistema</h2>
            <div className="text-center">
              <div className="relative mx-auto mb-4 h-24 w-24">
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="fill-none stroke-secondary"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="fill-none stroke-primary"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (bots.length > 0 ? 251.2 : 0)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">{bots.length}</span>
                </div>
              </div>
              <h3 className="font-semibold">
                {bots.length > 0 ? "Sistema Ativo" : "Sem Bots"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {bots.length > 0
                  ? `${stats.botsOnline} bot(s) online`
                  : "Configure seu primeiro bot"}
              </p>
              <div className="mt-4 h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{
                    width: `${bots.length > 0 ? (stats.botsOnline / bots.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {bots.length > 0
                  ? `${Math.round((stats.botsOnline / bots.length) * 100)}% online`
                  : "0% ativo"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
