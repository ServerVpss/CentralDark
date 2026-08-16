import React, { useEffect, useRef, useState } from 'react';
import { Copy, LockKeyhole, Pencil, RotateCcw, Save, Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'centraldark.hub.boot-studio.presentation.v1';

const DEFAULT_BOOT_PRESENTATION = `✨ CENTRALDARK_AI_BOOT ✨
soul: LOADED 🧠
governance: LOADED 🛡️
context_reconciliation: LOADED 🧩
history_preservation: ACTIVE 📚
source_of_truth: ServerVpss/CentralDark + runtime medido 🎯
observed_evidence: branch/HEAD/PR/runtime/tools medidos agora 🔎
alignment: SEGREDO/CHEFE > SOL > PIVETE/HERMES + ESPECIALISTAS 👑
role: COORDINATOR 🎛️
writer: NONE ✍️
frequency: ADAPTIVE ⚡`;

const EMOJIS = ['✨', '🧠', '🛡️', '🧩', '📚', '🎯', '🔎', '👑', '🎛️', '✍️', '⚡', '🤖', '🏙️', '⛏️', '💎', '🚀'];

export function BootStudioTab() {
  const [saved, setSaved] = useState(DEFAULT_BOOT_PRESENTATION);
  const [draft, setDraft] = useState(DEFAULT_BOOT_PRESENTATION);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSaved(stored);
        setDraft(stored);
      }
    } catch {
      // Local persistence is optional; the canonical boot contract is not affected.
    }
  }, []);

  function persist(value: string) {
    setSaved(value);
    setDraft(value);
    setEditing(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Keep the in-memory edit even when browser storage is unavailable.
    }
  }

  function reset() {
    persist(DEFAULT_BOOT_PRESENTATION);
  }

  function cancel() {
    setDraft(saved);
    setEditing(false);
  }

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setDraft((value) => `${value}${emoji}`);
      return;
    }

    const start = textarea.selectionStart ?? draft.length;
    const end = textarea.selectionEnd ?? draft.length;
    const next = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;
    setDraft(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  async function copyBoot() {
    await navigator.clipboard.writeText(saved);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl gradient-emerald flex items-center justify-center shadow-3d-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Boot Studio</h2>
              <p className="text-sm text-muted-foreground">Veja, escreva e enfeite a apresentação do bloco de calibração da Casa.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary/60 hover:bg-primary/5 transition"
            >
              <Pencil className="h-4 w-4" /> Editar com lápis
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => persist(draft)}
                className="inline-flex items-center gap-2 rounded-lg gradient-emerald px-3 py-2 text-sm text-primary-foreground shadow-3d-primary"
              >
                <Save className="h-4 w-4" /> Salvar
              </button>
              <button
                type="button"
                onClick={cancel}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40 transition"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={copyBoot}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary/60 hover:bg-primary/5 transition"
          >
            <Copy className="h-4 w-4" /> {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40 transition"
          >
            <RotateCcw className="h-4 w-4" /> Padrão
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <strong>Uma gaveta, duas camadas:</strong> o texto abaixo é a <strong>apresentação editável</strong> do Boot Studio. A governança real continua vindo do <code>LEIA-ME-IA.md</code> e dos owners canônicos; trocar emoji ou frase aqui não concede permissão, não muda autoridade e não cria segunda verdade.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="card-premium rounded-xl border border-border/60 p-5 space-y-4">
          <div>
            <h3 className="font-semibold">✍️ Teclado / lápis</h3>
            <p className="text-xs text-muted-foreground mt-1">Ctrl/Cmd + S salva · Esc cancela · os emojis entram onde estiver o cursor.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={!editing}
                onClick={() => insertEmoji(emoji)}
                className="h-9 min-w-9 rounded-lg border border-border bg-background/50 px-2 text-lg transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-40"
                title={`Inserir ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={editing ? draft : saved}
            readOnly={!editing}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                persist(draft);
              }
              if (event.key === 'Escape') cancel();
            }}
            spellCheck={false}
            className="min-h-[360px] w-full resize-y rounded-xl border border-border bg-background/70 p-4 font-mono text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 read-only:opacity-80"
          />
        </section>

        <section className="card-premium rounded-xl border border-border/60 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">🖥️ Prévia</h3>
              <p className="text-xs text-muted-foreground mt-1">É assim que o teu cartão visual fica registrado neste navegador.</p>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">LOCAL PRESENTATION</span>
          </div>
          <pre className="min-h-[360px] whitespace-pre-wrap break-words rounded-xl border border-border/60 bg-black/40 p-5 font-mono text-sm leading-7 text-foreground shadow-inner">
            {editing ? draft : saved}
          </pre>
        </section>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground leading-5">
        <strong className="text-foreground">Persistência:</strong> esta decoração fica salva no navegador deste dispositivo. O contrato executável da Casa permanece versionado no GitHub. Assim você pode brincar com texto e emoji sem transformar decoração em governança por acidente.
      </div>
    </div>
  );
}
