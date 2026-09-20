// apps/modulos/hub/src/shared/layout/DashboardLayout.tsx
// Layout inspirado no MCP Market — sidebar 240px, 3 grupos MANAGE/MONITOR/WORKSPACE,
// item ativo com borda esquerda accent, footer com user card.
// Substitui o header horizontal antigo do Hub CentralDark.

import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { PanelLeft, MessageCircle, LifeBuoy, ChevronsUpDown } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  badge?: string;         // ex: "COMING SOON" ou contador
  badgeTone?: "info" | "warn" | "muted";
};

export type NavGroup = {
  id: string;
  label: string;          // MANAGE / MONITOR / WORKSPACE
  items: NavItem[];
};

interface DashboardLayoutProps {
  children: ReactNode;
  activeId: string;
  onSelect: (id: string) => void;
  groups: NavGroup[];
  brand?: { primary: string; suffix: string };  // ex: {primary:"CentralDark", suffix:"HUB"}
  user?: { initials: string; name: string; email: string };
}

const badgeToneCls: Record<NonNullable<NavItem["badgeTone"]>, string> = {
  info:  "bg-primary/10 text-primary border-primary/20",
  warn:  "bg-warning/15 text-warning border-warning/25",
  muted: "bg-muted text-muted-foreground border-border",
};

export function DashboardLayout({
  children,
  activeId,
  onSelect,
  groups,
  brand = { primary: "CentralDark", suffix: "HUB" },
  user = { initials: "CO", name: "contacobra3…", email: "contacobra346…" },
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-2">
          <span className="font-serif text-[22px] leading-none tracking-tight text-sidebar-foreground">
            {brand.primary}
          </span>
          <span className="text-sidebar-border">|</span>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
            {brand.suffix}
          </span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.id} className="mt-4 first:mt-2">
              <div className="px-2 py-1 text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase">
                {group.label}
              </div>
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = item.id === activeId;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSelect(item.id)}
                        className={cn(
                          "group relative w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary" />
                        )}
                        <item.Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "rounded px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide border",
                            badgeToneCls[item.badgeTone ?? "muted"]
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Rodapé: collapse + support/feedback + user card */}
        <div className="border-t border-sidebar-border px-3 py-2.5 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded hover:bg-sidebar-accent text-muted-foreground">
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1 flex gap-1.5">
              <button className="flex-1 flex items-center justify-center gap-1.5 text-[12px] py-1.5 rounded border border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground/80">
                <LifeBuoy className="h-3.5 w-3.5" /> Suporte
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 text-[12px] py-1.5 rounded border border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground/80">
                <MessageCircle className="h-3.5 w-3.5" /> Feedback
              </button>
            </div>
          </div>

          <button className="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors">
            <span className="h-8 w-8 shrink-0 rounded-md bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
              {user.initials}
            </span>
            <span className="flex-1 text-left min-w-0">
              <span className="block text-[13px] font-medium text-sidebar-foreground truncate">{user.name}</span>
              <span className="block text-[11px] text-muted-foreground truncate">{user.email}</span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        </div>
      </aside>

      {/* ── Conteúdo ────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
