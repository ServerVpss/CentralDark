import { useMemo } from "react";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Users, Radio, UserSquare, MessageSquare, Calendar, Bot, Users2, MessageCircleMore, Tag,
  Apple, Smartphone, Clock, CheckCircle2, BarChart3, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { HomePayload } from "@/lib/dashboard.functions";
import { cn } from "@/lib/utils";
import { SetupGuide } from "@/components/home/SetupGuide";
import { LoadingDots } from "@/components/ui/loading-dots";

type Props = { data: HomePayload | undefined; isLoading: boolean; title?: string; subtitle?: string };

export function HomeDashboard({ data, isLoading, title = "Início", subtitle }: Props) {
  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando painel" /></div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </header>

      <WhatsAppHealthCard s={data.whatsapp_status} />

      <SetupGuide s={data.whatsapp_status} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users} label="Usuários"
          used={data.counts.users.used} total={data.counts.users.total}
          tone="blue"
          series={data.contacts_monthly.map((m) => ({ x: m.month, y: m.total }))}
        />
        <StatCard
          icon={Radio} label="Canais"
          used={data.counts.channels.used} total={data.counts.channels.total}
          tone="cyan"
          series={[{ x: "Canais", y: data.counts.channels.used }]}
        />
        <StatCard
          icon={UserSquare} label="Contatos"
          used={data.counts.contacts.used} total={data.counts.contacts.total}
          tone="orange"
          series={data.contacts_monthly.map((m) => ({ x: m.month, y: m.total }))}
        />
        <StatCard
          icon={MessageSquare} label="Conversas Ativas"
          used={data.counts.active_conversations}
          tone="green"
          series={data.conversations_monthly.map((m) => ({ x: m.month, y: m.ativas }))}
        />
      </div>

      {/* Linha 2 — Aplicativo (oculto: não temos app publicado ainda) */}

      {/* Linha 3 — Evolução + Status canais */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Evolução de Conversas" badge="Últimos 12 meses" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.conversations_monthly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="ativas" name="Conversas Ativas" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="encerradas" name="Conversas Encerradas" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Status dos Canais">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Conectados", value: data.channels_status.connected, fill: "hsl(142 71% 45%)" },
                  { name: "Desconectados", value: Math.max(0, data.channels_status.disconnected), fill: "hsl(0 84% 60%)" },
                ]}
                dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={50} outerRadius={85}
              />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 px-2 pb-2 text-xs">
            <Row label="Conectados" value={data.channels_status.connected} dot="bg-green-500" />
            <Row label="Desconectados" value={data.channels_status.disconnected} dot="bg-red-500" />
          </div>
        </Panel>
      </div>

      {/* Linha 4 — Crescimento contatos + Desempenho semanal */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Crescimento de Contatos">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.contacts_monthly}>
              <defs>
                <linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(25 95% 55%)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(25 95% 55%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="hsl(25 95% 55%)" strokeWidth={2} fill="url(#cgrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-6 px-4 pb-2 text-xs">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-base font-semibold">{data.counts.contacts.used}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Crescimento</p>
              <p className="text-base font-semibold text-green-600">
                +{data.contacts_monthly.reduce((a, b) => a + b.total, 0)}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Desempenho de Atendimento">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.weekly_attendance}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="realizados" name="Atendimentos Realizados" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="media" name="Média do Dia" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 px-4 pb-2 text-xs">
            <div>
              <p className="text-muted-foreground">Total de Atendimentos</p>
              <p className="text-base font-semibold">{data.metrics.total_attendances}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Produtividade</p>
              <p className="text-base font-semibold text-green-600">{data.metrics.productivity_pct}%</p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Linha 5 — Métricas (+ Setores quando houver dados) */}
      <div className={cn("grid grid-cols-1 gap-4", data.sectors_distribution.length > 0 && "lg:grid-cols-2")}>
        {data.sectors_distribution.length > 0 && (
          <Panel title="Distribuição por Setores">
            <SectorPie data={data.sectors_distribution} />
          </Panel>
        )}
        <Panel title="Métricas de Atendimento">
          <div className="grid grid-cols-2 gap-3 p-2">
            <MetricBox icon={Clock} tone="blue" label="Tempo Médio de Resposta" value={fmtDuration(data.metrics.avg_response_seconds)} />
            <MetricBox icon={CheckCircle2} tone="green" label="Tempo Médio de Resolução" value={fmtDuration(data.metrics.avg_resolution_seconds)} />
            <MetricBox icon={BarChart3} tone="orange" label="Total de Atendimentos" value={String(data.metrics.total_attendances)} />
            <MetricBox icon={TrendingUp} tone="cyan" label="Produtividade" value={`${data.metrics.productivity_pct}%`} />
          </div>
        </Panel>
      </div>

      {/* Linha 6 — 5 mini cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MiniCard icon={Calendar} tone="blue" label="Agendamentos"
          value={`${data.counts.schedules.used} / ${data.counts.schedules.total}`} />
        <MiniCard icon={Bot} tone="green" label="Chatbots Ativos"
          value={`${data.counts.chatbots_active.used} / ${data.counts.chatbots_active.total}`} />
        <MiniCard icon={Users2} tone="cyan" label="Grupos de Contatos" value={String(data.counts.contact_groups)} />
        <MiniCard icon={MessageCircleMore} tone="orange" label="Templates de Mensagem" value={String(data.counts.templates)} />
        <MiniCard icon={Tag} tone="gray" label="Etiqueta" value={String(data.counts.labels)} />
      </div>

      {/* Rodapé */}
      <footer className="flex items-center justify-center gap-2 border-t pt-4 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()}</span>
        <MessageCircleMore className="h-4 w-4 text-primary" />
        <span>By <span className="font-medium text-primary">{data.brand_name}</span></span>
      </footer>
    </div>
  );
}

function fmtDuration(seconds: number) {
  if (!seconds) return "0m 0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const TONE: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  green: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  gray: { bg: "bg-muted", text: "text-muted-foreground" },
};

function StatCard({
  icon: Icon, label, used, total, tone, series,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; used: number; total?: number;
  tone: keyof typeof TONE;
  series: Array<{ x: string; y: number }>;
}) {
  const t = TONE[tone];
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 pb-2">
        <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg", t.bg)}>
          <Icon className={cn("h-4 w-4", t.text)} />
        </div>
        <p className="mt-3 text-2xl font-semibold tabular-nums">
          {used}{total !== undefined && <span className="text-muted-foreground"> / {total}</span>}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id={`sc-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} className={t.text} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} className={t.text} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke="currentColor" strokeWidth={1.5} fill={`url(#sc-${label})`} className={t.text} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AppDownloadCard({ ios, android, brandName }: { ios: string | null; android: string | null; brandName: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">Aplicativo {brandName}</h2>
          <p className="text-xs text-muted-foreground">Acesse o {brandName} no celular com atalhos rápidos para as lojas oficiais.</p>
        </div>
        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
          iOS e Android
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StoreLink icon={Apple} title="App para iPhone (iOS)" href={ios} badgeTop="Baixar na" badgeBottom="App Store" />
        <StoreLink icon={Smartphone} title="App para Android" href={android} badgeTop="DISPONÍVEL NO" badgeBottom="Google Play" />
      </div>
    </div>
  );
}

function StoreLink({ icon: Icon, title, href, badgeTop, badgeBottom }: { icon: React.ComponentType<{ className?: string }>; title: string; href: string | null; badgeTop: string; badgeBottom: string }) {
  const disabled = !href;
  const Comp: any = disabled ? "div" : "a";
  return (
    <Comp
      {...(disabled ? {} : { href, target: "_blank", rel: "noopener noreferrer" })}
      className={cn(
        "flex items-center justify-between rounded-lg border bg-muted/30 p-3 transition",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-muted/60",
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-background">
        <Icon className="h-5 w-5" />
        <div className="flex flex-col leading-tight">
          <span className="text-[8px] uppercase opacity-80">{badgeTop}</span>
          <span className="text-xs font-semibold">{badgeBottom}</span>
        </div>
      </div>
    </Comp>
  );
}

function Panel({ title, badge, className, children }: { title: string; badge?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-lg">{title}</h3>
        {badge && <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">{badge}</span>}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function Row({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1">
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}

const SECTOR_PALETTE = ["hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(25 95% 55%)", "hsl(280 70% 60%)", "hsl(330 80% 60%)", "hsl(190 90% 50%)"];
function SectorPie({ data }: { data: Array<{ name: string; value: number; color?: string | null }> }) {
  const palette = useMemo(() => data.map((s, i) => s.color || SECTOR_PALETTE[i % SECTOR_PALETTE.length]), [data]);
  if (!data.length) {
    return <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">Sem dados de setor.</div>;
  }
  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
            {data.map((_, i) => <Cell key={i} fill={palette[i]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 px-3 pb-2 text-xs">
        {data.map((s, i) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm" style={{ background: palette[i] }} />
            <span className="text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function MetricBox({ icon: Icon, tone, label, value }: { icon: React.ComponentType<{ className?: string }>; tone: keyof typeof TONE; label: string; value: string }) {
  const t = TONE[tone];
  return (
    <div className={cn("rounded-lg p-3", t.bg)}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background">
          <Icon className={cn("h-4 w-4", t.text)} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon: Icon, tone, label, value, foot }: { icon: React.ComponentType<{ className?: string }>; tone: keyof typeof TONE; label: string; value: string; foot?: string }) {
  const t = TONE[tone];
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", t.bg)}>
          <Icon className={cn("h-4 w-4", t.text)} />
        </div>
      </div>
      {foot && <p className="mt-3 text-[11px] text-muted-foreground">{foot}</p>}
    </div>
  );
}

function WhatsAppHealthCard({ s }: { s: HomePayload["whatsapp_status"] }) {
  const map = {
    ok: { color: "emerald", emoji: "✅", title: "Tudo certo — recebendo mensagens normalmente", desc: "Seu WhatsApp está conectado e o sistema está ouvindo as conversas em tempo real." },
    waiting_first_message: { color: "blue", emoji: "📡", title: "Conectado e aguardando o primeiro contato", desc: "Está tudo configurado. Quando alguém te mandar mensagem, ela cai aqui na hora." },
    pending_validation: { color: "amber", emoji: "⏳", title: "Falta validar o código de 6 dígitos", desc: "Vá em Canais e digite o PIN que o WhatsApp enviou pra liberar o número." },
    no_connection: { color: "slate", emoji: "🔌", title: "Nenhum WhatsApp conectado ainda", desc: "Vá em Canais e clique em \"Conectar meu WhatsApp\" pra começar." },
    warning: { color: "red", emoji: "⚠️", title: "Atenção — uma mensagem chegou com chave errada", desc: "Pode ser teste, mas vale conferir suas chaves em Canais → Diagnóstico." },
  } as const;
  const v = map[s.health];
  const palette: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    slate: "border-slate-500/30 bg-slate-500/5",
    red: "border-red-500/30 bg-red-500/5",
  };
  return (
    <div className={cn("rounded-xl border p-4 sm:flex sm:items-center sm:justify-between", palette[v.color])}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{v.emoji}</div>
        <div>
          <p className="font-medium">{v.title}</p>
          <p className="text-sm text-muted-foreground">{v.desc}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-4 text-center sm:mt-0 sm:gap-6">
        <div>
          <p className="text-lg font-semibold tabular-nums">{s.connected_count}</p>
          <p className="text-[11px] text-muted-foreground">Números ligados</p>
        </div>
        <div>
          <p className="text-lg font-semibold tabular-nums">{s.messages_24h}</p>
          <p className="text-[11px] text-muted-foreground">Mensagens (24h)</p>
        </div>
        <div>
          <p className="text-xs font-medium tabular-nums">
            {s.last_event_at ? formatDateTimeBR(s.last_event_at, { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">Último sinal</p>
        </div>
      </div>
    </div>
  );
}
