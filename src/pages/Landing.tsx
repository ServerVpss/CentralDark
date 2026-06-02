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

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_4%)] text-[hsl(0_0%_92%)] antialiased">
      <Helmet>
        <title>TelePanel — Consultas inteligentes via Telegram</title>
        <meta
          name="description"
          content="Plataforma profissional de consultas via Telegram. Resposta instantânea, segurança bancária e 75+ fontes integradas."
        />
        <meta property="og:title" content="TelePanel — Consultas inteligentes via Telegram" />
        <meta
          property="og:description"
          content="Plataforma profissional de consultas via Telegram. Resposta instantânea, segurança bancária e 75+ fontes integradas."
        />
        <link
          rel="canonical"
          href="https://telegram-zen-panel-6518f4e2-5d802052.lovable.app/"
        />
      </Helmet>

      {/* Background grid sutil */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[600px] bg-gradient-to-b from-emerald-500/[0.06] to-transparent"
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[hsl(0_0%_4%)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-500/15 text-emerald-400">
              <Terminal className="h-3.5 w-3.5" />
            </span>
            TelePanel
          </Link>

          <nav className="hidden gap-7 font-mono text-[12px] text-white/60 md:flex">
            <a href="#recursos" className="transition hover:text-white">recursos</a>
            <a href="#numeros" className="transition hover:text-white">números</a>
            <a href="#planos" className="transition hover:text-white">planos</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden font-mono text-[12px] text-white/70 transition hover:text-white sm:block"
            >
              entrar
            </Link>
            <Button
              asChild
              size="sm"
              className="h-8 rounded-md bg-emerald-500 px-3 font-mono text-[12px] font-medium text-black hover:bg-emerald-400"
            >
              <Link to="/auth">criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 font-mono text-[11px] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            sistema online · 99.9% uptime
          </span>

          <h1 className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Consultas inteligentes,
            <br />
            <span className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
              direto no seu Telegram.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-white/60 md:text-lg">
            Plataforma profissional com mais de 75 fontes integradas. Resposta em menos de 2 segundos,
            segurança de nível bancário e privacidade total.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-md bg-white px-5 font-mono text-[13px] font-medium text-black hover:bg-white/90"
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
              className="h-11 rounded-md border border-white/10 bg-white/[0.02] px-5 font-mono text-[13px] text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              <a href="#recursos">ver recursos</a>
            </Button>
          </div>

          <p className="mt-4 font-mono text-[11px] text-white/40">
            cadastro gratuito · email válido obrigatório · sem cartão de crédito
          </p>
        </div>

        {/* Mockup do painel */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-x-20 -top-10 h-72 bg-emerald-500/[0.08] blur-3xl" />
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent shadow-2xl shadow-black/40">
            <div className="flex h-8 items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 font-mono text-[10px] text-white/40">
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
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                    {s.l}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-semibold text-white">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.06] p-5">
              <div className="space-y-2 font-mono text-[12px]">
                <div className="flex items-center gap-3 text-white/60">
                  <span className="text-emerald-400">●</span>
                  <span className="text-white/40">[14:32:08]</span>
                  <span>/cpf 123.***.***-** → resposta em 1.4s</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <span className="text-emerald-400">●</span>
                  <span className="text-white/40">[14:32:11]</span>
                  <span>/placa ABC-1234 → resposta em 0.9s</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <span className="text-emerald-400">●</span>
                  <span className="text-white/40">[14:32:14]</span>
                  <span>/telefone (11) 9****-**** → resposta em 1.1s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="numeros" className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto grid max-w-6xl gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[hsl(0_0%_4%)] px-6 py-10 text-center">
              <div className="font-mono text-4xl font-semibold tracking-tight text-white">
                {s.value}
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-white/40">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
            recursos
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Tudo o que você precisa para consultar com confiança.
          </h2>
          <p className="mt-4 text-white/60">
            Uma plataforma completa, construída com obsessão por velocidade, segurança e clareza.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-[hsl(0_0%_4%)] p-7 transition hover:bg-white/[0.015]"
            >
              <div className="inline-grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-emerald-400 transition group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS (sem preço) */}
      <section id="planos" className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
              planos
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Escolha o plano que cabe no seu ritmo.
            </h2>
            <p className="mt-4 text-white/60">
              Preços visíveis apenas para usuários cadastrados. Crie sua conta gratuita para acessar.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={
                  "relative rounded-xl border p-7 transition " +
                  (p.highlight
                    ? "border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.06] to-transparent"
                    : "border-white/[0.08] bg-[hsl(0_0%_4%)] hover:border-white/15")
                }
              >
                {p.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2.5 py-0.5 font-mono text-[10px] font-medium text-black">
                    {p.badge}
                  </span>
                )}
                {!p.highlight && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                    {p.badge}
                  </span>
                )}
                <h3 className="mt-3 text-xl font-semibold text-white">{p.name}</h3>

                <div className="mt-4 flex items-baseline gap-2">
                  <Lock className="h-4 w-4 text-white/30" />
                  <span className="font-mono text-sm text-white/40">preço oculto</span>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-white/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={
                    "mt-7 h-10 w-full rounded-md font-mono text-[12px] " +
                    (p.highlight
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]")
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
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-emerald-400" />
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Pronto para consultar com a velocidade que você merece?
          </h2>
          <p className="mt-4 text-white/60">
            Cadastro gratuito em menos de 30 segundos. Email válido obrigatório.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-12 rounded-md bg-white px-6 font-mono text-sm font-medium text-black hover:bg-white/90"
          >
            <Link to="/auth">
              criar conta gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[hsl(0_0%_3%)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2 font-mono text-[12px] text-white/40">
            <span className="grid h-5 w-5 place-items-center rounded bg-emerald-500/15 text-emerald-400">
              <Terminal className="h-3 w-3" />
            </span>
            TelePanel © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 font-mono text-[11px] text-white/40">
            <Link to="/auth" className="hover:text-white">entrar</Link>
            <a href="#recursos" className="hover:text-white">recursos</a>
            <a href="#planos" className="hover:text-white">planos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
