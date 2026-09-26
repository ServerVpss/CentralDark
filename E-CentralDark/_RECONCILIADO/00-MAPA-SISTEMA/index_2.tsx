import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Users, Bot, Send, BarChart3, Zap,
  CheckCircle2, XCircle, Shield, Lock, Database,
  QrCode, Smartphone, Cloud, Network, Sparkles, Clock, Building2, Rocket,
} from "lucide-react";
import { getLandingConfig } from "@/lib/landing-config.functions";
import { useRealtimeInvalidate } from "@/lib/use-realtime-query";
import { IntroAnimation } from "@/components/landing/IntroAnimation";

const landingConfigQO = queryOptions({
  queryKey: ["landing-config"],
  queryFn: () => getLandingConfig(),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
});

export const Route = createFileRoute("/")({
  // Carrega no servidor (SSR) — landing chega já preenchida, sem tela "Carregando…".
  loader: ({ context }) => context.queryClient.ensureQueryData(landingConfigQO),
  component: Landing,
});

function formatBRL(cents: number, currency = "BRL") {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function Landing() {
  const { data } = useSuspenseQuery(landingConfigQO);

  // Realtime: master edita → landing atualiza ao vivo (quando logado).
  // Landing é página pública — dados não são multi-tenant, então escopo "public".
  useRealtimeInvalidate(
    "landing-public",
    [{ table: "master_settings" }, { table: "plans" }],
    [["landing-config"]],
    { scope: "public" },
  );

  const { sections, metrics, comparison, hero, plans } = data;
  // Ordem por sort_order já vem do server. Destaque = quem tem allow_byok.
  const sortedPlans = [...plans].sort((a, b) => a.sort_order - b.sort_order);
  const highlightId = sortedPlans.find((p) => p.allow_byok)?.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Intro estilo Jarvis — só roda no cliente, controlada pelo master */}
      {sections.intro && (
        <ClientOnly fallback={null}>
          <IntroAnimation brandName="MultiZap" durationMs={data.intro_duration_ms} storageKey="landing-intro-seen" />
        </ClientOnly>
      )}
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight">MultiZap</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary">Atendimento Profissional</span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            {sections.plans && <a href="#planos" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline">Planos</a>}
            {sections.features && <a href="#recursos" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline">Recursos</a>}
            <Link to="/auth"><Button variant="ghost">Entrar</Button></Link>
            <Link to="/auth"><Button>{hero.cta_primary || "Teste grátis"}</Button></Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      {sections.hero && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            {hero.badge && (
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{hero.badge}</span>
              </div>
            )}
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              {hero.headline_pre}{" "}
              <span className="text-primary">{hero.headline_highlight}</span>{" "}
              {hero.headline_post}
            </h1>
            {hero.subheadline && (
              <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-lg">{hero.subheadline}</p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/auth"><Button size="lg" className="w-full sm:w-auto">{hero.cta_primary}</Button></Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">{hero.cta_secondary}</Button>
            </div>
            {hero.trust_badges?.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                {hero.trust_badges.map((b, i) => {
                  const Icon = [Clock, Building2, Rocket][i % 3];
                  return (
                    <span key={b} className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" /> {b}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Metric bar */}
      {sections.metrics && metrics.length > 0 && (
        <section className="border-y bg-muted/40">
          <div className={`mx-auto grid max-w-6xl gap-6 px-6 py-10 text-center grid-cols-2 md:grid-cols-${Math.min(metrics.length, 4)}`}>
            {metrics.map((m, i) => (
              <div key={`${m.value}-${i}`}>
                <div className="text-3xl font-extrabold text-primary md:text-4xl">{m.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      {sections.features && (
        <section id="recursos" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Tudo que sua equipe precisa</h2>
              <p className="mt-3 text-muted-foreground">Recursos pensados pra escalar atendimento sem perder qualidade.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { icon: Users, title: "Multi-atendentes", desc: "Time inteiro respondendo o mesmo número, com transferência entre setores." },
                { icon: Bot, title: "Chatbot com IA", desc: "Triagem automática 24/7 com inteligência artificial integrada." },
                { icon: Send, title: "Disparos em massa", desc: "Campanhas para listas de contatos com fila e rate-limit anti-bloqueio." },
                { icon: MessageSquare, title: "Inbox unificada", desc: "Todas as conversas em uma única tela, com histórico completo." },
                { icon: BarChart3, title: "Relatórios", desc: "Tempo de resposta, conversas por atendente e performance da equipe." },
                { icon: Zap, title: "Automação & CRM", desc: "Webhook e integrações para conectar com qualquer sistema." },
              ].map((f) => (
                <div key={f.title} className="group rounded-xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Connection modes */}
      {sections.connections && (
        <section className="border-y bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Várias formas de conectar</h2>
              <p className="mt-3 text-muted-foreground">Use o método ideal pro seu negócio — do mais simples ao oficial.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: QrCode, title: "QR Code", desc: "Conecte seu WhatsApp pessoal escaneando um código. Rápido e simples." },
                { icon: Smartphone, title: "Coexistência", desc: "Use o WhatsApp normalmente no celular E no painel ao mesmo tempo." },
                { icon: Cloud, title: "Cloud API oficial", desc: "WhatsApp Business oficial da Meta, com selo verde e templates." },
                { icon: Network, title: "Brokers", desc: "Integre com provedores externos via API genérica." },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comparison */}
      {sections.comparison && comparison.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Por que MultiZap?</h2>
              <p className="mt-3 text-muted-foreground">Compare e veja a diferença na prática.</p>
            </div>
            <div className="mt-12 overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="p-4 text-left font-semibold">Recurso</th>
                    <th className="p-4 text-center font-semibold text-primary">MultiZap</th>
                    <th className="p-4 text-center font-semibold text-muted-foreground">Concorrentes</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-4">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.us ? <CheckCircle2 className="mx-auto h-5 w-5 text-primary" /> : <XCircle className="mx-auto h-5 w-5 text-muted-foreground" />}
                      </td>
                      <td className="p-4 text-center">
                        {row.them ? <CheckCircle2 className="mx-auto h-5 w-5 text-primary" /> : <XCircle className="mx-auto h-5 w-5 text-muted-foreground" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Plans */}
      {sections.plans && (
        <section id="planos" className="border-y bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Planos pra cada tamanho de empresa</h2>
              <p className="mt-3 text-muted-foreground">Comece grátis por 7 dias. Sem cartão.</p>
            </div>
            {sortedPlans.length === 0 ? (
              <p className="mt-12 text-center text-sm text-muted-foreground">Nenhum plano disponível no momento.</p>
            ) : (
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {sortedPlans.map((p) => {
                  const highlight = p.id === highlightId;
                  const features = [
                    `${p.max_users} atendente(s)`,
                    `${p.max_connections} conexão(ões) WhatsApp`,
                    `${p.max_sectors} setor(es)`,
                    `${p.max_messages_per_month.toLocaleString("pt-BR")} respostas IA/mês`,
                    p.max_campaigns_per_month > 0 ? `${p.max_campaigns_per_month} campanhas/mês` : null,
                    p.allow_byok ? "Use sua própria chave OpenAI/Gemini" : null,
                  ].filter(Boolean) as string[];
                  return (
                    <div key={p.id} className={`relative rounded-xl border bg-card p-6 ${highlight ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}`}>
                      {highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                          Mais popular
                        </div>
                      )}
                      <h3 className="text-lg font-bold">{p.name}</h3>
                      {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                      <div className="mt-4">
                        <span className="text-4xl font-extrabold">{formatBRL(p.price_cents, p.currency)}</span>
                        <span className="text-sm text-muted-foreground">/{p.interval === "month" ? "mês" : p.interval}</span>
                      </div>
                      <ul className="mt-6 space-y-2 text-sm">
                        {features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Link to="/auth" className="mt-6 block">
                        <Button className="w-full" variant={highlight ? "default" : "outline"}>Começar agora</Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Security */}
      {sections.security && (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Segurança em primeiro lugar</h2>
              <p className="mt-3 text-muted-foreground">Seus dados e os dos seus clientes protegidos do início ao fim.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { icon: Lock, title: "Criptografia ponta-a-ponta", desc: "Mensagens trafegam protegidas pelo padrão WhatsApp." },
                { icon: Shield, title: "LGPD compliant", desc: "Dados isolados por empresa com controle total de acesso." },
                { icon: Database, title: "Backup automático", desc: "Histórico seguro com cópia diária na nuvem." },
              ].map((s) => (
                <div key={s.title} className="rounded-xl border bg-card p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      {sections.final_cta && (
        <section className="relative overflow-hidden border-t">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Oferta limitada
            </div>
            <h2 className="mt-6 text-4xl font-bold md:text-5xl">Pronto pra escalar seu atendimento?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Teste grátis por 7 dias. Sem cartão, sem compromisso.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/auth"><Button size="lg" className="w-full sm:w-auto">Começar agora</Button></Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Falar com especialista</Button>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MultiZap — Atendimento Profissional.</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to="/politica-de-privacidade" className="underline hover:text-foreground">
            Política de Privacidade
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/termos-de-uso" className="underline hover:text-foreground">
            Termos de Uso
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/exclusao-de-dados" className="underline hover:text-foreground">
            Exclusão de Dados
          </Link>
        </div>
      </footer>
    </div>
  );
}
