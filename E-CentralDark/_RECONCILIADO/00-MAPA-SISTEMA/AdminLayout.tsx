import {
  Crown, Building2, CreditCard, DollarSign, UserCog, FileText, BarChart3,
  Settings, Box, X, LogOut, ArrowLeft, Shield, Activity,
  Server, MessageSquare, Users, Megaphone, Zap, GitBranch, Webhook, Plug,
  Radio, HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, createContext, useContext } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { HackerMode } from "@/components/dashboard/HackerMode";

// ---------------------------------------------------------------------------
// Admin Client Context — seletor global de cliente
// ---------------------------------------------------------------------------
interface AdminClientContextType {
  selectedClient: string;
  setSelectedClient: (v: string) => void;
  clients: { id: string; name: string }[];
}

const AdminClientContext = createContext<AdminClientContextType>({
  selectedClient: "all",
  setSelectedClient: () => {},
  clients: [],
});

export function useAdminClient() {
  return useContext(AdminClientContext);
}

const MOCK_CLIENTS = [
  { id: "all", name: "Todos os Clientes" },
  { id: "1", name: "TechSolutions LTDA" },
  { id: "2", name: "Vendas Express" },
  { id: "3", name: "Marketing Digital SA" },
  { id: "4", name: "AutoPeças Brasil" },
  { id: "5", name: "Clínica Saúde+" },
  { id: "6", name: "João Freelancer" },
  { id: "7", name: "Imobiliária Centro" },
  { id: "8", name: "Restaurante Sabor" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MenuItem = { icon: React.ElementType; label: string; to: string; badge?: string };
type MenuSection = { title: string; items: MenuItem[] };

const adminSections: MenuSection[] = [
  {
    title: "",
    items: [
      { icon: BarChart3, label: "Visão Geral", to: "/admin" },
    ],
  },
  {
    title: "Gestão",
    items: [
      { icon: Building2, label: "Clientes", to: "/admin/clientes" },
      { icon: CreditCard, label: "Planos & Limites", to: "/admin/planos" },
      { icon: UserCog, label: "Usuários", to: "/admin/usuarios" },
    ],
  },
  {
    title: "Operacional",
    items: [
      { icon: Server, label: "Conexões", to: "/admin/conexoes" },
      { icon: MessageSquare, label: "Chats", to: "/admin/chats" },
      { icon: Users, label: "Contatos", to: "/admin/contatos" },
      { icon: Megaphone, label: "Campanhas", to: "/admin/campanhas" },
      { icon: Zap, label: "Auto Respostas", to: "/admin/auto-respostas" },
    ],
  },
  {
    title: "Automação",
    items: [
      { icon: GitBranch, label: "Fluxos", to: "/admin/fluxos" },
      { icon: Webhook, label: "Webhooks", to: "/admin/webhooks" },
      { icon: Plug, label: "API & Tokens", to: "/admin/api" },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { icon: DollarSign, label: "Financeiro", to: "/admin/financeiro" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { icon: FileText, label: "Logs Global", to: "/admin/logs" },
      { icon: Radio, label: "Sessões", to: "/admin/sessoes" },
      { icon: HardDrive, label: "Backups", to: "/admin/backups" },
      { icon: Activity, label: "Monitoramento", to: "/admin/monitoramento" },
      { icon: Shield, label: "Cofre Lovable", to: "/admin/cofre" },
      { icon: Settings, label: "Config Global", to: "/admin/configuracoes" },
    ],
  },
];

// ---------------------------------------------------------------------------
// AdminSidebar
// ---------------------------------------------------------------------------
function AdminSidebar({
  open = false,
  onClose,
  selectedClient,
  setSelectedClient,
}: {
  open?: boolean;
  onClose?: () => void;
  selectedClient: string;
  setSelectedClient: (v: string) => void;
}) {
  const { logout } = useAuth();
  let globalIdx = 0;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} onClick={onClose}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "var(--sidebar-offset, 0%)" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={cn(
          "shrink-0 border-r border-warning/20 bg-sidebar/95 backdrop-blur-xl flex flex-col",
          "fixed inset-y-0 left-0 z-50 w-64 lg:static lg:translate-x-0"
        )}
        style={{ "--sidebar-offset": "-100%" } as React.CSSProperties}
      >
        {/* Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-warning/20 bg-warning/5">
          <NavLink to="/admin" onClick={onClose} className="flex items-center gap-3 flex-1 hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-lg bg-warning/15 border border-warning/40 flex items-center justify-center">
              <Crown className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-wider text-foreground">ADMIN</h1>
              <p className="text-[10px] text-warning font-mono font-bold">Painel Master</p>
            </div>
          </NavLink>
          <button onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-warning"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voltar ao painel */}
        <div className="px-3 pt-3 pb-1">
          <Link to="/" onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border/50 hover:border-primary/30 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>

        {/* Seletor de cliente */}
        <div className="px-3 py-2">
          <label className="text-[8px] font-mono font-bold uppercase tracking-[0.15em] text-warning/50 px-1 mb-1 block">
            Ver como
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-background/50 border border-warning/30 text-foreground focus:outline-none focus:ring-1 focus:ring-warning/50 appearance-none cursor-pointer"
          >
            {MOCK_CLIENTS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-1 px-2">
          {adminSections.map((section) => (
            <div key={section.title || "main"} className="mb-0.5">
              {section.title && (
                <p className="px-3 pt-3 pb-1 text-[8px] font-mono font-bold uppercase tracking-[0.15em] text-warning/50">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((it) => {
                  const idx = globalIdx++;
                  return (
                    <motion.div key={it.to}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.012 }}
                    >
                      <NavLink to={it.to} end={it.to === "/admin"} onClick={onClose}
                        className={({ isActive }) => cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12px] transition-all group",
                          isActive
                            ? "bg-warning/10 text-warning border border-warning/30"
                            : "text-sidebar-foreground hover:bg-warning/5 hover:text-warning border border-transparent"
                        )}
                      >
                        <it.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 text-left truncate">{it.label}</span>
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-warning/20 p-3">
          <button onClick={() => { logout(); if (onClose) onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all font-mono text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive border border-transparent"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left uppercase text-xs font-bold">Encerrar Sessão</span>
          </button>
        </div>
      </motion.aside>

      <style>{`@media(min-width:1024px){aside{transform:none!important}}`}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
// AdminLayout
// ---------------------------------------------------------------------------
export function AdminLayout() {
  const [hackerOpen, setHackerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("all");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setHackerOpen(false); setSidebarOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AdminClientContext.Provider value={{ selectedClient, setSelectedClient, clients: MOCK_CLIENTS }}>
      <div className="relative flex h-screen overflow-hidden text-foreground">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
          <Topbar onToggleHacker={() => setHackerOpen(true)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
        <HackerMode open={hackerOpen} onClose={() => setHackerOpen(false)} />
      </div>
    </AdminClientContext.Provider>
  );
}
