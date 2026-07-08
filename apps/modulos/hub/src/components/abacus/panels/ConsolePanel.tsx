import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { abacusApi } from '@/services/abacus-client';

interface Props {
  model: string;
}

export function ConsolePanel({ model }: Props) {
  const [prompt, setPrompt] = useState('Diga em uma frase: você está online?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; content: string; latencyMs: number; status: number } | null>(null);

  const send = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await abacusApi.chat(model, prompt));
    } catch (e: any) {
      setResult({ ok: false, content: e.message ?? 'erro', latencyMs: 0, status: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Modelo atual: <span className="text-foreground font-mono">{model}</span> · troca na aba <span className="text-foreground">Modelos</span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        placeholder="Digite um prompt de teste..."
        className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background/40 text-sm focus:outline-none focus:border-primary/60 resize-y"
      />

      <button
        onClick={send}
        disabled={loading || !prompt.trim()}
        className="w-full sm:w-auto gradient-emerald text-primary-foreground px-5 py-2.5 rounded-lg font-medium shadow-3d-primary disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? 'Enviando...' : 'Enviar teste'}
      </button>

      {result && (
        <div className={`p-4 rounded-lg border ${result.ok ? 'border-primary/40 bg-primary/5' : 'border-destructive/40 bg-destructive/10'}`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={result.ok ? 'text-primary font-medium' : 'text-destructive font-medium'}>
              HTTP {result.status || '—'} {result.ok ? '✓' : '✗'}
            </span>
            <span className="text-muted-foreground">{result.latencyMs}ms</span>
          </div>
          <pre className="text-sm whitespace-pre-wrap break-words text-foreground/90 font-mono">{result.content}</pre>
        </div>
      )}
    </div>
  );
}
