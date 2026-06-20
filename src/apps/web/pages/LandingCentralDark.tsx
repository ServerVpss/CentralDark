import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  Terminal,
  MessageCircle,
  Users,
  Wallet,
  ArrowRight,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const modules = [
  { name: "TelePainel", tag: "Bot Telegram de consultas", href: "/telepainel", icon: Terminal, accent: "152 76% 50%", status: "ativo" },
  { name: "Bot WhatsApp", tag: "Atendimento no WhatsApp", href: "/whatsapp", icon: MessageCircle, accent: "142 70% 45%", status: "em breve" },
  { name: "CRM", tag: "Clientes e funis", href: "/crm", icon: Users, accent: "262 70% 60%", status: "em breve" },
  { name: "Financeiro", tag: "Cobranças e PIX", href: "/financeiro", icon: Wallet, accent: "38 95% 55%", status: "em breve" },
];

const benefits = [
  { icon: Layers, title: "Tudo num só lugar", desc: "Cada produto é um módulo independente, mas todos vivem sob a mesma conta e o mesmo painel." },
  { icon: Zap, title: "Pegada nativa", desc: "Interface 3D tátil, rápida, com pegada de app de verdade. Funciona lindo no celular e no desktop." },
  { icon: ShieldCheck, title: "Segurança em primeiro lugar", desc: "Autenticação, controles de acesso e auditoria já vêm embutidos no portal." },
];

export default function LandingCentralDark() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Helmet>
        <title>CentralDark — Sua central de módulos</title>
        <meta name="description" content="CentralDark é a sua central de módulos: TelePainel, CRM, WhatsApp, Financeiro e mais. Um login, vários produtos." />
        <meta property="og:title" content="CentralDark — Sua central de módulos" />
        <meta property="og:description" content="Um portal, vários módulos. Comece pelo TelePainel e expanda quando quiser." />
      </Helmet>

      {/* Grid de fundo + brilho radial */}
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-[0.22]" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[700px]"
        style={{ background: "var(--gradient-radial-gold)" }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-subtle">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg icon-glow">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            CentralDark
          </Link>

          <nav className="hidden gap-7 font-mono text-[12px] text-muted-foreground md:flex">
            <a href="#modulos" className="transition hover:text-foreground">módulos</a>
            <a href="#porque" className="transition hover:text-foreground">por que</a>
            <Link to="/portal" className="transition hover:text-foreground">portal</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden font-mono text-[12px] text-muted-foreground transition hover:text-foreground sm:block"
            >
              entrar
            </Link>
            <Button
              asChild
              size="sm"
              className="h-8 rounded-lg bg-primary px-3 font-mono text-[12px] font-medium text-primary-foreground shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
            >
              <Link to="/auth">acessar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            uma conta · vários módulos
          </span>

          <h1 className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Sua central de
            <br />
            <span className="text-gradient-gold">módulos.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            CentralDark reúne TelePainel, CRM, WhatsApp, Financeiro e o que vier depois.
            Entre uma vez e abra o produto que precisar.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-lg bg-primary px-5 font-mono text-[13px] font-medium text-primary-foreground shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
            >
              <Link to="/auth">
                entrar
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 rounded-lg border border-border bg-card/50 px-5 font-mono text-[13px] text-foreground shadow-3d-soft active:translate-y-[1px] hover:bg-secondary"
            >
              <a href="#modulos">ver módulos</a>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[11px] text-muted-foreground/70">
            cadastro gratuito · sem cartão de crédito
          </p>
        </div>

        {/* Grid de cards de módulos */}
        <div id="modulos" className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => {
            const Icon = m.icon;
            const ativo = m.status === "ativo";
            return (
              <Link
                key={m.name}
                to={m.href}
                className="card-premium group relative overflow-hidden p-5 hover-lift"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
                  style={{ background: `hsl(${m.accent} / 0.18)` }}
                />
                <div
                  className="relative grid h-11 w-11 place-items-center rounded-xl shadow-3d-soft"
                  style={{ background: `hsl(${m.accent} / 0.12)`, color: `hsl(${m.accent})` }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="relative mt-4 flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{m.name}</h3>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider " +
                      (ativo
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground border border-border")
                    }
                  >
                    {m.status}
                  </span>
                </div>
                <p className="relative mt-1 text-sm text-muted-foreground">{m.tag}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* POR QUE */}
      <section id="porque" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-primary">por que</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Pensado pra crescer com você.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cada módulo evolui sozinho, mas todos compartilham a mesma identidade, login e cuidado com detalhe.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="card-premium p-7 hover-lift">
                <div className="inline-grid h-10 w-10 place-items-center rounded-lg icon-glow">
                  <b.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl icon-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Pronto pra abrir sua central?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Entre uma vez. Escolha o módulo. Comece a usar.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-12 rounded-lg bg-primary px-6 font-mono text-sm font-medium text-primary-foreground shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
          >
            <Link to="/auth">
              acessar CentralDark
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-md icon-glow">
              <Sparkles className="h-3 w-3" />
            </span>
            CentralDark © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 font-mono text-[11px] text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground">entrar</Link>
            <Link to="/portal" className="hover:text-foreground">portal</Link>
            <a href="#modulos" className="hover:text-foreground">módulos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
