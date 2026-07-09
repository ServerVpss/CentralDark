import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import {
  Plug,
  KeyRound,
  Copy,
  Check,
  Play,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { useAiRequests, AiRequestFilter } from '@/hooks/useAiRequests';

const DEFAULT_URL = 'https://api.centralldark.com/v1';
const DEFAULT_KEY = 'cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE';
const LS_URL = 'cdk_gateway_url';
const LS_KEY = 'cdk_gateway_key';

const PS_SCRIPT = `# CentralDark Gateway — set env vars (Windows)
[System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_URL","${DEFAULT_URL}","User")
[System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_KEY","${DEFAULT_KEY}","User")
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL","${DEFAULT_URL}","User")
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY","${DEFAULT_KEY}","User")
Start-Process powershell -ArgumentList '-NoExit','-Command','Write-Host "Gateway ativo: $env:CENTRALDARK_GATEWAY_URL" -ForegroundColor Green'`;

type TestState =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'ok'; models: number; ms: number }
  | { kind: 'fail'; msg: string; status?: number };

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 gap-1.5 text-xs border-emerald-500/40 hover:bg-emerald-500/10"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? 'Copiado!' : label}
    </Button>
  );
}

export function GatewayTab() {
  const [url, setUrl] = useState(() => localStorage.getItem(LS_URL) || DEFAULT_URL);
  const [key, setKey] = useState(() => localStorage.getItem(LS_KEY) || DEFAULT_KEY);
  const [showKey, setShowKey] = useState(false);
  const [test, setTest] = useState<TestState>({ kind: 'idle' });

  useEffect(() => localStorage.setItem(LS_URL, url), [url]);
  useEffect(() => localStorage.setItem(LS_KEY, key), [key]);

  const runTest = async () => {
    setTest({ kind: 'testing' });
    const t0 = performance.now();
    try {
      const base = url.replace(/\/+$/, '');
      const r = await fetch(`${base}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const ms = Math.round(performance.now() - t0);
      if (!r.ok) {
        setTest({ kind: 'fail', msg: await r.text(), status: r.status });
        return;
      }
      const j = await r.json();
      const models = Array.isArray(j?.data) ? j.data.length : (j?.models?.length ?? 0);
      setTest({ kind: 'ok', models, ms });
    } catch (e: any) {
      setTest({ kind: 'fail', msg: e.message || 'erro de rede' });
    }
  };

  const downloadPs = () => {
    const blob = new Blob([PS_SCRIPT], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'set-centraldark-gateway.ps1';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6 p-6">
      {/* CONFIG + TESTE */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02]">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-emerald-300" />
            <CardTitle className="text-sm font-semibold">Gateway CentralDark</CardTitle>
          </div>
          {test.kind === 'ok' && (
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40">
              🟢 online · {test.models} modelos · {test.ms}ms
            </Badge>
          )}
          {test.kind === 'fail' && (
            <Badge className="bg-red-500/20 text-red-200 border-red-500/40 gap-1">
              <AlertTriangle className="h-3 w-3" /> {test.status ?? 'ERR'}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">URL base</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={DEFAULT_URL}
                className="font-mono text-xs bg-black/30 border-emerald-500/20"
              />
            </div>
            <div className="flex items-end">
              <CopyButton text={url} label="Copiar URL" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="h-3 w-3" /> API Key
              </label>
              <Input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="font-mono text-xs bg-black/30 border-emerald-500/20"
              />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
            <div className="flex items-end">
              <CopyButton text={key} label="Copiar KEY" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={runTest}
              disabled={test.kind === 'testing'}
              className="h-9 gap-1.5 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            >
              {test.kind === 'testing' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Testar conexão
            </Button>
            <Button variant="outline" className="h-9 gap-1.5" onClick={downloadPs}>
              <Download className="h-4 w-4" /> Baixar .ps1
            </Button>
            <CopyButton text={PS_SCRIPT} label="Copiar script PowerShell" />
          </div>

          {test.kind === 'fail' && (
            <pre className="mt-2 rounded bg-red-950/40 p-2 text-[11px] text-red-200 whitespace-pre-wrap max-h-32 overflow-auto">
              {test.msg}
            </pre>
          )}

          <div className="rounded border border-emerald-500/10 bg-black/20 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-emerald-300">Como aplicar no Windows</div>
            1. Clique <b>Copiar script PowerShell</b> · 2. Cole num PowerShell (Admin não precisa) · 3. Abra{' '}
            <b>novo</b> terminal — as vars valem daí pra frente. No Claude Desktop, use exatamente{' '}
            <code className="text-emerald-200">{DEFAULT_URL}</code> +{' '}
            <code className="text-emerald-200">Bearer &lt;key&gt;</code>.
          </div>
        </CardContent>
      </Card>

      {/* LOGS IA */}
      <AiRequestsPanel />
    </div>
  );
}

function AiRequestsPanel() {
  const { rows, loading, error, filter, setFilter, refresh } = useAiRequests(100);

  const filters: { id: AiRequestFilter; label: string; dot: string }[] = useMemo(
    () => [
      { id: 'all', label: 'Tudo', dot: 'bg-muted-foreground' },
      { id: 'success', label: 'Sucesso', dot: 'bg-emerald-500' },
      { id: 'fallback', label: 'Fallback', dot: 'bg-amber-500' },
      { id: 'error', label: 'Erro', dot: 'bg-red-500' },
    ],
    [],
  );

  return (
    <Card className="border-emerald-500/20">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-emerald-300" />
          <CardTitle className="text-sm font-semibold">Logs IA · ai_requests</CardTitle>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={refresh}>
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                filter === f.id
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100'
                  : 'border-border/50 hover:border-emerald-500/30 text-muted-foreground'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${f.dot}`} />
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            ⚠️ {error} — a tabela pode ainda não estar exposta no schema <code>api</code> do HUB.
          </div>
        )}

        <div className="overflow-x-auto rounded border border-border/50">
          <table className="w-full text-xs">
            <thead className="bg-black/30 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Quando</th>
                <th className="px-3 py-2 text-left">Modelo</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Latência</th>
                <th className="px-3 py-2 text-right">Tokens</th>
                <th className="px-3 py-2 text-left">Erro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Sem registros para esse filtro.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const isFb = !!r.fallback_used;
                const isErr = r.status === 'error';
                const badge = isErr
                  ? 'bg-red-500/20 text-red-200'
                  : isFb
                    ? 'bg-amber-500/20 text-amber-200'
                    : 'bg-emerald-500/20 text-emerald-200';
                const label = isErr ? 'erro' : isFb ? 'fallback' : r.status ?? '—';
                return (
                  <tr key={r.id} className="hover:bg-emerald-500/[0.03]">
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {new Date(r.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-3 py-2 font-mono">{r.model ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 ${badge}`}>{label}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.latency_ms != null ? `${r.latency_ms}ms` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {(r.tokens_in ?? 0) + (r.tokens_out ?? 0) || '—'}
                    </td>
                    <td className="px-3 py-2 max-w-[220px] truncate text-red-200/80" title={r.error ?? ''}>
                      {r.error ?? ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
