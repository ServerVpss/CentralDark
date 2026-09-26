# COMANDO - WhatsAppConnectChoicePanel.tsx
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\whatsapp\WhatsAppConnectChoicePanel.tsx
**SHA:** b88575bfd0ea9581
**Timestamp:** 2026-08-26T19:41:32.518574
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- type Metodo = "embedded" | "qr";
- selected={metodo === "embedded"}
- selected={metodo === "qr"}
- {metodo === "embedded" ? (

### Ouro Bruto (primeiros 5000 chars)
```
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
                 
```