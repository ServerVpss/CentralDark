import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, X, Sparkles, MessageCircle, Bot, Users,
  Trello, Settings2, Bell, LifeBuoy, Rocket, Radio, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOnboardingState, saveOnboardingStep, setOnboardingCompleted } from "@/lib/onboarding.functions";

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
  visual: React.ReactNode;
  primary?: string;
};

// Pequenos mockups visuais inline (sem assets externos).
function MockChat() {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/15" />
        <div className="flex-1">
          <div className="h-2 w-24 rounded bg-muted" />
          <div className="mt-1 h-2 w-16 rounded bg-muted/70" />
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600">online</span>
      </div>
      <div className="space-y-2">
        <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-xs">Olá! Tudo bem?</div>
        <div className="ml-auto max-w-[70%] rounded-2xl rounded-tr-sm bg-primary/90 px-3 py-2 text-xs text-primary-foreground">Oi! Em que posso ajudar?</div>
        <div className="max-w-[55%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-xs">Quero saber o preço</div>
      </div>
    </div>
  );
}

function MockChannels() {
  const items = [
    { icon: MessageCircle, label: "WhatsApp", tone: "text-emerald-500 bg-emerald-500/10" },
    { icon: Bot, label: "ChatBot", tone: "text-blue-500 bg-blue-500/10" },
    { icon: Radio, label: "Canais", tone: "text-purple-500 bg-purple-500/10" },
    { icon: Users, label: "Grupos", tone: "text-amber-500 bg-amber-500/10" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl", it.tone)}>
            <it.icon className="h-4 w-4" />
          </div>
          <p className="mt-3 text-sm font-medium">{it.label}</p>
          <p className="text-xs text-muted-foreground">Conectado</p>
        </div>
      ))}
    </div>
  );
}

function MockKanban() {
  const cols = ["Novo", "Em atendimento", "Proposta"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((c, i) => (
        <div key={c} className="rounded-xl border bg-card p-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold">{c}</p>
            <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">{3 - i}</span>
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 3 - i }).map((_, k) => (
              <div key={k} className="rounded-lg bg-muted/60 p-2">
                <div className="h-1.5 w-3/4 rounded bg-muted" />
                <div className="mt-1 h-1.5 w-1/2 rounded bg-muted/70" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockContacts() {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b py-2 last:border-0">
          <div className="h-8 w-8 rounded-full bg-primary/15" />
          <div className="flex-1">
            <div className="h-2 w-32 rounded bg-muted" />
            <div className="mt-1 h-2 w-20 rounded bg-muted/70" />
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">tag</span>
        </div>
      ))}
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {["Atend.", "Resp.", "CSAT"].map((l, i) => (
          <div key={l} className="rounded-xl bg-muted/40 p-3">
            <p className="text-[10px] text-muted-foreground">{l}</p>
            <p className="mt-1 text-base font-semibold">{[128, 42, "94%"][i]}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-20 items-end gap-1">
        {[40, 60, 35, 80, 55, 75, 90].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function MockNotifications() {
  const items = [
    { i: Bell, t: "Novo atendimento atribuído", tone: "text-blue-500 bg-blue-500/10" },
    { i: CheckCircle2, t: "Campanha concluída", tone: "text-emerald-500 bg-emerald-500/10" },
    { i: MessageCircle, t: "3 mensagens não lidas", tone: "text-amber-500 bg-amber-500/10" },
  ];
  return (
    <div className="space-y-2">
      {items.map((it, k) => (
        <div key={k} className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
          <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl", it.tone)}>
            <it.i className="h-4 w-4" />
          </div>
          <p className="text-sm">{it.t}</p>
        </div>
      ))}
    </div>
  );
}

function MockSupport() {
  const items = [
    { i: LifeBuoy, t: "Central de ajuda" },
    { i: MessageCircle, t: "Falar com suporte" },
    { i: Sparkles, t: "Documentação" },
  ];
  return (
    <div className="grid gap-2">
      {items.map((it, k) => (
        <div key={k} className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <it.i className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium">{it.t}</p>
        </div>
      ))}
    </div>
  );
}

function HeroIcon({ Icon }: { Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
        <Icon className="h-10 w-10" />
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao MultiZap!",
    body: (
      <>
        <p>É muito bom ter você conosco 😊</p>
        <p>Vamos configurar sua plataforma em poucos passos.</p>
      </>
    ),
    visual: <HeroIcon Icon={Sparkles} />,
  },
  {
    icon: Rocket,
    title: "Tudo o que você precisa em um só lugar",
    body: (
      <>
        <p>O MultiZap foi criado para centralizar <strong>atendimento, automações, contatos e gestão</strong> do seu negócio em uma única plataforma.</p>
        <p>Nos próximos passos, vamos te mostrar rapidamente como tudo funciona.</p>
      </>
    ),
    visual: <MockDashboard />,
  },
  {
    icon: Radio,
    title: "Conecte seus canais",
    body: (
      <>
        <p>Organize seu atendimento usando <strong>WhatsApp, grupos, canais</strong> e outros fluxos configurados dentro da plataforma.</p>
        <p>Tudo para deixar sua operação mais rápida, organizada e profissional.</p>
      </>
    ),
    visual: <MockChannels />,
  },
  {
    icon: Bot,
    title: "Automatize sem perder o controle",
    body: (
      <>
        <p>Configure <strong>agentes, mensagens automáticas, respostas rápidas</strong> e fluxos de atendimento.</p>
        <p>Quando quiser, você também pode assumir o controle manual das conversas.</p>
      </>
    ),
    visual: <MockChat />,
  },
  {
    icon: Users,
    title: "Gerencie seus contatos com facilidade",
    body: (
      <>
        <p>Cadastre, organize e acompanhe seus contatos de forma prática.</p>
        <p>Tenha <strong>histórico, informações e contexto</strong> para um atendimento mais eficiente.</p>
      </>
    ),
    visual: <MockContacts />,
  },
  {
    icon: Trello,
    title: "Organize oportunidades e processos",
    body: (
      <>
        <p>Use <strong>funis, etapas e acompanhamentos</strong> para visualizar melhor seu fluxo de trabalho.</p>
        <p>Acompanhe atendimentos, vendas e processos internos com mais clareza.</p>
      </>
    ),
    visual: <MockKanban />,
  },
  {
    icon: Settings2,
    title: "Deixe tudo com a sua cara",
    body: (
      <>
        <p>Personalize recursos, ajuste preferências e configure a operação do jeito que fizer mais sentido para o seu negócio.</p>
        <p>Flexibilidade sem complicação.</p>
      </>
    ),
    visual: <MockDashboard />,
  },
  {
    icon: Bell,
    title: "Fique por dentro de tudo",
    body: (
      <>
        <p>Receba notificações importantes e acompanhe sua operação em <strong>tempo real</strong>.</p>
        <p>Mais agilidade e nada de perder eventos importantes.</p>
      </>
    ),
    visual: <MockNotifications />,
  },
  {
    icon: LifeBuoy,
    title: "Precisa de ajuda? Conte com a gente",
    body: (
      <>
        <p>Se surgir qualquer dúvida, você poderá acessar nossa <strong>documentação, suporte e canais de atendimento</strong>.</p>
        <p>Queremos que sua experiência seja simples, rápida e segura.</p>
      </>
    ),
    visual: <MockSupport />,
  },
  {
    icon: Rocket,
    title: "Tudo pronto para começar 🚀",
    body: (
      <>
        <p>Agora você já conhece o básico da plataforma.</p>
        <p>Vamos para o painel e começar sua operação.</p>
      </>
    ),
    visual: <HeroIcon Icon={Rocket} />,
    primary: "Vamos lá!",
  },
];

type Props = { forceOpen?: boolean; onClose?: () => void };

export function WorkspaceOnboarding({ forceOpen, onClose }: Props) {
  const qc = useQueryClient();
  const fetchState = useServerFn(getOnboardingState);
  const fnSaveStep = useServerFn(saveOnboardingStep);
  const fnComplete = useServerFn(setOnboardingCompleted);

  const { data } = useQuery({
    queryKey: ["onboarding-state"],
    queryFn: () => fetchState({}),
    staleTime: 60_000,
  });

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setStep(0);
      return;
    }
    if (data && !data.completed) {
      setOpen(true);
      setStep(Math.min(data.step ?? 0, STEPS.length - 1));
    }
  }, [data, forceOpen]);

  const current = useMemo(() => STEPS[step], [step]);
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  if (!open || !current) return null;

  const close = async (markDone: boolean) => {
    if (markDone) {
      try { await fnComplete({ data: { reset: false } }); } catch { /* silencioso */ }
    }
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["onboarding-state"] });
    onClose?.();
  };

  const goNext = async () => {
    if (isLast) return close(true);
    const next = step + 1;
    setDir(1);
    setStep(next);
    try { await fnSaveStep({ data: { step: next } }); } catch { /* ok */ }
  };

  const goBack = () => {
    if (isFirst) return;
    setDir(-1);
    setStep((s) => s - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-foreground/30 p-0 sm:p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[100dvh] sm:max-h-[92vh] overflow-y-auto rounded-t-[24px] sm:rounded-[28px] border border-border bg-background p-4 pt-12 sm:p-10 shadow-2xl">
        {/* Fechar / pular */}
        {!forceOpen && (
          <button
            type="button"
            onClick={() => close(true)}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs text-muted-foreground hover:bg-muted"
            title="Pular por enquanto"
          >
            Pular <X className="h-3.5 w-3.5" />
          </button>
        )}
        {forceOpen && (
          <button
            type="button"
            onClick={() => close(false)}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Conteúdo */}
        <div className="min-h-0 sm:min-h-[420px] grid items-center gap-5 sm:gap-8 sm:grid-cols-2">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`text-${step}`}
              custom={dir}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="order-2 sm:order-1"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <current.icon className="h-3.5 w-3.5" />
                Etapa {step + 1} de {STEPS.length}
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-tight sm:text-3xl">
                {current.title}
              </h2>
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {current.body}
              </div>
            </motion.div>

            <motion.div
              key={`visual-${step}`}
              custom={dir}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="order-1 flex items-center justify-center sm:order-2"
            >
              <div className="w-full max-w-xs sm:max-w-sm">
                {current.visual}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rodapé */}
        <div className="mt-5 sm:mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t pt-4 sm:pt-5">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirst}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition",
                isFirst ? "opacity-30 cursor-not-allowed" : "hover:bg-muted hover:text-foreground",
              )}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setDir(i > step ? 1 : -1); setStep(i); }}
                  className={cn(
                    "h-1.5 sm:h-2 rounded-full transition-all",
                    i === step ? "w-5 sm:w-6 bg-primary" : "w-1.5 sm:w-2 bg-muted hover:bg-muted-foreground/30",
                  )}
                  aria-label={`Ir para etapa ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={goNext}
            className="w-full sm:w-auto rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700"
          >
            {current.primary ?? "Próximo"}
            {!isLast && <ArrowRight className="ml-1.5 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
