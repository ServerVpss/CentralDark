import {
  LayoutDashboard, Server, Users, MessageSquare, Megaphone, GitBranch, Zap,
  Webhook, Plug, Settings, FileText, HardDrive, HelpCircle, Box, X, LogOut,
  Crown, DollarSign, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type MenuItem = { icon: React.ElementType; label: string; to: string; badge?: string };
type MenuSection = { title: string; items: MenuItem[] };

const sections: MenuSection[] = [
  {
    title: "",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/" },
    ],
  },
  {
    title: "Operacional",
    items: [
      { icon: Server, label: "Conexões WhatsApp", to: "/instancias" },
      { icon: MessageSquare, label: "Chats", to: "/chats" },
      { icon: Users, label: "Contatos", to: "/contatos" },
      { icon: Megaphone, label: "Campanhas", to: "/campanhas" },
      { icon: Zap, label: "Auto Respostas", to: "/auto-respostas" },
    ],
  },
  {
    title: "Automação",
    items: [
      { icon: GitBranch, label: "Fluxos (Nodes)", to: "/fluxos", badge: "Novo" },
      { icon: Webhook, label: "Webhooks", to: "/webhooks" },
      { icon: Plug, label: "API & Integrações", to: "/api" },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { icon: DollarSign, label: "Financeiro", to: "/financeiro" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { icon: Settings, label: "Configurações", to: "/configuracoes" },
      { icon: Radio, label: "Sessões", to: "/sessoes" },
      { icon: HardDrive, label: "Backups", to: "/backups" },
      { icon: HelpCircle, label: "Ajuda & Suporte", to: "/ajuda" },
    ],
  },
];

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { signOut } = useAuth();
  let globalIdx = 0;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "var(--sidebar-offset, 0%)" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={cn(
          "shrink-0 border-r border-border bg-sidebar/95 backdrop-blur-xl flex flex-col",
          "fixed inset-y-0 left-0 z-50 w-64 lg:static lg:translate-x-0"
        )}
        style={{ "--sidebar-offset": "-100%" } as React.CSSProperties}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-border">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 flex-1 hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center border-glow">
              <Box className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-wider text-foreground">WABOT CONSOLE</h1>
              <p className="text-[10px] text-muted-foreground font-mono">v2.5.0</p>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation — painel do usuário */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {sections.map((section) => (
            <div key={section.title || "main"} className="mb-1">
              {section.title && (
                <p className="px-3 pt-4 pb-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((it) => {
                  const idx = globalIdx++;
                  return (
                    <motion.div
                      key={it.to}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.015 }}
                    >
                      <NavLink
                        to={it.to}
                        end={it.to === "/"}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all group",
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/30 border-glow"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary border border-transparent"
                          )
                        }
                      >
                        <it.icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left truncate">{it.label}</span>
                        {it.badge && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                            {it.badge}
                          </span>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Admin + Logout — separados do menu normal */}
        <div className="border-t border-border p-3 space-y-1">
          {/* Botão Admin Master */}
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-warning/10 text-warning border border-warning/30"
                  : "text-sidebar-foreground hover:bg-warning/10 hover:text-warning border border-transparent"
              )
            }
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left uppercase text-xs font-bold tracking-wide">Administrador</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-warning/20 text-warning border border-warning/30">
              Master
            </span>
          </NavLink>

          {/* Botão Encerrar Sessão */}
          <button
            onClick={() => { signOut(); if (onClose) onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-mono tracking-wide text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive border border-transparent"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left uppercase text-xs font-bold">Encerrar Sessão</span>
          </button>
        </div>
      </motion.aside>

      <style>{`
        @media (min-width: 1024px) {
          aside { transform: none !important; }
        }
      `}</style>
    </>
  );
}
