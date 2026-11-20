import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LogOut, Sparkles } from "lucide-react";
import { useAuthContext } from "@/shared/auth/AuthProvider";
import iconWhatsapp from "@/shared/assets/icon-whatsapp.png";
import iconCrm from "@/shared/assets/icon-crm.png";
import iconTelegram from "@/shared/assets/icon-telegram.png";
import iconFinanceiro from "@/shared/assets/icon-financeiro.png";

type Module = {
  id: string;
  name: string;
  icon: string;
  href: string;
  status: "ativo" | "em breve";
};

const modules: Module[] = [
  { id: "whatsapp", name: "Bot WhatsApp", icon: iconWhatsapp, href: "/whatsapp", status: "ativo" },
  { id: "crm", name: "CRM", icon: iconCrm, href: "/crm", status: "ativo" },
  { id: "telegram", name: "TelePainel", icon: iconTelegram, href: "/telepainel/dashboard", status: "ativo" },
  { id: "financeiro", name: "Financeiro", icon: iconFinanceiro, href: "/financeiro", status: "em breve" },
];

export default function Portal() {
  const { signOut, user } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Helmet>
        <title>CentralDark — Portal</title>
        <meta name="description" content="Portal CentralDark — escolha o módulo." />
      </Helmet>

      {/* Halo verde sutil no topo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px]"
        style={{ background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.10), transparent 60%)" }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-[0.15]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-subtle">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg icon-glow">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            CentralDark
          </Link>
          <button
            onClick={handleSignOut}
            aria-label="Sair"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-foreground shadow-3d-soft active:translate-y-[1px]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-md px-5 pb-10 pt-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            portal · escolha um módulo
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Sua central de <span className="text-gradient-gold">módulos</span>
          </h1>
          {user?.email && (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">{user.email}</p>
          )}
        </div>

        {/* Grid 2 colunas estilo app */}
        <div className="mt-7 grid grid-cols-2 gap-4">
          {modules.map((m) => {
            const ativo = m.status === "ativo";
            const Card = (
              <div
                className={
                  "relative aspect-square rounded-2xl border bg-card p-3 transition-all active:translate-y-[1px] " +
                  (ativo
                    ? "border-primary/40 shadow-3d-primary hover:border-primary/60"
                    : "border-border shadow-3d-soft opacity-90")
                }
              >
                {!ativo && (
                  <span className="absolute right-2 top-2 rounded-full border border-border bg-background/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                    em breve
                  </span>
                )}
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <img
                    src={m.icon}
                    alt={m.name}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-[58%] w-[58%] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                  />
                  <span className="text-center text-[13px] font-medium leading-tight text-foreground">
                    {m.name}
                  </span>
                </div>
              </div>
            );

            return ativo ? (
              <Link key={m.id} to={m.href} className="block">{Card}</Link>
            ) : (
              <div key={m.id}>{Card}</div>
            );
          })}
        </div>

        <p className="mt-10 text-center font-mono text-[10px] text-muted-foreground">
          CentralDark · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
