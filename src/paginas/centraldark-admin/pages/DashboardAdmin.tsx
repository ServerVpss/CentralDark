// Visão geral: cards com contagens reais (módulos ativos, usuários).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Users, CheckCircle2, Clock, Gamepad2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useModulosPortal } from "../hooks/useModulosPortal";

export default function DashboardAdmin() {
  const { modulos } = useModulosPortal();
  const [qtdUsuarios, setQtdUsuarios] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => setQtdUsuarios(count ?? 0));
  }, []);

  const ativos = modulos.filter((m) => m.status === "ativo").length;
  const emProcesso = modulos.filter((m) => m.status === "em processo").length;

  const cards = [
    { label: "Módulos totais",   valor: modulos.length,        icon: Boxes,        tom: "text-primary" },
    { label: "Módulos ativos",   valor: ativos,                icon: CheckCircle2, tom: "text-primary" },
    { label: "Em processo",      valor: emProcesso,            icon: Clock,        tom: "text-muted-foreground" },
    { label: "Usuários",         valor: qtdUsuarios ?? "…",    icon: Users,        tom: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Painel de controle do ecossistema CentralDark.
        </p>
      </div>

      <Link
        to="/admin/cockpit"
        className="group relative block overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 shadow-3d-soft transition hover:border-primary hover:shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Gamepad2 className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[11px] uppercase tracking-wider text-primary">
              modo comando
            </div>
            <h2 className="mt-1 text-xl font-semibold">🎮 Entrar na Sala de Controle</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cockpit ao vivo: Hermes, IAs, VPS, PM2, bots, edges, gateway, MCP e HUB num painel só.
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-primary transition group-hover:translate-x-1" />
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, valor, icon: Icon, tom }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-3d-soft">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <Icon className={"h-4 w-4 " + tom} />
            </div>
            <div className="mt-3 text-3xl font-semibold">{valor}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-3d-soft">
        <h2 className="text-sm font-semibold">Próximos passos</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Editar módulos do Portal em <code className="text-foreground">Módulos</code>.</li>
          <li>• Ver quem tem acesso admin em <code className="text-foreground">Usuários</code>.</li>
          <li>• Novas seções (temas, textos, logs) chegam nas próximas fases.</li>
        </ul>
      </div>
    </div>
  );
}
