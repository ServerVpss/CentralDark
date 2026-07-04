import React, { useEffect, useState } from 'react';
import { hubClient as supabase } from '@/integrations/supabase/hub-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ApiKeyDialog } from './ApiKeyDialog';
import { useToast } from '@/components/Toast';

interface Provider {
  id: string;
  display_name: string;
  color: string;
  icon: string;
  scopes: string;
  auth_type?: 'oauth' | 'api_key';
  tier?: 1 | 2 | 3;
}

interface Connection {
  id: string;
  provider_id: string;
  expires_at: string;
  status: string;
  account_label: string | null;
}

const BROKER_BASE = 'https://hub.centralldark.com';
// Modo dev: enquanto não tem login, usa um user_id sintético.
// Quando login for feito, real user.id sobrescreve.
const DEV_USER_ID = 'dev-pivete';

// 🔒 Catálogo fallback — Tier 1 completo
const FALLBACK_PROVIDERS: Provider[] = [
  { id: 'grok',     display_name: 'Grok / xAI',   color: '#000000', icon: '𝕏',  scopes: 'chat', auth_type: 'api_key', tier: 1 },
  { id: 'claude',   display_name: 'Claude',       color: '#d97706', icon: 'C',  scopes: 'messages', auth_type: 'api_key', tier: 1 },
  { id: 'openai',   display_name: 'OpenAI',       color: '#10a37f', icon: 'O',  scopes: 'chat completions', auth_type: 'api_key', tier: 1 },
  { id: 'gemini',   display_name: 'Gemini',       color: '#4285f4', icon: 'G',  scopes: 'generateContent', auth_type: 'api_key', tier: 1 },
  { id: 'notion',   display_name: 'Notion',       color: '#000000', icon: 'N',  scopes: 'read.content update.content', auth_type: 'oauth', tier: 1 },
  { id: 'github',   display_name: 'GitHub',       color: '#24292f', icon: 'GH', scopes: 'repo read:user', auth_type: 'oauth', tier: 1 },
  { id: 'gdrive',   display_name: 'Google Drive', color: '#1a73e8', icon: 'D',  scopes: 'drive.file drive.readonly', auth_type: 'oauth', tier: 1 },
  { id: 'supabase', display_name: 'Supabase',     color: '#3ecf8e', icon: 'S',  scopes: 'management', auth_type: 'api_key', tier: 1 },
];

export function OAuthConnectors() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [conns, setConns] = useState<Connection[]>([]);
  const [userId, setUserId] = useState<string>(DEV_USER_ID);
  const [isRealUser, setIsRealUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogProvider, setDialogProvider] = useState<Provider | null>(null);
  const toast = useToast();

  async function load() {
    setLoading(true);
    setLoadError(null);
    let uid: string = DEV_USER_ID;
    let real = false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) { uid = user.id; real = true; }
    } catch { /* mantém dev */ }
    setUserId(uid);
    setIsRealUser(real);

    let p: Provider[] = [];
    let c: Connection[] = [];
    let fallback = false;

    try {
      const pr = await supabase.from('oauth_providers').select('*').eq('enabled', true).order('display_name');
      if (pr.error || !pr.data || pr.data.length === 0) throw new Error('empty_or_missing');
      p = pr.data as Provider[];
    } catch {
      p = FALLBACK_PROVIDERS;
      fallback = true;
    }

    try {
      const cr = await supabase.from('oauth_connections').select('id, provider_id, expires_at, status, account_label').eq('user_id', uid);
      if (cr.error) throw cr.error;
      if (cr.data) c = cr.data as Connection[];
    } catch (e: any) {
      c = [];
      // silêncio se a tabela ainda não existe (fase MVP)
      if (!/relation.*does not exist|not.found/i.test(e?.message ?? '')) {
        setLoadError(e?.message ?? 'erro ao carregar conexões');
      }
    }

    setProviders(p);
    setConns(c);
    setUsingFallback(fallback);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function connect(p: Provider) {
    if (p.auth_type === 'api_key') {
      const key = window.prompt(`🔑 Cole a API key do ${p.display_name}:`);
      if (!key || key.trim().length < 10) return;
      try {
        const res = await fetch(`${BROKER_BASE}/api/keys/store`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, provider_id: p.id, api_key: key.trim() }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await load();
        alert(`✅ ${p.display_name} conectado!`);
      } catch (e: any) {
        alert(`🔴 Falha ao salvar: ${e?.message ?? e}`);
      }
      return;
    }
    // OAuth
    const back = window.location.href;
    window.location.href = `${BROKER_BASE}/oauth/${p.id}/start?user_id=${userId}&redirect_to=${encodeURIComponent(back)}`;
  }

  async function disconnect(connId: string) {
    if (!confirm('Desconectar essa conta?')) return;
    await supabase.from('oauth_connections').delete().eq('id', connId);
    load();
  }

  function statusInfo(c?: Connection) {
    if (!c) return { txt: 'não conectado', tone: 'muted' as const };
    const days = Math.floor((new Date(c.expires_at).getTime() - Date.now()) / 86400000);
    if (c.status !== 'active') return { txt: c.status, tone: 'danger' as const };
    if (days < 0) return { txt: 'expirado', tone: 'danger' as const };
    if (days < 3) return { txt: `expira em ${days}d`, tone: 'warning' as const };
    return { txt: `ativo · ${days}d`, tone: 'success' as const };
  }

  const toneClass = {
    muted:   'bg-muted text-muted-foreground border-border',
    success: 'bg-primary/15 text-primary border-primary/40',
    warning: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/40',
    danger:  'bg-destructive/15 text-destructive border-destructive/40',
  };

  if (loading) return <div className="p-6 text-muted-foreground text-sm">Carregando conectores…</div>;

  return (
    <Card className="card-premium border-border/60">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-2xl">
              Conectar contas <span className="text-gradient-emerald">OAuth</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Tokens cifrados no HUB Supabase · expiração 30d · logs no Hermes
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {usingFallback && (
              <Badge className={toneClass.warning}>🟡 catálogo local ativo</Badge>
            )}
            {loadError && (
              <Badge className={toneClass.danger}>🔴 {loadError}</Badge>
            )}
            {!isRealUser && (
              <Badge className={toneClass.muted}>🧪 modo dev · sem login</Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground border-l-2 border-primary/50 pl-2 mt-2">
          🛠️ Backend: Supabase HUB (VPS) + Edge Functions <code className="font-mono text-primary">get-token</code> / <code className="font-mono text-primary">keys/store</code>
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {providers.map(p => {
            const conn = conns.find(c => c.provider_id === p.id);
            const s = statusInfo(conn);
            return (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-4 space-y-3 transition-all hover:border-primary/50 hover:shadow-3d-primary hover:-translate-y-0.5"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }}
                />
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white text-base font-semibold shadow-3d"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.display_name}</div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {p.auth_type === 'api_key' && (
                        <Badge className="text-[10px] py-0 px-1.5 bg-secondary text-secondary-foreground border-border">🔑 API KEY</Badge>
                      )}
                      {p.auth_type === 'oauth' && (
                        <Badge className="text-[10px] py-0 px-1.5 bg-primary/15 text-primary border-primary/40">🔐 OAUTH</Badge>
                      )}
                      <Badge className={`text-[10px] py-0 px-1.5 ${toneClass[s.tone]}`}>{s.txt}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => connect(p)}
                    size="sm"
                    variant={conn ? 'outline' : 'default'}
                    className={conn ? 'flex-1' : 'flex-1 gradient-emerald text-primary-foreground border-0 hover:opacity-90'}
                  >
                    {conn ? 'Reconectar' : 'Conectar'}
                  </Button>
                  {conn && (
                    <Button
                      onClick={() => disconnect(conn.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/40"
                    >
                      Revogar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
