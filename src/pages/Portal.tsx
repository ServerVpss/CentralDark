import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Terminal,
  MessageCircle,
  Users,
  Wallet,
  LogOut,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

type Module = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  landing: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "ativo" | "em breve";
  accent: string; // hsl tone
};

const modules: Module[] = [
  {
    id: "telepainel",
    name: "TelePainel",
    tagline: "Bot Telegram de consultas",
    href: "/dashboard",
    landing: "/telepainel",
    icon: Terminal,
    status: "ativo",
    accent: "152 76% 50%",
  },
  {
    id: "whatsapp",
    name: "Bot WhatsApp",
    tagline: "Atendimento e consultas no WhatsApp",
    href: "/whatsapp",
    landing: "/whatsapp",
    icon: MessageCircle,
    status: "em breve",
    accent: "142 70% 45%",
  },
  {
    id: "crm",
    name: "CRM",
    tagline: "Gestão de clientes e funis",
    href: "/crm",
    landing: "/crm",
    icon: Users,
    status: "em breve",
    accent: "262 70% 60%",
  },
  {
    id: "financeiro",
    name: "Financeiro",
    tagline: "Cobranças, PIX e relatórios",
    href: "/financeiro",
    landing: "/financeiro",
    icon: Wallet,
    status: "em breve",
    accent: "38 95% 55%",
  },
];

export default function Portal() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Helmet>
        <title>CentralDeck — Portal de módulos</title>
        <meta name="description" content="Sua central de módulos. Acesse TelePainel, CRM, WhatsApp e Financeiro num só lugar." />
      </Helmet>

      {/* Brilho radial */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[640px]"
        style={{ background: "var(--gradient-radial-gold)" }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-[0.18]" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-subtle">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/portal" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg icon-glow">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            CentralDeck
          </Link>

          <div className="flex items-center gap-2">
            {user?.email && (
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:block">
                {user.email}
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={signOut}
              className="h-8 gap-1.5 rounded-lg border border-border bg-card/60 px-3 font-mono text-[12px] text-foreground shadow-3d-soft active:translate-y-[1px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              sair
            </Button>
          </div>
        </div>
      </header>

      {/* HERO leve */}
      <section className="relative mx-auto max-w-6xl px-6 pb-6 pt-12 md:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            portal central · escolha um módulo
          </span>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Sua central de <span className="text-gradient-gold">módulos</span>.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Cada card abre um produto independente. Comece pelo que estiver ativo.
          </p>
        </div>
      </section>

      {/* GRID DE MÓDULOS */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {modules.map((m) => {
            const Icon = m.icon;
            const ativo = m.status === "ativo";
            return (
              <div
                key={m.id}
                className="card-premium group relative overflow-hidden p-6 hover-lift"
              >
                {/* halo de cor por módulo */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                  style={{ background: `hsl(${m.accent} / 0.18)` }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-xl shadow-3d-soft"
                    style={{
                      background: `hsl(${m.accent} / 0.12)`,
                      color: `hsl(${m.accent})`,
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider " +
                      (ativo
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground border border-border")
                    }
                  >
                    {m.status}
                  </span>
                </div>

                <h2 className="relative mt-5 text-xl font-semibold tracking-tight text-foreground">
                  {m.name}
                </h2>
                <p className="relative mt-1 text-sm text-muted-foreground">{m.tagline}</p>

                <div className="relative mt-6 flex items-center gap-2">
                  <Button
                    asChild
                    disabled={!ativo}
                    className={
                      "h-10 flex-1 rounded-lg font-mono text-[12px] active:translate-y-[1px] " +
                      (ativo
                        ? "bg-primary text-primary-foreground shadow-3d-primary hover:bg-primary-glow"
                        : "bg-muted text-muted-foreground cursor-not-allowed")
                    }
                  >
                    {ativo ? (
                      <Link to={m.href}>
                        abrir módulo
                        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span>indisponível</span>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 rounded-lg border border-border bg-card/60 px-3 font-mono text-[12px] text-foreground shadow-3d-soft active:translate-y-[1px]"
                  >
                    <Link to={m.landing}>saiba mais</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 font-mono text-[11px] text-muted-foreground md:flex-row">
          <span>CentralDeck © {new Date().getFullYear()}</span>
          <Link to="/" className="hover:text-foreground">voltar à página inicial</Link>
        </div>
      </footer>
    </div>
  );
}
