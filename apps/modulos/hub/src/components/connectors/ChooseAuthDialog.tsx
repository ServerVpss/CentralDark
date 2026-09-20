import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface ExistingConn {
  id: string;
  account_label: string | null;
  status: string;
}

interface Props {
  open: boolean;
  providerId: string;
  providerName: string;
  providerColor: string;
  /** true = provedor tem OAuth público oficial de verdade (client_id/secret configurados no broker).
   *  false = "Login Web" é sessão de navegador (Zendriver), não OAuth oficial — precisa deixar isso claro. */
  hasRealOAuth: boolean;
  existingWebSessions: ExistingConn[];
  onClose: () => void;
  onPickApiKey: () => void;
  onPickOAuth: (accountLabel: string) => void;
}

// Modal de escolha: API KEY (oficial) vs Login Web.
// Login Web só é OAuth de verdade quando `hasRealOAuth` é true (broker tem client_id/secret
// cadastrados pro provider). Pra provedores sem OAuth público pra terceiros (ex: Grok/xAI —
// só oferece API key via console.x.ai), o Login Web é sessão de navegador via Zendriver,
// e isso é dito com todas as letras no modal — nada de fingir OAuth que não existe.
export function ChooseAuthDialog({
  open,
  providerId,
  providerName,
  providerColor,
  hasRealOAuth,
  existingWebSessions,
  onClose,
  onPickApiKey,
  onPickOAuth,
}: Props) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (open) setLabel('');
  }, [open, providerId]);

  if (!open) return null;

  function submitOAuth() {
    const trimmed = label.trim();
    onPickOAuth(trimmed || `${providerName} - conta ${existingWebSessions.length + 1}`);
  }

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

          <div className="w-full p-4 rounded-lg border border-border space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌐</span>
              <span className="font-semibold text-sm">Login Web (sessão do navegador)</span>
              {hasRealOAuth ? (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/40">
                  OAuth oficial
                </span>
              ) : (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border border-[hsl(var(--warning))]/40">
                  experimental
                </span>
              )}
            </div>

            {hasRealOAuth ? (
              <p className="text-xs text-muted-foreground">
                Fluxo OAuth2 oficial do provedor (redireciona pro site deles, você autoriza, volta pro HUB
                já conectado). Suporta múltiplas contas — cada login vira uma conexão nova.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                <b>{providerName} não oferece OAuth público oficial pra apps de terceiro</b> — só API key.
                Esse modo aqui reaproveita a sessão do navegador (Zendriver, sem API pública), sujeito a
                captchas e mudanças no site. Não é o login OAuth oficial do provedor — é um substituto pra
                testes/uso pessoal enquanto não houver API key.
              </p>
            )}

            {existingWebSessions.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Contas já conectadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {existingWebSessions.map((c) => (
                    <span
                      key={c.id}
                      className="text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground border border-border"
                    >
                      {c.account_label || '(sem nome)'} · {c.status}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 items-center">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={`ex: ${providerName} - conta pessoal`}
                className="text-sm"
              />
              <Button size="sm" onClick={submitOAuth} className="shrink-0 whitespace-nowrap">
                {existingWebSessions.length > 0 ? '+ Adicionar conta' : 'Conectar'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
