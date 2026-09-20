import React, { createContext, useCallback, useContext, useState } from 'react';

type Tone = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: number; text: string; tone: Tone }

interface Ctx {
  push: (text: string, tone?: Tone) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

// Provider de toasts leve (sem sonner) — mesmo DNA visual do HUB
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((text: string, tone: Tone = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const api: Ctx = {
    push,
    success: (t) => push(t, 'success'),
    error: (t) => push(t, 'error'),
    info: (t) => push(t, 'info'),
  };

  const toneClass: Record<Tone, string> = {
    success: 'border-primary/50 bg-primary/10 text-primary',
    error: 'border-destructive/50 bg-destructive/10 text-destructive',
    info: 'border-border bg-card text-foreground',
    warning: 'border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  };
  const icon: Record<Tone, string> = { success: '✅', error: '🔴', info: '🔵', warning: '🟡' };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto min-w-[260px] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-3d backdrop-blur-md animate-in slide-in-from-right ${toneClass[t.tone]}`}
          >
            <span className="mr-2">{icon[t.tone]}</span>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast fora do ToastProvider');
  return ctx;
}
