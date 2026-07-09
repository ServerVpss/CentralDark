import React, { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { abacusApi, AbacusLog } from '@/services/abacus-client';
import { logButton } from '@/lib/buttonLog';

export function LogsPanel() {
  const [logs, setLogs] = useState<AbacusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ok' | 'error'>('all');

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      setLogs(await abacusApi.logs(100));
    } catch (e: any) {
      setErr(e.message ?? 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter((l) => {
    if (filter === 'ok')    return l.status >= 200 && l.status < 300;
    if (filter === 'error') return l.status >= 400;
    return true;
  });

  const exportCsv = () => {
    const header = 'timestamp,modelo,status,latencia_ms,tokens_in,tokens_out,erro\n';
    const rows = filtered.map((l) =>
      [l.created_at, l.model, l.status, l.latency_ms ?? '', l.tokens_in ?? '', l.tokens_out ?? '', `"${(l.error_snippet ?? '').replace(/"/g, "'")}"`].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abacus-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {(['all', 'ok', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { logButton('abacus.logs.filter', { filter: f }); setFilter(f); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                filter === f
                  ? 'gradient-emerald text-primary-foreground'
                  : 'border border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'ok' ? '2xx' : '4xx/5xx'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { logButton('abacus.logs.export-csv', { rows: filtered.length }); exportCsv(); }}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 hover:bg-muted/40 transition"
          >
            <Download className="h-3 w-3" /> CSV
          </button>
          <button
            onClick={() => { logButton('abacus.logs.reload'); load(); }}
            disabled={loading}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 hover:bg-muted/40 transition"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Recarregar
          </button>
        </div>
      </div>

      {err && (
        <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive">
          {err} — tabela <code>abacus_logs</code> talvez ainda não exista no HUB.
        </div>
      )}

      {!err && filtered.length === 0 && !loading && (
        <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
          Nenhuma requisição registrada ainda. Manda um teste na aba <span className="text-foreground">Console</span>.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="text-left px-3 py-2">Quando</th>
                <th className="text-left px-3 py-2">Modelo</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Latência</th>
                <th className="text-right px-3 py-2">Tokens</th>
                <th className="text-left px-3 py-2">Erro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const ok = l.status >= 200 && l.status < 300;
                return (
                  <tr key={l.id} className="border-t border-border/40">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="px-3 py-2 font-mono">{l.model}</td>
                    <td className={`px-3 py-2 font-medium ${ok ? 'text-primary' : 'text-destructive'}`}>
                      {l.status}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{l.latency_ms ?? '-'}ms</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {(l.tokens_in ?? 0) + (l.tokens_out ?? 0) || '-'}
                    </td>
                    <td className="px-3 py-2 text-destructive truncate max-w-[200px]">
                      {l.error_snippet ?? ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
