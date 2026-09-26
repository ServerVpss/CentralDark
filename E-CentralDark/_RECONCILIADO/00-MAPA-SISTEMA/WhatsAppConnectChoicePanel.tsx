// Painel premium de escolha de método de conexão WhatsApp.
// Mantém a casca visual do MetaManualConnectionPanel (sidebar com stepper +
// Tipo de conexão, ilustração à direita, card "Precisa de ajuda?"), mas o
// miolo central agora tem apenas os 2 métodos oficiais:
//   1) Embedded Signup (Meta — fluxo fácil)
//   2) QR Code Próprio (WuzAPI — servidor nosso)
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  ExternalLink,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { WhatsAppQrConnectionModal } from "@/components/whatsapp/WhatsAppQrConnectionModal";
import connectionImage from "@/assets/whatsapp-meta-connection.png";

type Metodo = "embedded" | "qr";

interface Props {
  workspaceId: string;
  onConnected?: () => void;
  // Embedded Signup (Meta) — controlado pela rota pai.
  embeddedReady?: boolean;
  embeddedPending?: boolean;
  onEmbeddedSignupClick?: () => void;
}

const STEPS = [
  { n: 1, label: "Escolher método" },
  { n: 2, label: "Conectar número" },
  { n: 3, label: "Pronto" },
];

export function WhatsAppConnectChoicePanel({
  workspaceId,
  onConnected,
  embeddedReady = false,
  embeddedPending = false,
  onEmbeddedSignupClick,
}: Props) {
  const [metodo, setMetodo] = useState<Metodo>("embedded");
  const [qrAberto, setQrAberto] = useState(false);
  const stepAtual = 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-foreground shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_280px]">

        {/* =================== COLUNA ESQUERDA =================== */}
        <aside className="space-y-5">
          {/* Stepper vertical */}
          <nav className="space-y-1.5">
            {STEPS.map((s) => {
              const ativo = s.n === stepAtual;
              const feito = s.n < stepAtual;
              return (
                <div
                  key={s.n}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    ativo && "bg-emerald-500/10",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      ativo && "bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.45)]",
                      feito && !ativo && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
                      !ativo && !feito && "border border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {feito ? <Check className="h-3 w-3" /> : s.n}
                  </span>
                  <span
                    className={cn(
                      "truncate",
                      ativo ? "font-medium text-foreground" : feito ? "text-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </div>

              );
            })}
          </nav>

          {/* Tipo de conexão — apenas os 2 métodos oficiais */}
          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground">Tipo de conexão</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                Escolha como deseja conectar seu número ao MultiZap.
              </p>
            </div>
            <div className="space-y-2">
              <ConnectionTypeCard
                icon={Sparkles}
                title="Embedded Signup"
                desc="Conexão oficial via Meta, em poucos cliques."
                selected={metodo === "embedded"}
                onClick={() => setMetodo("embedded")}
              />
              <ConnectionTypeCard
                icon={QrCode}
                title="QR Code Próprio"
                desc="Conecte pelo nosso servidor lendo um QR no celular."
                selected={metodo === "qr"}
                onClick={() => setMetodo("qr")}
              />
            </div>
          </div>
        </aside>

        {/* =================== COLUNA CENTRAL =================== */}
        <main className="space-y-5">
          {metodo === "embedded" ? (
            <SectionCard step={1} title="Embedded Signup — Meta Cloud API">
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Recomendado</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Fluxo oficial da Meta. Você faz login com o Facebook, escolhe sua conta
                      WhatsApp Business e o sistema configura tudo automaticamente — token,
                      número, webhook. Sem precisar copiar nada à mão.
                    </p>
                  </div>
                </div>

                <ul className="grid gap-2 sm:grid-cols-2">
                  <BulletCheck text="Conexão em menos de 1 minuto" />
                  <BulletCheck text="Sem WABA ID, App Secret ou Token" />
                  <BulletCheck text="Webhook configurado automaticamente" />
                  <BulletCheck text="Estável e oficial Meta Cloud API" />
                </ul>

                {!embeddedReady && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div className="text-xs text-amber-700 dark:text-amber-200">
                      <p className="font-medium">Aguardando configuração do administrador</p>
                      <p className="mt-0.5 text-amber-700/80 dark:text-amber-300/80">
                        O App Meta da plataforma ainda não foi habilitado. Avise o suporte.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={onEmbeddedSignupClick}
                  disabled={!embeddedReady || embeddedPending || !onEmbeddedSignupClick}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {embeddedPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Conectando…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Conectar com Facebook
                    </>
                  )}
                </button>
              </div>
            </SectionCard>
          ) : (
            <SectionCard step={1} title="QR Code Próprio — Servidor MultiZap">
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Alternativa via servidor próprio</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Conecte qualquer número de WhatsApp (pessoal ou Business) escaneando
                      um QR Code direto pelo seu celular. Roda no nosso servidor MultiZap, sem
                      depender do cadastro Meta Business.
                    </p>
                  </div>
                </div>

                <ul className="grid gap-2 sm:grid-cols-2">
                  <BulletCheck text="Funciona com WhatsApp comum" />
                  <BulletCheck text="Sem cadastro na Meta" />
                  <BulletCheck text="Pronto em segundos" />
                  <BulletCheck text="Use múltiplos números" />
                </ul>

                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-700 dark:text-amber-200/90">
                    Use com responsabilidade. Disparos em massa podem causar bloqueio do
                    número pelo WhatsApp. Respeite os limites anti-ban.
                  </p>
                </div>

                <button
                  onClick={() => setQrAberto(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700"
                >
                  <Smartphone className="h-4 w-4" /> Conectar via QR Code
                </button>
              </div>
            </SectionCard>
          )}
        </main>

        {/* =================== COLUNA DIREITA =================== */}
        <aside className="space-y-5">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Resumo da conexão</h3>
            <ConnectionIllustration />

            <div className="mt-5 space-y-4">
              <SummaryBlock
                icon={Sparkles}
                title="Conexão simplificada"
                desc="Sem preencher tokens nem credenciais técnicas."
              />
              <SummaryBlock
                icon={ShieldCheck}
                title="2 caminhos oficiais"
                desc="Meta Cloud API (Embedded) ou QR via servidor nosso."
              />
              <SummaryBlock
                icon={Zap}
                title="Pronto em minutos"
                desc="Escolha um método e conecte seu número agora."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">Precisa de ajuda?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Acesse nossa central de ajuda ou fale com o suporte.
            </p>
            <a
              href="https://multizap.dev/ajuda"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-300"
            >
              Abrir ajuda
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </aside>
      </div>

      {/* Modal QR — usa o fluxo MultiZap-Gateway + WuzAPI já existente */}
      <WhatsAppQrConnectionModal
        open={qrAberto}
        onOpenChange={setQrAberto}
        workspaceId={workspaceId}
        onConnected={onConnected}
      />
    </div>
  );
}

/* ===================== Subcomponentes ===================== */

function SectionCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white shadow-sm">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function ConnectionTypeCard({
  icon: Icon,
  title,
  desc,
  selected,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-2.5 text-left transition-all",
        selected
          ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
          : "border-border bg-background hover:border-foreground/20",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            selected
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-medium text-foreground">{title}</p>
            {selected && <Check className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{desc}</p>
        </div>
      </div>
    </button>
  );
}

function BulletCheck({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-xs text-foreground/80">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Check className="h-2.5 w-2.5" />
      </span>
      {text}
    </li>
  );
}

function SummaryBlock({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function ConnectionIllustration() {
  return (
    <div className="relative flex h-[200px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="absolute h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
      <img
        src={connectionImage}
        alt="Conexão WhatsApp via Meta"
        className="relative h-full w-auto object-contain"
      />
    </div>
  );
}

