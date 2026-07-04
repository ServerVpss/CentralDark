import React, { useEffect, useState } from 'react';
import { hubClient as supabase } from '@/integrations/supabase/hub-client';

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

// 🔒 Catálogo fallback — Tier 1 completo (foto do Pivete)
const FALLBACK_PROVIDERS: Provider[] = [
  // IAs
  { id: 'grok',     display_name: 'Grok / xAI',   color: '#000000', icon: 'grok',     scopes: 'chat.read chat.write', auth_type: 'api_key', tier: 1 },
  { id: 'claude',   display_name: 'Claude',       color: '#d97706', icon: 'claude',   scopes: 'messages',              auth_type: 'api_key', tier: 1 },
  { id: 'openai',   display_name: 'OpenAI',       color: '#10a37f', icon: 'openai',   scopes: 'chat completions',      auth_type: 'api_key', tier: 1 },
  { id: 'gemini',   display_name: 'Gemini',       color: '#4285f4', icon: 'gemini',   scopes: 'generateContent',       auth_type: 'api_key', tier: 1 },
  // Produtividade / Dev / Storage
  { id: 'notion',   display_name: 'Notion',       color: '#000000', icon: 'notion',   scopes: 'read.content update.content', auth_type: 'oauth', tier: 1 },
  { id: 'github',   display_name: 'GitHub',       color: '#24292f', icon: 'github',   scopes: 'repo read:user',        auth_type: 'oauth',   tier: 1 },
  { id: 'gdrive',   display_name: 'Google Drive', color: '#1a73e8', icon: 'drive',    scopes: 'drive.file drive.readonly', auth_type: 'oauth', tier: 1 },
  { id: 'supabase', display_name: 'Supabase',     color: '#3ecf8e', icon: 'supabase', scopes: 'management',            auth_type: 'api_key', tier: 1 },
];


export function OAuthConnectors() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [conns, setConns] = useState<Connection[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);


  async function load() {
    setLoading(true);
    setLoadError(null);
    let uid: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id ?? null;
    } catch { uid = null; }
    setUserId(uid);

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

    if (uid) {
      try {
        const cr = await supabase.from('oauth_connections').select('id, provider_id, expires_at, status, account_label');
        if (cr.error) throw cr.error;
        if (cr.data) c = cr.data as Connection[];
      } catch (e: any) {
        c = [];
        setLoadError(e?.message ?? 'erro ao carregar conexões');
      }
    }

    setProviders(p);
    setConns(c);
    setUsingFallback(fallback);
    setLoading(false);
  }


  useEffect(() => { load(); }, []);

  function connect(providerId: string) {
    if (!userId) { alert('🔴 Faça login no HUB primeiro'); return; }
    const back = window.location.href;
    window.location.href = `${BROKER_BASE}/oauth/${providerId}/start?user_id=${userId}&redirect_to=${encodeURIComponent(back)}`;
  }

  async function disconnect(connId: string) {
    if (!confirm('Desconectar essa conta?')) return;
    await supabase.from('oauth_connections').delete().eq('id', connId);
    load();
  }

  function statusBadge(c?: Connection) {
    if (!c) return { txt: 'não conectado', cls: 'bg-gray-200 text-gray-700' };
    const exp = new Date(c.expires_at).getTime();
    const days = Math.floor((exp - Date.now()) / 86400000);
    if (c.status !== 'active') return { txt: c.status, cls: 'bg-red-100 text-red-700' };
    if (days < 0) return { txt: 'expirado', cls: 'bg-red-100 text-red-700' };
    if (days < 3) return { txt: `expira em ${days}d`, cls: 'bg-yellow-100 text-yellow-800' };
    return { txt: `ativo · ${days}d`, cls: 'bg-emerald-100 text-emerald-700' };
  }

  if (loading) return <div className="p-6 text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Conectar contas (OAuth)</h3>
        <p className="text-sm text-muted-foreground">
          Tokens cifrados no HUB Supabase · expiração 30d · logs no Hermes
          {usingFallback && <span className="ml-2 text-amber-600">🟡 catálogo local ativo</span>}
          {loadError && <span className="ml-2 text-red-600">🔴 {loadError}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          🛠️ Futuro: Hub de Tokens via Supabase Vault + Edge Function <code>get-token</code>
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {providers.map(p => {
          const conn = conns.find(c => c.provider_id === p.id);
          const s = statusBadge(conn);
          return (
            <div key={p.id} className="rounded-xl border p-4 shadow-3d bg-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                     style={{ backgroundColor: p.color }}>
                  {p.display_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{p.display_name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${s.cls}`}>{s.txt}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => connect(p.id)}
                        className="flex-1 rounded-lg px-3 py-2 text-white text-sm font-medium shadow-3d-primary active:translate-y-[1px]"
                        style={{ backgroundColor: p.color }}>
                  {conn ? 'Reconectar' : 'Conectar'}
                </button>
                {conn && (
                  <button onClick={() => disconnect(conn.id)}
                          className="rounded-lg px-3 py-2 text-sm bg-red-50 text-red-600 shadow-3d-destructive active:translate-y-[1px]">
                    Revogar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
