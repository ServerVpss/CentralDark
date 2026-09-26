import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomePayload } from "@/lib/dashboard.functions";

type Props = { s: HomePayload["whatsapp_status"] };

/**
 * Guia passo a passo no Dashboard.
 * Mostra checklist: Conectar -> Validar PIN -> 1º contato -> Recebendo mensagens.
 */
export function SetupGuide({ s }: Props) {
  const conectado = s.connected_count > 0 || s.pending_count > 0; // já criou alguma conexão
  const validado = s.connected_count > 0; // saiu do "pendente"
  const recebendo = s.health === "ok" || s.messages_24h > 0;

  const steps = [
    {
      done: conectado,
      title: "Conectar seu WhatsApp",
      desc: "Clique em \"Conectar meu WhatsApp\" e faça o login com Facebook (ou cole as chaves no modo avançado).",
      cta: { label: "Ir para Canais", to: "/app/canais" as const },
    },
    {
      done: validado,
      title: "Confirmar o código de 6 dígitos (PIN)",
      desc: "A Meta manda um código por SMS ou ligação no telefone que você cadastrou. Digite os 6 números pra liberar o WhatsApp.",
      cta: { label: "Validar PIN", to: "/app/canais" as const },
      hint: !validado && conectado ? "Você tem um número esperando o código." : undefined,
    },
    {
      done: recebendo,
      title: "Receber a 1ª mensagem",
      desc: "Peça pra alguém mandar um \"oi\" no seu WhatsApp da empresa. Quando chegar, ela aparece direto na aba Chat.",
      cta: { label: "Abrir Chat", to: "/app/chat" as const },
    },
  ];

  const completed = steps.filter((x) => x.done).length;
  const allDone = completed === steps.length;

  if (allDone) {
    return (
      <div className="rounded-xl border bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">Tudo pronto — você já está recebendo mensagens 🎉</h3>
            <p className="text-xs text-muted-foreground">
              Acompanhe os atendimentos na aba <Link to="/app/chat" search={{ ticketId: undefined }} className="underline">Chat</Link>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Comece em 3 passos</h3>
          <p className="text-xs text-muted-foreground">Faça isso uma vez pra ficar “recebendo mensagens”.</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
          {completed} de {steps.length} concluído{completed === 1 ? "" : "s"}
        </span>
      </div>

      <ol className="divide-y">
        {steps.map((step, i) => {
          const isCurrent = !step.done && steps.slice(0, i).every((p) => p.done);
          return (
            <li
              key={step.title}
              className={cn(
                "flex items-start gap-3 p-4",
                step.done && "bg-emerald-500/5",
                isCurrent && "bg-amber-500/5",
              )}
            >
              <div className="mt-0.5 shrink-0">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className={cn("h-5 w-5", isCurrent ? "text-amber-500" : "text-muted-foreground")} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">Passo {i + 1}</span>
                  {isCurrent && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      faça agora
                    </span>
                  )}
                </div>
                <p className={cn("text-sm font-medium", step.done && "text-muted-foreground line-through")}>
                  {step.title}
                </p>
                {!step.done && <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>}
                {step.hint && (
                  <p className="mt-1 text-xs font-medium text-amber-700">⚠ {step.hint}</p>
                )}
              </div>
              {!step.done && (
                <Button asChild size="sm" variant={isCurrent ? "default" : "outline"} className="shrink-0">
                  <Link to={step.cta.to}>
                    {step.cta.label} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
