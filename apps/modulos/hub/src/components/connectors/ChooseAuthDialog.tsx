import React from 'react';
import { Button } from '@/shared/ui/button';

interface Props {
  open: boolean;
  providerName: string;
  providerColor: string;
  onClose: () => void;
  onPickApiKey: () => void;
  onPickOAuth: () => void;
}

// Modal de escolha: API KEY (oficial) vs OAuth Web (sessão real do usuário via Zendriver)
export function ChooseAuthDialog({ open, providerName, providerColor, onClose, onPickApiKey, onPickOAuth }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-3d-primary overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${providerColor}, transparent)` }}
        />
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">
              Como conectar <span className="text-gradient-emerald">{providerName}</span>?
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Escolhe o modo de acesso. Dá pra trocar depois.
            </p>
          </div>

          <button
            onClick={onPickApiKey}
            className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/60 hover:bg-primary/5 transition group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🔑</span>
              <span className="font-semibold text-sm">Colar API KEY oficial</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/40">
                recomendado
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Chave da conta de desenvolvedor (dashboard oficial do provedor). Estável, com billing,
              usa a API pública. Ideal pra produção.
            </p>
          </button>

          <button
            onClick={onPickOAuth}
            className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/60 hover:bg-primary/5 transition group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌐</span>
              <span className="font-semibold text-sm">Login Web (sessão do navegador)</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border border-[hsl(var(--warning))]/40">
                experimental
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Reaproveita a tua conta ChatGPT/Claude/Gemini via Zendriver no HUB (sem API pública).
              Sujeito a captchas e mudanças no site. Serve pra testes e uso pessoal.
            </p>
          </button>

          <div className="flex justify-end pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
