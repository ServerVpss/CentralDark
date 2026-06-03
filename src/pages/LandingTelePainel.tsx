import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Zap,
  Database,
  Lock,
  Cpu,
  Activity,
  Check,
  ArrowRight,
  Terminal,
  Sparkles,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const stats = [
  { label: "consultas processadas", value: "2.4M+" },
  { label: "uptime garantido", value: "99.9%" },
  { label: "tempo médio de resposta", value: "<2s" },
  { label: "fontes integradas", value: "75+" },
];

const features = [
  {
    icon: Zap,
    title: "Resposta instantânea",
    desc: "Consultas processadas em menos de 2 segundos diretamente no Telegram. Sem espera, sem cache desatualizado.",
  },
  {
    icon: Database,
    title: "Múltiplas fontes de dados",
    desc: "Consultas de veículos, documentos, contatos, score de crédito e muito mais — tudo num só lugar.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança de nível bancário",
    desc: "Criptografia ponta a ponta, autenticação Telegram nativa e logs auditáveis. Seus dados protegidos.",
  },
  {
    icon: Cpu,
    title: "Infraestrutura resiliente",
    desc: "Fallback automático entre provedores. Se uma fonte falha, outra entra em ação imediatamente.",
  },
  {
    icon: Activity,
    title: "Monitoramento em tempo real",
    desc: "Painel ao vivo com saúde dos módulos, latência por provedor e status de cada consulta.",
  },
  {
    icon: Lock,
    title: "Privacidade total",
    desc: "Suas consultas são suas. Não vendemos, não compartilhamos, não usamos seus dados para nada.",
  },
];

const plans = [
  {
    name: "Iniciante",
    badge: "Para começar",
    perks: ["Consultas essenciais", "Suporte por chat", "Acesso ao bot privado", "Histórico de consultas"],
  },
  {
    name: "Profissional",
    badge: "Mais popular",
    highlight: true,
    perks: [
      "Todas as consultas premium",
      "Prioridade na fila",
      "Suporte prioritário 24/7",
      "Relatórios em PDF",
      "API dedicada",
    ],
  },
  {
    name: "Empresarial",
    badge: "Volume alto",
    perks: [
      "Consultas ilimitadas",
      "Múltiplos operadores",
      "SLA garantido",
      "Gerente de conta",
      "Integração customizada",
    ],
  },
];

export default function LandingTelePainel() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Helmet>
        <title>TelePainel — Módulo de consultas via Telegram · CentralDark</title>
        <meta
          name="description"
          content="TelePainel é o módulo de consultas via Telegram da CentralDark. Resposta instantânea, segurança bancária e 75+ fontes integradas."
        />
        <meta property="og:title" content="TelePainel — Módulo de consultas via Telegram · CentralDark" />
        <meta
          property="og:description"
          content="TelePainel é o módulo de consultas via Telegram da CentralDark. Resposta instantânea, segurança bancária e 75+ fontes integradas."
        />
      </Helmet>

      {/* Grid sutil de fundo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-grid opacity-[0.25]"
      />
      {/* Brilho radial primário no topo (assinatura do tema Esmeralda) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[640px]"
        style={{ background: "var(--gradient-radial-gold)" }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-subtle">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/portal" className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground hover:text-foreground">
            <span className="grid h-6 w-6 place-items-center rounded-md icon-glow">
              <Terminal className="h-3 w-3" />
            </span>
            <span className="font-semibold text-foreground">TelePainel</span>
            <span className="hidden sm:inline">· módulo da CentralDark</span>
          </Link>

          <nav className="hidden gap-7 font-mono text-[12px] text-muted-foreground md:flex">
            <a href="#recursos" className="transition hover:text-foreground">recursos</a>
            <a href="#numeros" className="transition hover:text-foreground">números</a>
            <a href="#planos" className="transition hover:text-foreground">planos</a>
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
            sistema online · 99.9% uptime
          </span>

          <h1 className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Consultas inteligentes,
            <br />
            <span className="text-gradient-gold">direto no seu Telegram.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Plataforma profissional com mais de 75 fontes integradas. Resposta em menos de 2 segundos,
            segurança de nível bancário e privacidade total.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-lg bg-primary px-5 font-mono text-[13px] font-medium text-primary-foreground shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
            >
              <Link to="/auth">
                criar conta grátis
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 rounded-lg border border-border bg-card/50 px-5 font-mono text-[13px] text-foreground shadow-3d-soft active:translate-y-[1px] hover:bg-secondary"
            >
              <a href="#recursos">ver recursos</a>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[11px] text-muted-foreground/70">
            cadastro gratuito · email válido obrigatório · sem cartão de crédito
          </p>
        </div>

        {/* Mockup do painel */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-x-20 -top-10 h-72 bg-primary/[0.08] blur-3xl" />
          <div className="card-premium relative overflow-hidden shadow-3d">
            <div className="flex h-8 items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="ml-3 font-mono text-[10px] text-muted-foreground">
                telepanel.app — painel de consultas
              </span>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-4">
              {[
                { l: "consultas hoje", v: "1.284" },
                { l: "ativos agora", v: "47" },
                { l: "latência média", v: "1.2s" },
                { l: "saúde do sistema", v: "100%" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-lg border border-border/60 bg-card p-4 shadow-3d-soft"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-gradient-gold">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/60 p-5">
              <div className="space-y-2 font-mono text-[12px]">
                {[
                  { t: "[14:32:08]", c: "/cpf 123.***.***-** → resposta em 1.4s" },
                  { t: "[14:32:11]", c: "/placa ABC-1234 → resposta em 0.9s" },
                  { t: "[14:32:14]", c: "/telefone (11) 9****-**** → resposta em 1.1s" },
                ].map((l) => (
                  <div key={l.t} className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-primary">●</span>
                    <span className="text-muted-foreground/60 tabular-nums">{l.t}</span>
                    <span className="text-foreground/80">{l.c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="numeros" className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-background px-6 py-10 text-center">
              <div className="font-mono text-4xl font-semibold tracking-tight tabular-nums text-gradient-gold">
                {s.value}
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
            recursos
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Tudo o que você precisa para consultar com confiança.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Uma plataforma completa, construída com obsessão por velocidade, segurança e clareza.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-premium group p-7 hover-lift"
            >
              <div className="inline-grid h-10 w-10 place-items-center rounded-lg icon-glow">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS (sem preço) */}
      <section id="planos" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
              planos
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Escolha o plano que cabe no seu ritmo.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Preços visíveis apenas para usuários cadastrados. Crie sua conta gratuita para acessar.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={
                  "card-premium relative p-7 " +
                  (p.highlight ? "border-primary/40 shadow-3d" : "")
                }
                style={
                  p.highlight
                    ? { background: "var(--gradient-gold-soft)" }
                    : undefined
                }
              >
                {p.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary-foreground shadow-3d-primary">
                    {p.badge}
                  </span>
                )}
                {!p.highlight && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {p.badge}
                  </span>
                )}
                <h3 className="mt-3 text-xl font-semibold text-foreground">{p.name}</h3>

                <div className="mt-4 flex items-baseline gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm text-muted-foreground">preço oculto</span>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={
                    "mt-7 h-10 w-full rounded-lg font-mono text-[12px] active:translate-y-[1px] " +
                    (p.highlight
                      ? "bg-primary text-primary-foreground shadow-3d-primary hover:bg-primary-glow"
                      : "border border-border bg-card text-foreground shadow-3d-soft hover:bg-secondary")
                  }
                  variant={p.highlight ? "default" : "ghost"}
                >
                  <Link to="/auth">criar conta para ver preço</Link>
                </Button>
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
            Pronto para consultar com a velocidade que você merece?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cadastro gratuito em menos de 30 segundos. Email válido obrigatório.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-12 rounded-lg bg-primary px-6 font-mono text-sm font-medium text-primary-foreground shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
          >
            <Link to="/auth">
              criar conta gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-md icon-glow">
              <Terminal className="h-3 w-3" />
            </span>
            TelePanel © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 font-mono text-[11px] text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground">entrar</Link>
            <a href="#recursos" className="hover:text-foreground">recursos</a>
            <a href="#planos" className="hover:text-foreground">planos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
