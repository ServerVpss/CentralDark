import React from 'react';
import { Activity, CheckCircle2, LockKeyhole, Server, TerminalSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

type Stage = {
  title: string;
  detail: string;
  state: 'ready' | 'pending' | 'protected';
  icon: React.ReactNode;
};

const stages: Stage[] = [
  { title: 'Intenção recebida', detail: 'Comando curto vira uma missão rastreável.', state: 'ready', icon: <Activity className="h-4 w-4" /> },
  { title: 'Estado reconciliado', detail: 'Hub, GitHub, VPS e evidências entram no mesmo snapshot.', state: 'ready', icon: <CheckCircle2 className="h-4 w-4" /> },
  { title: 'Sensores e executor local', detail: 'Screenpipe e Desktop Commander rodam no Windows e mantêm a captura/ponte local.', state: 'ready', icon: <TerminalSquare className="h-4 w-4" /> },
  { title: 'Execução remota', detail: 'Acesso SSH da VPS disponível pelo alias configurado.', state: 'ready', icon: <Server className="h-4 w-4" /> },
  { title: 'Ações protegidas', detail: 'Segredos, MFA e ações irreversíveis permanecem com gate explícito.', state: 'protected', icon: <LockKeyhole className="h-4 w-4" /> },
];

const stateLabel = { ready: 'pronto', pending: 'pendente', protected: 'protegido' } as const;
const stateClass = {
  ready: 'border-primary/40 bg-primary/10 text-primary',
  pending: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  protected: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
} as const;

export function AutonomyTab() {
  return (
    <div className="space-y-6">
      <Card className="card-premium border-border/60 overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Autonomia <span className="text-gradient-emerald">CentralDark</span></CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Um fluxo único para acordar, medir, executar, provar e registrar.</p>
            </div>
            <Badge className="border-primary/40 bg-primary/10 text-primary">design v1 · runtime-aware</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {stages.map((stage, index) => (
              <div key={stage.title} className="relative rounded-xl border border-border bg-card/60 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${stateClass[stage.state]}`}>
                    {stage.icon}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                </div>
                <div className="font-semibold text-sm">{stage.title}</div>
                <p className="mt-1 min-h-10 text-xs leading-relaxed text-muted-foreground">{stage.detail}</p>
                <Badge className={`mt-3 text-[10px] ${stateClass[stage.state]}`}>{stateLabel[stage.state]}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <RuntimeCard title="GitHub" value="origin SSH configurado" detail="ServerVpss/CentralDark" state="ready" />
        <RuntimeCard title="VPS" value="MCP/Hermes runtime" detail="vmi3256920 · /root/CentralDark" state="ready" />
        <RuntimeCard title="Screenpipe" value="rodar no Windows local" detail="localhost:3030 · VPS incompatível com GLIBC" state="pending" />
        <RuntimeCard title="Hermes" value="PM2 online · dependência faltante" detail="executor.mjs precisa ser reconciliado" state="pending" />
      </div>
    </div>
  );
}

function RuntimeCard({ title, value, detail, state }: { title: string; value: string; detail: string; state: 'ready' | 'pending' }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</span>
          <span className={`h-2 w-2 rounded-full ${state === 'ready' ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary))]' : 'bg-amber-400'}`} />
        </div>
        <div className="mt-3 font-medium">{value}</div>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{detail}</div>
      </CardContent>
    </Card>
  );
}
