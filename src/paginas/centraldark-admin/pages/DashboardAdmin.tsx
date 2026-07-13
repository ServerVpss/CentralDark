// Visão geral: cards com contagens reais (módulos ativos, usuários).
import { useEffect, useState } from "react";
import { Boxes, Users, CheckCircle2, Clock } from "lucide-react";
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
