# COMANDO - Financial.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot\src\pages\Financial.tsx
**SHA:** 5594ddc0d39f6b9c
**Timestamp:** 2026-08-26T19:31:02.620912
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const totalPendente = TRANSACTIONS.filter(t => t.status === "pending" || t.status === "overdue").reduce((s, t) => s + Math.abs(t.value), 0);

### Ouro Bruto (primeiros 5000 chars)
```
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
  const pixConfirmed = TRA
```