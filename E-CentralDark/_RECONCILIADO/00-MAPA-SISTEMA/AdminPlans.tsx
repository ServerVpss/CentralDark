import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard, Star, Zap, Crown, Check, X, Users, Wifi, MessageSquare,
  Bot, Shield, Megaphone, Clock,
} from "lucide-react";
import { toast } from "sonner";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, type: "spring" } } };

const PLANS = [
  {
    name: "Free", price: "Grátis", period: "para sempre", icon: Star, color: "border-border",
    highlight: false, clients: 4,
    features: [
      { name: "1 conexão WhatsApp", included: true },
      { name: "500 msgs/mês", included: true },
      { name: "100 contatos", included: true },
      { name: "Campanhas", included: false },
      { name: "Auto-respostas", included: false },
      { name: "Fluxos (Nodes)", included: false },
      { name: "API & Webhooks", included: false },
      { name: "Suporte prioritário", included: false },
    ],
  },
  {
    name: "Starter", price: "R$ 99", period: "/mês", icon: Zap, color: "border-blue-500/40",
    highlight: false, clients: 6,
    features: [
      { name: "3 conexões WhatsApp", included: true },
      { name: "5.000 msgs/mês", included: true },
      { name: "1.000 contatos", included: true },
      { name: "Campanhas básicas", included: true },
      { name: "Auto-respostas", included: true },
      { name: "Fluxos (Nodes)", included: false },
      { name: "API & Webhooks", included: false },
      { name: "Suporte prioritário", included: false },
    ],
  },
  {
    name: "Pro", price: "R$ 299", period: "/mês", icon: Crown, color: "border-primary/50",
    highlight: true, clients: 10,
    features: [
      { name: "10 conexões WhatsApp", included: true },
      { name: "50.000 msgs/mês", included: true },
      { name: "Contatos ilimitados", included: true },
      { name: "Campanhas avançadas", included: true },
      { name: "Auto-respostas", included: true },
      { name: "Fluxos (Nodes)", included: true },
      { name: "API & Webhooks", included: true },
      { name: "Suporte prioritário", included: false },
    ],
  },
  {
    name: "Business", price: "R$ 599", period: "/mês", icon: Crown, color: "border-warning/50",
    highlight: false, clients: 4,
    features: [
      { name: "20 conexões WhatsApp", included: true },
      { name: "Msgs ilimitadas", included: true },
      { name: "Contatos ilimitados", included: true },
      { name: "Campanhas ilimitadas", included: true },
      { name: "Auto-respostas", included: true },
      { name: "Fluxos (Nodes)", included: true },
      { name: "API & Webhooks", included: true },
      { name: "Suporte prioritário 24/7", included: true },
    ],
  },
];

export default function AdminPlans() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold font-display tracking-wide flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-warning" /> Planos & Limites
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Configure os planos disponíveis para seus clientes.
          </p>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <motion.div key={plan.name} variants={fadeUp} whileHover={{ y: -5 }}
              className={`bg-card/50 border-2 rounded-2xl backdrop-blur-sm overflow-hidden flex flex-col ${plan.color} ${
                plan.highlight ? "shadow-[0_0_30px_hsl(var(--primary)/0.15)] ring-1 ring-primary/20" : ""
              }`}
            >
              {plan.highlight && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-[10px] font-mono font-bold uppercase tracking-widest">
                  Mais Popular
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <plan.icon className={`w-5 h-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-display font-bold text-lg">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="font-display text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <div className="mb-4">
                  <Badge variant="outline" className="text-[9px] font-mono border-border text-muted-foreground">
                    <Users className="w-2.5 h-2.5 mr-1" /> {plan.clients} clientes neste plano
                  </Badge>
                </div>

                <div className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <div key={f.name} className="flex items-center gap-2 text-xs">
                      {f.included ? (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/50 line-through"}>
                        {f.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className="w-full mt-6"
                  onClick={() => toast.message(`Editar plano: ${plan.name}`, { description: "Edição de planos será conectada ao backend." })}
                >
                  Editar Plano
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Limits table */}
        <motion.div variants={fadeUp} className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="font-display font-bold text-sm tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Comparativo de Limites
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-4 py-3 font-mono uppercase tracking-wider text-muted-foreground">Recurso</th>
                  {PLANS.map(p => (
                    <th key={p.name} className="text-center px-4 py-3 font-mono uppercase tracking-wider text-muted-foreground">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { icon: Wifi, resource: "Conexões WhatsApp", values: ["1", "3", "10", "20"] },
                  { icon: MessageSquare, resource: "Mensagens/mês", values: ["500", "5K", "50K", "∞"] },
                  { icon: Users, resource: "Contatos", values: ["100", "1K", "∞", "∞"] },
                  { icon: Megaphone, resource: "Campanhas", values: ["—", "Básicas", "Avançadas", "∞"] },
                  { icon: Bot, resource: "Auto-Respostas", values: ["—", "✓", "✓", "✓"] },
                  { icon: Zap, resource: "Fluxos (Nodes)", values: ["—", "—", "✓", "✓"] },
                  { icon: Shield, resource: "API & Webhooks", values: ["—", "—", "✓", "✓"] },
                  { icon: Clock, resource: "Suporte", values: ["Email", "Email", "Chat", "24/7"] },
                ].map((row) => (
                  <tr key={row.resource} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 font-bold flex items-center gap-2">
                      <row.icon className="w-3.5 h-3.5 text-muted-foreground" /> {row.resource}
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`text-center px-4 py-3 font-mono ${v === "—" ? "text-muted-foreground/30" : v === "∞" || v === "✓" ? "text-primary font-bold" : "text-foreground"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div variants={fadeUp} className="bg-card/30 border border-border rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-primary font-bold">Visual/mock</span> — Planos e limites serão enforced via Supabase RLS + backend.
            Billing real (Stripe/Mercado Pago) na fase de integração.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
