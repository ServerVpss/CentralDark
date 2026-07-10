import React, { useEffect, useState } from 'react';
import { ScrollText, Trash2, X } from 'lucide-react';
import {
  getButtonLogs,
  clearButtonLogs,
  BUTTON_LOG_EVENT,
  type ButtonLogEntry,
} from '@/lib/buttonLog';

export function ButtonLogDrawer() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ButtonLogEntry[]>(() => getButtonLogs());

  useEffect(() => {
    const handler = (e: Event) => setEntries((e as CustomEvent<ButtonLogEntry[]>).detail ?? getButtonLogs());
    window.addEventListener(BUTTON_LOG_EVENT, handler);
    return () => window.removeEventListener(BUTTON_LOG_EVENT, handler);
  }, []);

  const errors = entries.filter((e) => e.level === 'error').length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition"
        title="Log de ações"
      >
        <ScrollText className="h-4 w-4" />
        <span className="text-xs font-medium">Logs ({entries.length}){errors > 0 && <span className="ml-1 text-red-200">· {errors} erro{errors > 1 ? 's' : ''}</span>}</span>
      </button>

      {open && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/60 bg-card shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 gradient-emerald text-primary-foreground">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              <span className="font-semibold text-sm">Log de ações do painel</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => clearButtonLogs()} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center" title="Limpar">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center" title="Fechar">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {entries.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma ação registrada nesta sessão. Clica em qualquer botão pra começar.
              </div>
            )}
            {entries.map((e) => {
              const color =
                e.level === 'error' ? 'text-red-400 border-red-500/40' :
                e.level === 'warn'  ? 'text-amber-300 border-amber-500/40' :
                e.level === 'ok'    ? 'text-emerald-300 border-emerald-500/40' :
                                      'text-muted-foreground border-border/40';
              return (
                <div key={e.id} className={`px-3 py-2 text-xs border-l-2 ${color}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono truncate">{e.action}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(e.ts).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                    {e.status !== undefined && <span>HTTP {e.status}</span>}
                    {e.latencyMs !== undefined && <span>{e.latencyMs}ms</span>}
                    {e.error && <span className="text-red-400 truncate">{e.error}</span>}
                  </div>
                  {e.detail !== undefined && e.detail !== null && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[10px] text-muted-foreground/70 hover:text-foreground">detalhes</summary>
                      <pre className="mt-1 max-h-40 overflow-auto text-[10px] bg-black/30 rounded p-2 whitespace-pre-wrap break-words">
                        {safeStringify(e.detail)}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function safeStringify(v: unknown): string {
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}
