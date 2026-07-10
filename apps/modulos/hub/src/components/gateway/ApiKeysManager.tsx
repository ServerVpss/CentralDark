// Gerenciador de API Keys do Gateway CentralDark (api.centralldark.com).
// Usa as edge functions já existentes hub-create-api-key / hub-revoke-api-key
// (schema api.api_keys, projeto lyoigsqluyktoclwdaft). Só visível para admin (RoleGuard).
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { KeyRound, Plus, RefreshCw, Copy, Check, Ban, AlertTriangle, ShieldCheck } from 'lucide-react';
import { hubClient, hubAuth } from '@/integrations/supabase/hub-client';
import { logButton } from '@/lib/buttonLog';

const FN_BASE = `${import.meta.env.VITE_HUB_SUPABASE_URL || 'https://lyoigsqluyktoclwdaft.supabase.co'}/functions/v1`;

interface ApiKeyRow {
  id: string;
  prefix: string;
  label: string;
  status: 'active' | 'revoked' | string;
  scopes: string[] | null;
  owner_email: string | null;
  created_at: string;
  revoked_at: string | null;
}

async function callFn(path: string, body: unknown) {
  const { data: sessionData } = await hubAuth.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Sessão expirada — faça login novamente.');

  const res = await fetch(`${FN_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new Error(json?.error || `Falha na chamada (${res.status})`);
  }
  return json;
}

function CopyOnceButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      className="h-8 gap-1.5 text-xs bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado!' : 'Copiar chave'}
    </Button>
  );
}

export function ApiKeysManager() {
  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await hubClient
        .from('api_keys')
        .select('id, prefix, label, status, scopes, owner_email, created_at, revoked_at')
        .order('created_at', { ascending: false });
      if (qErr) throw qErr;
      setRows((data as ApiKeyRow[]) || []);
    } catch (e: any) {
      setError(e.message || 'Falha ao listar API keys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    setNewSecret(null);
    try {
      logButton('gateway.api-key.create', { label });
      const json = await callFn('hub-create-api-key', {
        label: label.trim() || 'sem-label',
        scopes: ['read'],
      });
      setNewSecret(json.secret_show_once);
      setLabel('');
      await load();
    } catch (e: any) {
      setCreateError(e.message || 'Falha ao gerar key.');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      logButton('gateway.api-key.revoke', { id });
      await callFn('hub-revoke-api-key', { id });
      await load();
    } catch (e: any) {
      setError(e.message || 'Falha ao revogar key.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <Card className="border-emerald-500/20">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-emerald-300" />
          <CardTitle className="text-sm font-semibold">API Keys do Gateway</CardTitle>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gerar nova key */}
        <div className="rounded border border-emerald-500/20 bg-black/20 p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nome da key (ex: Claude Desktop do Pivete)"
              className="flex-1 min-w-[200px] font-mono text-xs bg-black/30 border-emerald-500/20"
            />
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="h-10 gap-1.5 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            >
              {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Gerar nova key
            </Button>
          </div>

          {createError && (
            <div className="flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {createError}
            </div>
          )}

          {newSecret && (
            <div className="space-y-2 rounded border border-amber-500/40 bg-amber-500/10 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-200">
                <ShieldCheck className="h-3.5 w-3.5" /> Grave esta chave AGORA — ela não será exibida novamente.
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <code className="flex-1 min-w-[220px] break-all rounded bg-black/40 px-2 py-1.5 text-[11px] text-emerald-200">
                  {newSecret}
                </code>
                <CopyOnceButton text={newSecret} />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}

        {/* Lista */}
        <div className="overflow-x-auto rounded border border-border/50">
          <table className="w-full text-xs">
            <thead className="bg-black/30 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Prefixo</th>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Criada em</th>
                <th className="px-3 py-2 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    Nenhuma API key gerada ainda.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const isActive = r.status === 'active';
                return (
                  <tr key={r.id} className="hover:bg-emerald-500/[0.03]">
                    <td className="px-3 py-2 font-mono">{r.prefix}</td>
                    <td className="px-3 py-2">{r.label}</td>
                    <td className="px-3 py-2">
                      <Badge
                        className={
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-200 border-red-500/40'
                        }
                      >
                        {isActive ? '🟢 ativa' : '🔴 revogada'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {new Date(r.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs border-red-500/40 text-red-200 hover:bg-red-500/10"
                          disabled={revokingId === r.id}
                          onClick={() => handleRevoke(r.id)}
                        >
                          {revokingId === r.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Ban className="h-3 w-3" />
                          )}
                          Revogar
                        </Button>
                      )}
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
