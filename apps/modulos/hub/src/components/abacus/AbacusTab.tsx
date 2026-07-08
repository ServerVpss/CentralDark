import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AbacusModal } from './AbacusModal';

export function AbacusTab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="card-premium p-6 sm:p-8 rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="h-14 w-14 rounded-xl gradient-emerald flex items-center justify-center shadow-3d-primary shrink-0">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              Investigação <span className="text-gradient-emerald">Abacus</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Painel unificado — status dos endpoints, modelos disponíveis, logs de requisição e console de teste. Tudo passa pelo edge <code className="px-1.5 py-0.5 rounded bg-muted/60 text-xs">abacus-router</code> no HUB, sem expor chave no frontend.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto gradient-emerald text-primary-foreground px-5 py-3 rounded-lg font-medium shadow-3d-primary hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Abrir painel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Endpoint', value: 'routellm.abacus.ai' },
          { label: 'Proxy',    value: 'abacus-router' },
          { label: 'Cofre',    value: 'HUB Supabase' },
          { label: 'Logs',     value: 'abacus_logs' },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg border border-border/60 bg-background/40">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="text-sm font-medium truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <AbacusModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
