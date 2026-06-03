import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Check, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

type Feature = { title: string; desc: string };

export type ModuleLandingProps = {
  brand: string;
  tagline: string;
  description: string;
  status: "ativo" | "em breve";
  accent: string; // ex: "152 76% 50%"
  icon: LucideIcon;
  ctaHref?: string;
  ctaLabel?: string;
  features: Feature[];
  pageTitle: string;
  pageDescription: string;
};

export default function ModuleLanding({
  brand,
  tagline,
  description,
  status,
  accent,
  icon: Icon,
  ctaHref,
  ctaLabel,
  features,
  pageTitle,
  pageDescription,
}: ModuleLandingProps) {
  const ativo = status === "ativo";

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      {/* halo com a cor do módulo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[640px]"
        style={{
          background: `radial-gradient(ellipse at top, hsl(${accent} / 0.10), transparent 60%)`,
        }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-[0.18]" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-subtle">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/portal" className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            voltar ao portal
          </Link>
          <Link to="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg icon-glow">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            CentralDeck
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl shadow-3d-soft"
            style={{
              background: `hsl(${accent} / 0.14)`,
              color: `hsl(${accent})`,
            }}
          >
            <Icon className="h-7 w-7" />
          </div>

          <span
            className={
              "mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] " +
              (ativo
                ? "border border-primary/25 bg-primary/[0.08] text-primary"
                : "border border-border bg-muted text-muted-foreground")
            }
          >
            {ativo ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                módulo ativo
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                em breve
              </>
            )}
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            {brand}
          </h1>
          <p
            className="mx-auto mt-3 max-w-xl font-mono text-[13px]"
            style={{ color: `hsl(${accent})` }}
          >
            {tagline}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            {description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {ativo && ctaHref ? (
              <Button
                asChild
                size="lg"
                className="h-11 rounded-lg bg-primary px-5 font-mono text-[13px] font-medium text-primary-foreground shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
              >
                <Link to={ctaHref}>
                  {ctaLabel ?? "abrir módulo"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                disabled
                size="lg"
                className="h-11 cursor-not-allowed rounded-lg bg-muted px-5 font-mono text-[13px] text-muted-foreground"
              >
                em breve
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 rounded-lg border border-border bg-card/50 px-5 font-mono text-[13px] text-foreground shadow-3d-soft active:translate-y-[1px] hover:bg-secondary"
            >
              <Link to="/portal">ver outros módulos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-premium p-6 hover-lift">
              <div
                className="inline-grid h-10 w-10 place-items-center rounded-lg shadow-3d-soft"
                style={{
                  background: `hsl(${accent} / 0.12)`,
                  color: `hsl(${accent})`,
                }}
              >
                <Check className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 font-mono text-[11px] text-muted-foreground md:flex-row">
          <span>CentralDeck © {new Date().getFullYear()}</span>
          <div className="flex gap-5">
            <Link to="/portal" className="hover:text-foreground">portal</Link>
            <Link to="/" className="hover:text-foreground">home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
