import { Bot, CreditCard, MessageSquare, Users, Loader2, Sparkles, TrendingUp, Zap } from "lucide-react";
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
      gradient: "cyan" as const,
    },
    {
      title: "Assinantes Ativos",
      value: stats.activeSubscribers,
      change: stats.activeSubscribers > 0 ? "Assinaturas ativas" : "Nenhuma assinatura",
      changeType: stats.activeSubscribers > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Users,
      gradient: "green" as const,
    },
    {
      title: "Consultas Hoje",
      value: stats.queriesToday,
      change: stats.queriesToday > 0 ? "Consultas realizadas" : "Nenhuma consulta",
      changeType: stats.queriesToday > 0 ? ("positive" as const) : ("neutral" as const),
      icon: MessageSquare,
      gradient: "purple" as const,
    },
    {
      title: "Receita Mensal",
      value: `R$ ${stats.monthlyRevenue.toFixed(2).replace(".", ",")}`,
      change: stats.monthlyRevenue > 0 ? "Este mês" : "Sem receita ainda",
      changeType: stats.monthlyRevenue > 0 ? ("positive" as const) : ("neutral" as const),
      icon: CreditCard,
      gradient: "gold" as const,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-amber-600 blur-xl opacity-50 animate-pulse" />
              <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Carregando dados...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/30">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-gold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Visão geral do seu sistema TelePanel
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <div key={stat.title} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bots Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Seus Bots</h2>
              </div>
              <a href="/bots" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Ver todos
                <TrendingUp className="h-3 w-3" />
              </a>
            </div>
            {bots.length === 0 ? (
              <div className="rounded-2xl border border-border/50 p-8 text-center" style={{
                background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
              }}>
                <div className="relative mx-auto mb-4 w-fit">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-amber-600 blur-xl opacity-30" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/30">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum bot configurado</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Adicione seu primeiro bot do Telegram para começar a gerenciar assinaturas e consultas
                </p>
                <a
                  href="/bots"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-600 px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                >
                  <Zap className="h-4 w-4" />
                  Adicionar Bot
                </a>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bots.slice(0, 3).map((bot, index) => (
                  <div key={bot.id} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <BotStatusCard
                      name={bot.name}
                      username={bot.bot_username || "Não sincronizado"}
                      status={bot.health_status === "online" ? "online" : "offline"}
                      messages={0}
                      users={0}
                    />
                  </div>
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
          <div className="rounded-2xl border border-border/50 p-6" style={{
            background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
          }}>
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Status do Sistema</h2>
            </div>
            <div className="text-center">
              <div className="relative mx-auto mb-6 h-28 w-28">
                {/* Background glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-amber-600/10 blur-xl" />
                
                <svg className="h-28 w-28 -rotate-90 transform relative">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="fill-none stroke-white/5"
                    strokeWidth="10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="fill-none"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    strokeDasharray="301.6"
                    strokeDashoffset={301.6 - (bots.length > 0 ? (stats.botsOnline / bots.length) * 301.6 : 0)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(38 95% 55%)" />
                      <stop offset="100%" stopColor="hsl(28 90% 45%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gradient-gold">{bots.length}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {bots.length > 0 ? "Sistema Ativo" : "Sem Bots"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {bots.length > 0
                  ? `${stats.botsOnline} de ${bots.length} bot(s) online`
                  : "Configure seu primeiro bot"}
              </p>
              
              {/* Progress bar */}
              <div className="mt-5 relative">
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-amber-600 transition-all duration-500"
                    style={{
                      width: `${bots.length > 0 ? (stats.botsOnline / bots.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {bots.length > 0
                    ? `${Math.round((stats.botsOnline / bots.length) * 100)}% operacional`
                    : "0% ativo"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}