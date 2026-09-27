// Sidebar do Admin CentralDark — esmeralda 3D-tátil.
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Boxes, Users, Sparkles } from "lucide-react";

const itens = [
  { to: "/centraldark/admin",          label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/centraldark/admin/modulos",  label: "Módulos",     icon: Boxes,           end: false },
  { to: "/centraldark/admin/usuarios", label: "Usuários",    icon: Users,           end: false },
];

export function SidebarAdmin() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur">
      <div className="flex h-14 items-center gap-2 border-b border-border/60 px-5 font-mono text-sm font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-lg icon-glow">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        Admin
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {itens.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors " +
              (isActive
                ? "border-primary/40 bg-primary/[0.08] text-primary shadow-3d-soft"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-card")
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-3 font-mono text-[10px] text-muted-foreground">
        CentralDark · Admin
      </div>
    </aside>
  );
}
