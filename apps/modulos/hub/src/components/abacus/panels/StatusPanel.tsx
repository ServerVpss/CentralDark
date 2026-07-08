import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, KeyRound, Loader2 } from 'lucide-react';
import { abacusApi, AbacusStatus } from '@/services/abacus-client';

export function StatusPanel() {
  const [data, setData] = useState<AbacusStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form de chave
  const [editing, setEditing] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      setData(await abacusApi.status());
    } catch (e: any) {
      setErr(e.message ?? 'erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submitKey = async () => {
    if (!keyInput.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const r = await abacusApi.setKey(keyInput.trim());
      if (r.ok) {
        setSaveMsg('✅ Chave ativada');
        setKeyInput('');
        setEditing(false);
        await load();
      } else {
        setSaveMsg(`❌ ${r.error ?? 'falha ao salvar'}`);
      }
    } catch (e: any) {
      setSaveMsg(`❌ ${e.message ?? 'erro'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status ao vivo</h3>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 hover:bg-muted/40 transition"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Recarregar
        </button>
      </div>

      {err && (
        <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Edge <code>abacus-router</code> indisponível</p>
            <p className="text-xs opacity-80 mt-0.5">{err}</p>
            <p className="text-xs opacity-80 mt-1">Provável: função ainda não deployada no HUB.</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Card da chave */}
          <div className={`p-4 rounded-lg border ${
            data.keyConfigured
              ? 'border-primary/40 bg-primary/10'
              : 'border-yellow-500/40 bg-yellow-500/10'
          }`}>
            <div className="flex items-center gap-3">
              {data.keyConfigured
                ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                : <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />}
              <div className="flex-1 min-w-0 text-sm">
                <p className="font-medium">
                  {data.keyConfigured
                    ? <>ABACUS_API_KEY <span className="text-primary">ativada</span> · <span className="font-mono text-xs opacity-80">••••{data.keyHint}</span></>
                    : 'ABACUS_API_KEY não configurada'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.keyConfigured
                    ? `${data.modelCount} modelos detectados via /models`
                    : 'Cola a chave abaixo pra ativar chamadas reais. Ela nunca volta pro navegador.'}
                </p>
              </div>
              <button
                onClick={() => { setEditing((v) => !v); setSaveMsg(null); }}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 hover:bg-muted/40 transition shrink-0"
              >
                <KeyRound className="h-3 w-3" />
                {data.keyConfigured ? 'Trocar' : 'Configurar'}
              </button>
            </div>

            {editing && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Cola aqui a chave Abacus (s2_...)"
                  className="flex-1 px-3 py-2 text-sm font-mono rounded-md border border-border/60 bg-background/60 focus:outline-none focus:border-primary/60"
                />
                <button
                  onClick={submitKey}
                  disabled={saving || keyInput.length < 8}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Salvar no cofre
                </button>
              </div>
            )}
            {saveMsg && <p className="text-xs mt-2 opacity-80">{saveMsg}</p>}
          </div>

          {/* Endpoints */}
          <div className="space-y-2">
            {data.endpoints.map((e) => (
              <div key={e.name} className="p-3 rounded-lg border border-border/60 bg-background/40 flex items-center gap-3">
                {e.ok
                  ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{e.url}</p>
                </div>
                <div className="text-right text-xs shrink-0">
                  <p className={e.ok ? 'text-primary' : 'text-destructive'}>HTTP {e.status}</p>
                  <p className="text-muted-foreground">{e.latencyMs}ms</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
