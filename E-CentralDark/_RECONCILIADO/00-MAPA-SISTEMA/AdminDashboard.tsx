import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  Users,
  Wifi,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Building2,
  CreditCard,
  BarChart3,
  ShieldAlert,
  Clock,
  Zap,
  Ban,
  Star,
  Activity,
} from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, type: "spring", stiffness: 120 } },
};

function AdminStat({
  title, value, change, icon: Icon, color, index = 0,
}: {
  title: string; value: string; change: string; icon: React.ElementType; color: string; index?: number;
}) {
  const bg = color === "text-primary" ? "bg-primary/10" : color === "text-blue-400" ? "bg-blue-500/10" : color === "text-warning" ? "bg-warning/10" : color === "text-destructive" ? "bg-destructive/10" : "bg-muted/10";
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4, scale: 1.02 }}
      className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm hover:border-primary/40 hover:shadow-[0_0_25px_hsl(var(--primary)/0.12)] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">{value}</h2>
      <div className="flex items-center gap-1.5 text-xs">
        <TrendingUp className="w-3 h-3 text-primary" />
        <span className="text-primary font-medium">{change}</span>
      </div>
    </motion.div>
  );
}

const MOCK_CLIENTS = [
  { name: "TechSolutions LTDA", plan: "Business", connections: 12, mrr: "R$ 599", status: "active", msgs: "12.4K" },
  { name: "Vendas Express", plan: "Pro", connections: 5, mrr: "R$ 299", status: "active", msgs: "8.2K" },
  { name: "Marketing Digital SA", plan: "Pro", connections: 3, mrr: "R$ 299", status: "active", msgs: "5.1K" },
  { name: "AutoPeças Brasil", plan: "Starter", connections: 2, mrr: "R$ 99", status: "active", msgs: "2.3K" },
  { name: "Clínica Saúde+", plan: "Pro", connections: 4, mrr: "R$ 299", status: "overdue", msgs: "3.8K" },
  { name: "João Freelancer", plan: "Free", connections: 1, mrr: "Grátis", status: "active", msgs: "456" },
  { name: "Imobiliária Centro", plan: "Starter", connections: 2, mrr: "R$ 99", status: "overdue", msgs: "1.1K" },
  { name: "Restaurante Sabor", plan: "Free", connections: 1, mrr: "Grátis", status: "blocked", msgs: "0" },
];

const planColors: Record<string, string> = {
  Free: "bg-muted/30 text-muted-foreground border-border",
  Starter: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Pro: "bg-primary/10 text-primary border-primary/30",
  Business: "bg-warning/10 text-warning border-warning/30",
};

const statusCfg: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Ativo", color: "text-primary", dot: "bg-primary" },
  overdue: { label: "Inadimplente", color: "text-destructive", dot: "bg-destructive animate-pulse" },
  blocked: { label: "Bloqueado", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export default function AdminDashboard() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-wide text-foreground flex items-center gap-2">
              <Crown className="w-6 h-6 text-warning" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Visão geral de todos os clientes, receita e performance do sistema.
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 text-[10px] font-mono border-warning/30 text-warning">
            <Crown className="w-3 h-3" /> Master Admin
          </Badge>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <AdminStat index={0} title="Total Clientes" value="24" change="+3 este mês" icon={Building2} color="text-blue-400" />
          <AdminStat index={1} title="Conexões Globais" value="48" change="42 online" icon={Wifi} color="text-primary" />
          <AdminStat index={2} title="MRR" value="R$ 8.5K" change="+12% vs mês anterior" icon={DollarSign} color="text-warning" />
          <AdminStat index={3} title="Receita Mês" value="R$ 12.4K" change="+18% crescimento" icon={TrendingUp} color="text-primary" />
          <AdminStat index={4} title="Inadimplentes" value="3" change="R$ 697 pendente" icon={AlertTriangle} color="text-destructive" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Clients list */}
          <motion.div variants={fadeUp} className="col-span-12 lg:col-span-8">
            <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-bold text-sm tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Clientes Recentes
                </h3>
                <Link to="/admin/clientes" className="text-[10px] font-mono text-primary hover:underline flex items-center gap-0.5">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border/50">
                {MOCK_CLIENTS.map((c, i) => {
                  const s = statusCfg[c.status];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-primary/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{c.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{c.connections} conexões · {c.msgs} msgs/mês</p>
                      </div>
                      <Badge variant="outline" className={`text-[9px] font-mono uppercase ${planColors[c.plan]}`}>
                        {c.plan}
                      </Badge>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-[10px] font-mono font-bold ${s.color}`}>{s.label}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{c.mrr}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right column: Alerts + Quick Stats */}
          <motion.div variants={fadeUp} className="col-span-12 lg:col-span-4 space-y-4">
            {/* System Alerts */}
            <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-display font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-warning" /> Alertas do Sistema
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {[
                  { icon: AlertTriangle, title: "3 clientes inadimplentes", desc: "R$ 697 pendente de cobrança", color: "text-destructive", bg: "bg-destructive/5 border-destructive/20" },
                  { icon: Ban, title: "1 cliente bloqueado", desc: "Restaurante Sabor — plano expirado", color: "text-muted-foreground", bg: "bg-muted/10 border-border" },
                  { icon: Zap, title: "Uso crescendo 23%", desc: "Considere upgrade de infraestrutura", color: "text-warning", bg: "bg-warning/5 border-warning/20" },
                  { icon: CheckCircle2, title: "21 clientes ativos", desc: "Sistema operando normalmente", color: "text-primary", bg: "bg-primary/5 border-primary/20" },
                ].map((a, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${a.bg}`}>
                    <a.icon className={`w-4 h-4 shrink-0 mt-0.5 ${a.color}`} />
                    <div>
                      <p className="text-xs font-bold">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan distribution */}
            <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-display font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning" /> Distribuição de Planos
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { plan: "Business", count: 4, pct: 17, color: "bg-warning" },
                  { plan: "Pro", count: 10, pct: 42, color: "bg-primary" },
                  { plan: "Starter", count: 6, pct: 25, color: "bg-blue-400" },
                  { plan: "Free", count: 4, pct: 16, color: "bg-muted-foreground" },
                ].map((p) => (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{p.plan}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{p.count} clientes ({p.pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ delay: 0.5, duration: 0.8 }}
                        className={`h-full rounded-full ${p.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="space-y-2">
              {[
                { icon: Users, label: "Gerenciar Clientes", to: "/admin/clientes", color: "text-primary" },
                { icon: CreditCard, label: "Planos & Limites", to: "/admin/planos", color: "text-warning" },
                { icon: DollarSign, label: "Financeiro", to: "/financeiro", color: "text-primary" },
              ].map((l) => (
                <Link key={l.to} to={l.to}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <l.icon className={`w-4 h-4 ${l.color}`} />
                  <span className="text-xs font-bold flex-1">{l.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Security banner */}
        <motion.div variants={fadeUp} className="bg-card/30 border border-border rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono text-muted-foreground">
              <span className="text-warning font-bold">Painel Master — modo visual/mock</span> — Dados de clientes, receita e planos são simulação.
              Conexão real via Supabase + RLS + workspace_id na fase de backend.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
