import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight,
  CreditCard, Receipt, PiggyBank, AlertTriangle, CheckCircle2, Clock,
  Filter, Download, FileText, Plus, Search, Users, Building2,
  BarChart3, Wallet, Banknote, CircleDollarSign, Shield, ChevronRight,
  Calendar, Tag, MessageSquare, Wifi, Target,
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// --- Tabs ---
type Tab = "overview" | "transactions" | "reports" | "expenses";

// --- Mock data ---
const CHART_DATA = [
  { day: "01", receita: 420, despesa: 80 }, { day: "05", receita: 680, despesa: 120 },
  { day: "10", receita: 950, despesa: 90 }, { day: "15", receita: 1200, despesa: 200 },
  { day: "20", receita: 890, despesa: 150 }, { day: "25", receita: 1450, despesa: 180 },
  { day: "Hoje", receita: 1100, despesa: 100 },
];

const TRANSACTIONS = [
  { id: 1, type: "income", method: "PIX", desc: "Plano Pro — TechSolutions", value: 599, status: "confirmed", date: "29/05", agent: "Sistema", category: "Assinatura" },
  { id: 2, type: "income", method: "PIX", desc: "Plano Pro — Vendas Express", value: 299, status: "confirmed", date: "29/05", agent: "Sistema", category: "Assinatura" },
  { id: 3, type: "income", method: "PIX", desc: "Plano Starter — AutoPeças", value: 99, status: "pending", date: "28/05", agent: "Sistema", category: "Assinatura" },
  { id: 4, type: "income", method: "PIX", desc: "Plano Pro — Marketing Digital", value: 299, status: "confirmed", date: "28/05", agent: "Sistema", category: "Assinatura" },
  { id: 5, type: "expense", method: "Boleto", desc: "Servidor VPS — Contabo", value: -89, status: "confirmed", date: "27/05", agent: "Admin", category: "Servidor" },
  { id: 6, type: "income", method: "PIX", desc: "Plano Business — Clínica Saúde+", value: 299, status: "overdue", date: "25/05", agent: "Sistema", category: "Assinatura" },
  { id: 7, type: "expense", method: "Cartão", desc: "API WhatsApp — Meta", value: -45, status: "confirmed", date: "25/05", agent: "Admin", category: "API" },
  { id: 8, type: "income", method: "PIX", desc: "Upgrade Pro → Business", value: 300, status: "confirmed", date: "24/05", agent: "Vendas", category: "Upgrade" },
  { id: 9, type: "expense", method: "PIX", desc: "Comissão — João Vendas", value: -150, status: "confirmed", date: "24/05", agent: "Admin", category: "Comissão" },
  { id: 10, type: "income", method: "PIX", desc: "Plano Starter — Imobiliária", value: 99, status: "expired", date: "20/05", agent: "Sistema", category: "Assinatura" },
];

const RANKING = [
  { name: "Carlos — Vendas", sales: 18, revenue: "R$ 4.200", conversion: "72%" },
  { name: "Ana — Suporte", sales: 12, revenue: "R$ 2.800", conversion: "65%" },
  { name: "João — Marketing", sales: 8, revenue: "R$ 1.900", conversion: "58%" },
  { name: "Maria — Financeiro", sales: 5, revenue: "R$ 1.100", conversion: "45%" },
];

const statusCfg: Record<string, { label: string; color: string; dot: string }> = {
  confirmed: { label: "Confirmado", color: "text-primary", dot: "bg-primary" },
  pending: { label: "Pendente", color: "text-warning", dot: "bg-warning animate-pulse" },
  overdue: { label: "Em Atraso", color: "text-destructive", dot: "bg-destructive animate-pulse" },
  expired: { label: "Expirado", color: "text-muted-foreground", dot: "bg-muted-foreground" },
  refunded: { label: "Estornado", color: "text-blue-400", dot: "bg-blue-400" },
};

export default function Financial() {
  const [tab, setTab] = useState<Tab>("overview");
  const [txFilter, setTxFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [newType, setNewType] = useState<"income" | "expense">("income");
  const [newDesc, setNewDesc] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCat, setNewCat] = useState("Outros");

  const totalReceita = TRANSACTIONS.filter(t => t.type === "income" && t.status === "confirmed").reduce((s, t) => s + t.value, 0);
  const totalDespesa = Math.abs(TRANSACTIONS.filter(t => t.type === "expense").reduce((s, t) => s + t.value, 0));
  const totalPendente = TRANSACTIONS.filter(t => t.status === "pending" || t.status === "overdue").reduce((s, t) => s + Math.abs(t.value), 0);
  const lucro = totalReceita - totalDespesa;
  const pixConfirmed = TRANSACTIONS.filter(t => t.method === "PIX" && t.status === "confirmed" && t.type === "income").length;
  const pixPending = TRANSACTIONS.filter(t => t.method === "PIX" && (t.status === "pending" || t.status === "overdue")).length;

  const filteredTx = TRANSACTIONS.filter(t => {
    if (txFilter === "all") return true;
    if (txFilter === "income") return t.type === "income";
    if (txFilter === "expense") return t.type === "expense";
    return t.status === txFilter;
  });

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Visão Geral", icon: BarChart3 },
    { key: "transactions", label: "Transações", icon: Receipt },
    { key: "reports", label: "Relatórios", icon: FileText },
    { key: "expenses", label: "Despesas", icon: Wallet },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-wide flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary" /> Financeiro
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Fluxo de caixa, pagamentos PIX, faturamento e relatórios.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.message("Exportar", { description: "Exportação PDF/CSV será conectada ao backend." })} className="gap-2 text-xs">
              <Download className="w-4 h-4" /> Exportar
            </Button>
            <Button onClick={() => { setNewOpen(true); setNewType("income"); setNewDesc(""); setNewValue(""); setNewCat("Outros"); }} className="gap-2">
              <Plus className="w-4 h-4" /> Lançamento
            </Button>
          </div>
        </motion.div>

        {/* Summary cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Receita", value: `R$ ${totalReceita.toLocaleString()}`, icon: ArrowDownLeft, color: "text-primary" },
            { label: "Despesas", value: `R$ ${totalDespesa.toLocaleString()}`, icon: ArrowUpRight, color: "text-destructive" },
            { label: "Lucro", value: `R$ ${lucro.toLocaleString()}`, icon: PiggyBank, color: "text-primary" },
            { label: "Pendente", value: `R$ ${totalPendente.toLocaleString()}`, icon: Clock, color: "text-warning" },
            { label: "PIX Confirmados", value: String(pixConfirmed), icon: CheckCircle2, color: "text-primary" },
            { label: "PIX Pendentes", value: String(pixPending), icon: AlertTriangle, color: "text-warning" },
          ].map((s, i) => (
            <div key={i} className="bg-card/50 border border-border rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex gap-1 bg-card/30 border border-border rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center ${
                tab === t.key ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </motion.div>

        {/* TAB: Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-12 gap-4">
            {/* Chart */}
            <motion.div variants={fadeUp} className="col-span-12 lg:col-span-8">
              <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> Faturamento vs Despesas (30 dias)
                  </h3>
                  <div className="flex gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Receita</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Despesa</span>
                  </div>
                </div>
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.08)" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `R$${v}`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary)/0.3)", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Ranking */}
            <motion.div variants={fadeUp} className="col-span-12 lg:col-span-4">
              <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden h-full flex flex-col">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-display font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                    <Target className="w-4 h-4 text-warning" /> Ranking de Vendas
                  </h3>
                </div>
                <div className="p-3 space-y-2 flex-1">
                  {RANKING.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-background/30">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        i === 0 ? "bg-warning/20 text-warning border border-warning/30" : "bg-muted/20 text-muted-foreground border border-border"
                      }`}>
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{r.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{r.sales} vendas · {r.conversion}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-primary">{r.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Performance metrics */}
            <motion.div variants={fadeUp} className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Ticket Médio", value: "R$ 287", icon: Banknote, change: "+8%" },
                { label: "Taxa de Conversão", value: "62%", icon: Target, change: "+5%" },
                { label: "Faturamento Semanal", value: "R$ 3.2K", icon: Calendar, change: "+15%" },
                { label: "Crescimento MRR", value: "+12%", icon: TrendingUp, change: "vs mês anterior" },
              ].map((m, i) => (
                <div key={i} className="bg-card/40 border border-border rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</span>
                    <m.icon className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <p className="text-xl font-display font-bold text-foreground">{m.value}</p>
                  <p className="text-[10px] text-primary font-mono mt-1 flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" /> {m.change}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* TAB: Transactions */}
        {(tab === "transactions" || tab === "expenses") && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar transação..." className="pl-9 bg-card/40" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "Todas" },
                  { key: "income", label: "Receitas" },
                  { key: "expense", label: "Despesas" },
                  { key: "pending", label: "Pendentes" },
                  { key: "overdue", label: "Atrasados" },
                ].map(f => (
                  <button key={f.key} onClick={() => setTxFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                      txFilter === f.key ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border hover:border-primary/30"
                    }`}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {/* Transactions list */}
            <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
              <div className="divide-y divide-border/50">
                {(tab === "expenses" ? filteredTx.filter(t => t.type === "expense") : filteredTx).map((tx, i) => {
                  const s = statusCfg[tx.status];
                  return (
                    <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-primary/5 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === "income" ? "bg-primary/10 border border-primary/30" : "bg-destructive/10 border border-destructive/30"
                      }`}>
                        {tx.type === "income" ? <ArrowDownLeft className="w-4 h-4 text-primary" /> : <ArrowUpRight className="w-4 h-4 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{tx.desc}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          {tx.method} · {tx.category} · {tx.agent}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-[10px] font-mono font-bold ${s.color}`}>{s.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">{tx.date}</span>
                      <span className={`text-sm font-bold font-mono shrink-0 ${tx.value >= 0 ? "text-primary" : "text-destructive"}`}>
                        {tx.value >= 0 ? "+" : ""}R$ {Math.abs(tx.value)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Reports */}
        {tab === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Total Recebido", value: `R$ ${totalReceita.toLocaleString()}`, icon: CheckCircle2, color: "text-primary" },
              { title: "Total Pendente", value: `R$ ${totalPendente.toLocaleString()}`, icon: Clock, color: "text-warning" },
              { title: "Total em Atraso", value: "R$ 398", icon: AlertTriangle, color: "text-destructive" },
              { title: "Total Despesas", value: `R$ ${totalDespesa.toLocaleString()}`, icon: ArrowUpRight, color: "text-destructive" },
              { title: "Lucro Bruto", value: `R$ ${lucro.toLocaleString()}`, icon: PiggyBank, color: "text-primary" },
              { title: "Lucro Líquido Est.", value: `R$ ${(lucro * 0.85).toFixed(0)}`, icon: DollarSign, color: "text-primary" },
              { title: "Ticket Médio", value: "R$ 287", icon: Banknote, color: "text-blue-400" },
              { title: "Taxa de Conversão", value: "62%", icon: Target, color: "text-warning" },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card/40 border border-border rounded-xl p-5 backdrop-blur-sm flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  r.color === "text-primary" ? "bg-primary/10 border border-primary/30" :
                  r.color === "text-warning" ? "bg-warning/10 border border-warning/30" :
                  r.color === "text-destructive" ? "bg-destructive/10 border border-destructive/30" :
                  "bg-blue-500/10 border border-blue-500/30"
                }`}>
                  <r.icon className={`w-5 h-5 ${r.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{r.title}</p>
                  <p className={`text-2xl font-display font-bold ${r.color}`}>{r.value}</p>
                </div>
              </motion.div>
            ))}

            {/* Export buttons */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 md:col-span-2 flex gap-3">
              {[
                { label: "Exportar PDF", icon: FileText },
                { label: "Exportar CSV", icon: Download },
                { label: "Exportar Excel", icon: BarChart3 },
              ].map(e => (
                <Button key={e.label} variant="outline" className="gap-2 flex-1" onClick={() => toast.message(e.label, { description: "Exportação real será conectada ao backend." })}>
                  <e.icon className="w-4 h-4" /> {e.label}
                </Button>
              ))}
            </motion.div>
          </div>
        )}

        {/* Security banner */}
        <motion.div variants={fadeUp} className="bg-card/30 border border-border rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-mono text-muted-foreground">
              <span className="text-primary font-bold">Dados financeiros mock</span> — PIX e gateway de pagamento serão conectados na fase de backend.
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/60">
              Nenhum pagamento real está sendo processado. Valores são simulação para design.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal: Novo Lançamento */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Novo Lançamento
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">Adicionar receita, despesa ou ajuste (mock).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as const).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    newType === t ? "ring-2 ring-primary border-primary bg-primary/10 text-primary" : "border-border bg-card/30 text-muted-foreground"
                  }`}
                >
                  {t === "income" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  {t === "income" ? "Receita" : "Despesa"}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Descrição *</label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Ex: Plano Pro — Cliente X" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Valor (R$) *</label>
              <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="299.00" type="number" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {["Assinatura", "Comissão", "Servidor", "API", "Marketing", "Outros"].map(c => (
                  <button key={c} onClick={() => setNewCat(c)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      newCat === c ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border"
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setNewOpen(false); toast.success("Lançamento adicionado (mock)!"); }} disabled={!newDesc.trim() || !newValue}
              className="gap-1"><CheckCircle2 className="w-4 h-4" /> Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
