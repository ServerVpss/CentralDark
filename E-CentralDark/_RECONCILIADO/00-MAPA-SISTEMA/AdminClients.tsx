import { useState } from "react";
import { isoBR } from "@/lib/datetime";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Building2, Plus, Search, Users, Wifi, MessageSquare, DollarSign, Ban,
  CheckCircle2, AlertTriangle, Eye, Trash2, Settings2, ChevronRight,
  Shield, Crown, MoreVertical, Clock, Filter,
} from "lucide-react";
import { toast } from "sonner";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

interface Client {
  id: number; name: string; email: string; plan: string; connections: number;
  maxConnections: number; status: string; mrr: string; msgs: string; created: string;
}

const INITIAL: Client[] = [
  { id: 1, name: "TechSolutions LTDA", email: "admin@techsolutions.com", plan: "Business", connections: 12, maxConnections: 20, status: "active", mrr: "R$ 599", msgs: "12.4K", created: "2026-01-15" },
  { id: 2, name: "Vendas Express", email: "contato@vendasexpress.com", plan: "Pro", connections: 5, maxConnections: 10, status: "active", mrr: "R$ 299", msgs: "8.2K", created: "2026-02-20" },
  { id: 3, name: "Marketing Digital SA", email: "mkt@digitalsa.com", plan: "Pro", connections: 3, maxConnections: 10, status: "active", mrr: "R$ 299", msgs: "5.1K", created: "2026-02-28" },
  { id: 4, name: "AutoPeças Brasil", email: "sac@autopecas.com", plan: "Starter", connections: 2, maxConnections: 3, status: "active", mrr: "R$ 99", msgs: "2.3K", created: "2026-03-10" },
  { id: 5, name: "Clínica Saúde+", email: "admin@clinicasaude.com", plan: "Pro", connections: 4, maxConnections: 10, status: "overdue", mrr: "R$ 299", msgs: "3.8K", created: "2026-03-15" },
  { id: 6, name: "João Freelancer", email: "joao@email.com", plan: "Free", connections: 1, maxConnections: 1, status: "active", mrr: "Grátis", msgs: "456", created: "2026-04-01" },
  { id: 7, name: "Imobiliária Centro", email: "contato@imobcentro.com", plan: "Starter", connections: 2, maxConnections: 3, status: "overdue", mrr: "R$ 99", msgs: "1.1K", created: "2026-04-05" },
  { id: 8, name: "Restaurante Sabor", email: "sabor@email.com", plan: "Free", connections: 1, maxConnections: 1, status: "blocked", mrr: "Grátis", msgs: "0", created: "2026-04-10" },
];

const planColors: Record<string, string> = {
  Free: "bg-muted/30 text-muted-foreground border-border",
  Starter: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Pro: "bg-primary/10 text-primary border-primary/30",
  Business: "bg-warning/10 text-warning border-warning/30",
};

const statusCfg: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  active: { label: "Ativo", color: "text-primary", dot: "bg-primary", bg: "bg-primary/10" },
  overdue: { label: "Inadimplente", color: "text-destructive", dot: "bg-destructive animate-pulse", bg: "bg-destructive/10" },
  blocked: { label: "Bloqueado", color: "text-muted-foreground", dot: "bg-muted-foreground", bg: "bg-muted/20" },
};

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>(INITIAL);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState("Free");

  const counts = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    overdue: clients.filter(c => c.status === "overdue").length,
    blocked: clients.filter(c => c.status === "blocked").length,
  };

  const filtered = clients.filter(c => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    setClients(prev => [...prev, {
      id: Date.now(), name: newName.trim(), email: newEmail.trim() || "email@exemplo.com",
      plan: newPlan, connections: 0, maxConnections: newPlan === "Free" ? 1 : newPlan === "Starter" ? 3 : newPlan === "Pro" ? 10 : 20,
      status: "active", mrr: newPlan === "Free" ? "Grátis" : newPlan === "Starter" ? "R$ 99" : newPlan === "Pro" ? "R$ 299" : "R$ 599",
      msgs: "0", created: isoBR().slice(0, 10),
    }]);
    setNewOpen(false); setNewName(""); setNewEmail(""); setNewPlan("Free");
    toast.success("Cliente criado (mock)!");
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-wide flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" /> Gerenciar Clientes
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">Cadastro, planos e status de todos os clientes do sistema.</p>
          </div>
          <Button onClick={() => setNewOpen(true)} className="gap-2 shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        </motion.div>

        {/* Summary */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: counts.total, icon: Building2, color: "text-blue-400" },
            { label: "Ativos", value: counts.active, icon: CheckCircle2, color: "text-primary" },
            { label: "Inadimplentes", value: counts.overdue, icon: AlertTriangle, color: "text-destructive" },
            { label: "Bloqueados", value: counts.blocked, icon: Ban, color: "text-muted-foreground" },
          ].map((s, i) => (
            <div key={i} className="bg-card/50 border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters + Search */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card/40 border-border" />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Todos", count: counts.total },
              { key: "active", label: "Ativos", count: counts.active },
              { key: "overdue", label: "Inadimpl.", count: counts.overdue },
              { key: "blocked", label: "Bloq.", count: counts.blocked },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                  filter === f.key ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border hover:border-primary/30"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Client cards */}
        <div className="space-y-2">
          {filtered.map((c, i) => {
            const s = statusCfg[c.status];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card/40 border border-border rounded-xl p-4 backdrop-blur-sm hover:border-primary/30 transition-all flex flex-col md:flex-row items-start md:items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{c.email}</p>
                </div>
                <Badge variant="outline" className={`text-[9px] font-mono uppercase shrink-0 ${planColors[c.plan]}`}>{c.plan}</Badge>
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> {c.connections}/{c.maxConnections}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {c.msgs}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {c.mrr}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className={`text-[10px] font-mono font-bold ${s.color}`}>{s.label}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => { setDetailClient(c); setDetailOpen(true); }}
                    className="w-8 px-0 bg-background/50 border-border/50 hover:text-primary hover:border-primary/30">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setClients(prev => prev.filter(x => x.id !== c.id)); toast.error("Cliente removido (mock)."); }}
                    className="w-8 px-0 bg-background/50 border-destructive/30 hover:bg-destructive hover:text-destructive-foreground text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security */}
        <motion.div variants={fadeUp} className="bg-card/30 border border-border rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-primary font-bold">Mock/visual</span> — Clientes reais serão isolados por workspace_id via Supabase + RLS.
            Nenhum dado real de cliente existe nesta fase.
          </p>
        </motion.div>
      </motion.div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {detailClient && (() => {
            const s = statusCfg[detailClient.status];
            return (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{detailClient.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground">{detailClient.email}</p>
                  </div>
                </div>
                <Separator className="bg-border/50" />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { l: "Plano", v: detailClient.plan }, { l: "Status", v: s.label },
                    { l: "Conexões", v: `${detailClient.connections}/${detailClient.maxConnections}` },
                    { l: "Mensagens/mês", v: detailClient.msgs }, { l: "Valor", v: detailClient.mrr },
                    { l: "Desde", v: detailClient.created },
                  ].map(i => (
                    <div key={i.l}><p className="text-[10px] font-mono uppercase text-muted-foreground">{i.l}</p><p className="font-bold">{i.v}</p></div>
                  ))}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* New Client Modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Novo Cliente</DialogTitle>
            <DialogDescription className="font-mono text-xs">Cadastrar novo cliente/workspace (mock).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Nome da empresa *</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Minha Empresa LTDA" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Email</label>
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@empresa.com" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Plano</label>
              <div className="grid grid-cols-4 gap-2">
                {["Free", "Starter", "Pro", "Business"].map(p => (
                  <button key={p} onClick={() => setNewPlan(p)}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${newPlan === p ? "ring-2 ring-primary border-primary bg-primary/10 text-primary" : "border-border bg-card/30 text-muted-foreground hover:border-primary/30"}`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()} className="gap-1">
              <CheckCircle2 className="w-4 h-4" /> Criar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
