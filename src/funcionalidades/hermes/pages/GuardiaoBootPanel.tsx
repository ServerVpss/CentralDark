import { ShieldCheck, Terminal, Bot, Route, KeyRound, AlertTriangle } from "lucide-react";
import { Card } from "@/compartilhado/ui/card";
import { Button } from "@/compartilhado/ui/button";

const bootSteps = [
  "Usar o bot atual @Guardiaonotify_bot; não criar outro bot.",
  "Preservar token e secrets existentes; nunca exibir valor sensível.",
  "Iniciar pelo processo PM2 CentralDark-GuardiaoBot quando a VPS estiver disponível.",
  "Manter comandos próprios: /menu, /seg, /escudo, /skills, /claude e Grok terminal.",
  "Registrar UNKNOWN quando runtime, PM2 ou token não puderem ser medidos.",
];

const routes = [
  { label: "Painel Hermes", value: "/telepainel/hermes" },
  { label: "Boot Guardião", value: "/telepainel/guardiao" },
  { label: "Alias legado", value: "/guardiao" },
  { label: "Bot Telegram", value: "@Guardiaonotify_bot" },
];

export default function GuardiaoBootPanel() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">CentralDark · Hermes route</p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              Guardião — Boot de Segurança
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Mesmo trilho operacional do Hermes, com formato de boot próprio do Guardião.
            </p>
          </div>
          <Button asChild className="bg-cyan-500 text-white hover:bg-cyan-400">
            <a href="/telepainel/hermes">Abrir Hermes</a>
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatusCard icon={ShieldCheck} title="Bot preservado" text="@Guardiaonotify_bot continua sendo o bot canônico de segurança." />
          <StatusCard icon={KeyRound} title="Segredo protegido" text="Token fica em secrets/env; esta tela não lê nem exibe valor sensível." />
          <StatusCard icon={Terminal} title="PM2 atual" text="Processo esperado: CentralDark-GuardiaoBot, medido antes de iniciar." />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="bg-slate-900/60 border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-emerald-300" />
              <h2 className="font-semibold text-emerald-100">Procedimento canônico de boot</h2>
            </div>
            <ol className="space-y-3 text-sm text-slate-300">
              {bootSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-xs text-emerald-200">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Route className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold text-cyan-100">Mapa de rotas</h2>
            </div>
            <div className="space-y-3">
              {routes.map((route) => (
                <div key={route.value} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{route.label}</p>
                  <p className="font-mono text-sm text-cyan-200">{route.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card className="border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
            <p>
              Este painel é só o boot/menu do Guardião no trilho Hermes. Runtime vivo, token carregado e PM2 online continuam exigindo contraprova na VPS.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusCard({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <Card className="bg-slate-900/60 border-slate-800 p-4">
      <div className="mb-3 inline-flex rounded-lg bg-cyan-400/10 p-2 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{text}</p>
    </Card>
  );
}
