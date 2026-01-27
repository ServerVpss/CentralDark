import { Bot, CreditCard, MessageSquare, TrendingUp, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BotStatusCard } from "@/components/dashboard/BotStatusCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";

const stats = [
  {
    title: "Total de Bots",
    value: 5,
    change: "+2 este mês",
    changeType: "positive" as const,
    icon: Bot,
  },
  {
    title: "Assinantes Ativos",
    value: "1,284",
    change: "+12.5% vs mês anterior",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Mensagens Hoje",
    value: "24.5k",
    change: "+8.2% vs ontem",
    changeType: "positive" as const,
    icon: MessageSquare,
  },
  {
    title: "Receita Mensal",
    value: "R$ 12.850",
    change: "+18.3% vs mês anterior",
    changeType: "positive" as const,
    icon: CreditCard,
  },
];

const bots = [
  { name: "Bot Principal", username: "MeuBotPrincipal", status: "online" as const, messages: 8542, users: 456 },
  { name: "Bot Vendas", username: "VendasAutomacao", status: "online" as const, messages: 3210, users: 234 },
  { name: "Bot Suporte", username: "SuporteCliente", status: "error" as const, messages: 1105, users: 178 },
];

export default function Index() {
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
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bots Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seus Bots</h2>
              <button className="text-sm text-primary hover:underline">Ver todos</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bots.map((bot) => (
                <BotStatusCard key={bot.username} {...bot} />
              ))}
            </div>
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
          
          {/* Gamification Preview */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Seu Nível</h2>
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
                    strokeDashoffset="62.8"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">12</span>
                </div>
              </div>
              <h3 className="font-semibold">Mestre dos Bots</h3>
              <p className="mt-1 text-sm text-muted-foreground">2.450 / 3.000 XP</p>
              <div className="mt-4 h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[75%] rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                550 XP para o próximo nível
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
