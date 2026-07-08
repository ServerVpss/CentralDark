import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface Props {
  open: boolean;
  providerName: string;
  providerColor: string;
  helpText?: string;
  helpUrl?: string;
  onClose: () => void;
  onConfirm: (key: string) => Promise<void> | void;
}


// Modal de colagem de API key — sem dependência de shadcn/dialog
export function ApiKeyDialog({ open, providerName, providerColor, helpText, helpUrl, onClose, onConfirm }: Props) {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setShow(false);
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open && !busy) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().length < 10 || busy) return;
    setBusy(true);
    try {
      await onConfirm(value.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
      onClick={() => !busy && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card shadow-3d-primary overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${providerColor}, transparent)` }}
        />
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Conectar <span className="text-gradient-emerald">{providerName}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              A chave é enviada cifrada para o Supabase HUB. Nunca fica no frontend.
            </p>
          </div>

          {helpText && (
            <div className="text-xs text-muted-foreground border-l-2 border-primary/50 pl-3 py-1 bg-primary/5 rounded-r">
              {helpText}
              {helpUrl && (
                <>
                  {' '}
                  <a href={helpUrl} target="_blank" rel="noreferrer" className="text-primary underline">abrir painel</a>
                </>
              )}
            </div>
          )}


          <div className="space-y-2">
            <Label htmlFor="apikey" className="text-xs uppercase tracking-wide text-muted-foreground">
              API key
            </Label>
            <div className="flex gap-2">
              <Input
                id="apikey"
                ref={inputRef}
                type={show ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="sk-... / xai-... / etc"
                className="font-mono text-sm"
                disabled={busy}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShow((s) => !s)}
                disabled={busy}
              >
                {show ? '🙈' : '👁️'}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mínimo 10 caracteres · será validada no backend
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={value.trim().length < 10 || busy}
              className="gradient-emerald text-primary-foreground border-0 hover:opacity-90 min-w-[110px]"
            >
              {busy ? '🚀 salvando...' : 'Salvar chave'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
