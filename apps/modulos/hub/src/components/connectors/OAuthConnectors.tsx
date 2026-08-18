import React, { useEffect, useState } from 'react';
import { hubClient as supabase, hubAuth } from '@/integrations/supabase/hub-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ApiKeyDialog } from './ApiKeyDialog';
import { ChooseAuthDialog } from './ChooseAuthDialog';
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

const API_KEY_HELP: Record<string, { text: string; url?: string }> = {
  openai:     { text: 'Cria a chave em API keys da OpenAI (formato sk-...). Precisa de billing ativo.', url: 'https://platform.openai.com/api-keys' },
  claude:     { text: 'Cria a chave no console da Anthropic (sk-ant-...).', url: 'https://console.anthropic.com/settings/keys' },
  gemini:     { text: 'Gera a chave no Google AI Studio (AIza...).', url: 'https://aistudio.google.com/apikey' },
  grok:       { text: 'Cria em console.x.ai (xai-...).', url: 'https://console.x.ai' },
  deepseek:   { text: 'Chave no painel DeepSeek (sk-...).', url: 'https://platform.deepseek.com/api_keys' },
  openrouter: { text: 'Chave única do OpenRouter (sk-or-...) roteia p/ vários modelos.', url: 'https://openrouter.ai/keys' },
  groq:       { text: 'Chave rápida da Groq (gsk_...).', url: 'https://console.groq.com/keys' },
  lovable_ai: { text: 'Chave do Gateway Lovable — normalmente injetada automática.' },
  elevenlabs: { text: 'API key ElevenLabs (xi-api-...).', url: 'https://elevenlabs.io/app/settings/api-keys' },
  telegram:   { text: 'Cola o token do @BotFather (formato 123456:ABC...).' },
  cloudflare: { text: 'Cria API Token com escopos Zone/DNS/Workers.', url: 'https://dash.cloudflare.com/profile/api-tokens' },
  supabase:   { text: 'Personal Access Token do Supabase (sbp_...).', url: 'https://supabase.com/dashboard/account/tokens' },
  contabo:    { text: 'Cole JSON: {"client_id","client_secret","api_user","api_password"} do Customer Control Panel → API.', url: 'https://api.contabo.com/' },
};

const WEB_OAUTH_IDS = new Set(['openai', 'claude', 'gemini', 'grok']);
const REAL_OAUTH_IDS = new Set(['github', 'notion', 'gdrive', 'gmail', 'lovable']);

interface Connection {
  id: string;
  provider_id: string;
  expires_at: string;
  status: string;
  account_label: string | null;
}

const BROKER_BASE = 'https://hub.centralldark.com';
const DEV_USER_ID = 'dev-pivete';

const FALLBACK_PROVIDERS: Provider[] = [
  { id: 'openai',       display_name: 'OpenAI',            color: '#10a37f', icon: 'O',  scopes: 'chat completions embeddings', auth_type: 'api_key', tier: 1 },
  { id: 'claude',       display_name: 'Anthropic Claude',  color: '#d97706', icon: 'C',  scopes: 'messages',      auth_type: 'api_key', tier: 1 },
  { id: 'gemini',       display_name: 'Google Gemini',     color: '#4285f4', icon: 'G',  scopes: 'generateContent', auth_type: 'api_key', tier: 1 },
  { id: 'grok',         display_name: 'Grok / xAI',        color: '#000000', icon: '𝕏',  scopes: 'chat',          auth_type: 'api_key', tier: 1 },
  { id: 'deepseek',     display_name: 'DeepSeek',          color: '#1e40af', icon: 'DS', scopes: 'chat reasoner', auth_type: 'api_key', tier: 1 },
  { id: 'mistral',      display_name: 'Mistral AI',        color: '#ff7000', icon: 'M',  scopes: 'chat',          auth_type: 'api_key', tier: 1 },
  { id: 'perplexity',   display_name: 'Perplexity',        color: '#20808d', icon: 'P',  scopes: 'chat search',   auth_type: 'api_key', tier: 1 },
  { id: 'cohere',       display_name: 'Cohere',            color: '#ff7759', icon: 'Co', scopes: 'chat rerank',   auth_type: 'api_key', tier: 2 },
  { id: 'groq',         display_name: 'Groq',              color: '#f55036', icon: 'Gq', scopes: 'chat',          auth_type: 'api_key', tier: 1 },
  { id: 'openrouter',   display_name: 'OpenRouter',        color: '#6366f1', icon: 'OR', scopes: 'chat',          auth_type: 'api_key', tier: 1 },
  { id: 'together',     display_name: 'Together AI',       color: '#0f6fff', icon: 'T',  scopes: 'chat',          auth_type: 'api_key', tier: 2 },
  { id: 'fireworks',    display_name: 'Fireworks AI',      color: '#a855f7', icon: 'FW', scopes: 'chat',          auth_type: 'api_key', tier: 2 },
  { id: 'moonshot',     display_name: 'Moonshot / Kimi',   color: '#111827', icon: 'K',  scopes: 'chat',          auth_type: 'api_key', tier: 2 },
  { id: 'qwen',         display_name: 'Qwen / DashScope',  color: '#615ced', icon: 'Q',  scopes: 'chat',          auth_type: 'api_key', tier: 2 },
  { id: 'huggingface',  display_name: 'Hugging Face',      color: '#ffcc4d', icon: 'HF', scopes: 'inference',     auth_type: 'api_key', tier: 2 },
  { id: 'lovable_ai',   display_name: 'Lovable AI Gateway',color: '#10b981', icon: 'L',  scopes: 'chat image tts', auth_type: 'api_key', tier: 1 },
  { id: 'replicate',    display_name: 'Replicate',         color: '#000000', icon: 'R',  scopes: 'predictions',   auth_type: 'api_key', tier: 1 },
  { id: 'stability',    display_name: 'Stability AI',      color: '#ff4d8d', icon: 'SD', scopes: 'generation',    auth_type: 'api_key', tier: 2 },
  { id: 'fal',          display_name: 'fal.ai',            color: '#7c3aed', icon: 'F',  scopes: 'run',           auth_type: 'api_key', tier: 2 },
  { id: 'elevenlabs',   display_name: 'ElevenLabs',        color: '#000000', icon: '11', scopes: 'tts voices',    auth_type: 'api_key', tier: 1 },
  { id: 'notion',       display_name: 'Notion',            color: '#000000', icon: 'N',  scopes: 'read.content update.content', auth_type: 'oauth',  tier: 1 },
  { id: 'github',       display_name: 'GitHub',            color: '#24292f', icon: 'GH', scopes: 'repo read:user', auth_type: 'oauth', tier: 1 },
  { id: 'gdrive',       display_name: 'Google Drive',      color: '#1a73e8', icon: 'D',  scopes: 'drive.file drive.readonly', auth_type: 'oauth', tier: 1 },
  { id: 'gmail',        display_name: 'Gmail',             color: '#ea4335', icon: 'M',  scopes: 'gmail.readonly gmail.send', auth_type: 'oauth', tier: 1 },
  { id: 'supabase',     display_name: 'Supabase',          color: '#3ecf8e', icon: 'S',  scopes: 'management',    auth_type: 'api_key', tier: 1 },
  { id: 'cloudflare',   display_name: 'Cloudflare',        color: '#f38020', icon: 'CF', scopes: 'zone dns workers', auth_type: 'api_key', tier: 1 },
  { id: 'contabo',      display_name: 'Contabo VPS',       color: '#00a0e3', icon: 'CB', scopes: 'instances:read', auth_type: 'api_key', tier: 1 },
  { id: 'telegram',     display_name: 'Telegram Bot',      color: '#229ed9', icon: 'TG', scopes: 'bot',           auth_type: 'api_key', tier: 1 },
  { id: 'lovable',      display_name: 'Lovable',           color: '#10b981', icon: 'L',  scopes: 'projects',      auth_type: 'oauth',   tier: 1 },
  { id: 'efi',          display_name: 'EFI Pay',           color: '#00a868', icon: 'E',  scopes: 'pix cobranças', auth_type: 'api_key', tier: 2 },
];

export function OAuthConnectors() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [conns, setConns] = useState<Connection[]>([]);
  const [userId, setUserId] = useState<string>(DEV_USER_ID);
  const [isRealUser, setIsRealUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [dialogProvider, setDialogProvider] = useState<Provider | null>(null);
  const [chooseProvider, setChooseProvider] = useState<Provider | null>(null);
  const toast = useToast();

  async function load() {
    setLoading(true);
    setLoadError(null);
    let uid: string | null = null;
    let real = false;
    try {
      const { data: { session } } = await hubAuth.auth.getSession();
      if (session?.user?.id) { uid = session.user.id; real = true; }
    } catch { /* mantém dev */ }
    setUserId(uid ?? DEV_USER_ID);
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

    let missing = false;
    if (uid) {
      try {
        const cr = await supabase.from('oauth_connections').select('id, provider_id, expires_at, status, account_label').eq('user_id', uid);
        if (cr.error) throw cr.error;
        if (cr.data) c = cr.data as Connection[];
      } catch (e: any) {
        c = [];
        const msg = e?.message ?? '';
        if (/relation.*does not exist|not.?found|schema cache|PGRST|404/i.test(msg) || e?.code === 'PGRST205' || e?.code === '42P01') {
          missing = true;
        } else {
          setLoadError(msg || 'erro ao carregar conexões');
        }
      }
    }

    setTableMissing(missing);
    setProviders(p);
    setConns(c);
    setUsingFallback(fallback);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function connect(p: Provider) {
    if (WEB_OAUTH_IDS.has(p.id) && (p.auth_type === 'api_key' || !p.auth_type)) {
      setChooseProvider(p);
      return;
    }
    if (p.auth_type === 'api_key') {
      setDialogProvider(p);
      return;
    }
    startOAuth(p);
  }

  function startOAuth(p: Provider, accountLabel?: string) {
    const back = window.location.href;
    const params = new URLSearchParams({ user_id: userId, redirect_to: back });
    if (accountLabel) params.set('label', accountLabel);
    window.location.href = `${BROKER_BASE}/oauth/${p.id}/start?${params.toString()}`;
  }

  async function saveApiKey(p: Provider, key: string) {
    try {
      const res = await fetch(`${BROKER_BASE}/api/keys/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, provider_id: p.id, api_key: key }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`${p.display_name} conectado`);
      setDialogProvider(null);
      await load();
    } catch (e: any) {
      toast.error(`Falha ao salvar ${p.display_name}: ${e?.message ?? e}`);
    }
  }

  async function disconnect(connId: string, name: string) {
    if (!confirm(`Desconectar ${name}?`)) return;
    const { error } = await supabase.from('oauth_connections').delete().eq('id', connId);
    if (error) {
      toast.error(`Erro ao revogar: ${error.message}`);
      return;
    }
    toast.success(`${name} revogado`);
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

  if (loading) {
    return (
      <Card className="card-premium border-border/60">
        <CardHeader>
          <div className="h-6 w-56 bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card/60 p-4 h-24 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-premium border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-2xl">
                Conectar contas <span className="text-gradient-emerald">OAuth</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tokens cifrados no HUB · Contabo / Gmail / Cloudflare inclusos
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {usingFallback && (
                <Badge className={toneClass.warning}>🟡 catálogo local ativo</Badge>
              )}
              {loadError && (
                <Badge className={toneClass.warning}>⚠️ {loadError}</Badge>
              )}
              {!isRealUser && (
                <Badge className={toneClass.muted}>🧪 modo dev · sem login</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-12 space-y-3 border border-dashed border-border rounded-lg">
              <div className="text-sm text-muted-foreground">Nenhum provider disponível ainda.</div>
              <Button size="sm" variant="outline" onClick={load}>🔄 Tentar de novo</Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {providers.map(p => {
                const conn = conns.find(c => c.provider_id === p.id);
                const s = statusInfo(conn);
                return (
                  <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-4 space-y-3 transition-all hover:border-primary/50"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white text-base font-semibold"
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
                        className={conn ? 'flex-1' : 'flex-1 gradient-emerald text-primary-foreground border-0'}
                      >
                        {conn ? 'Reconectar' : 'Conectar'}
                      </Button>
                      {conn && (
                        <Button
                          onClick={() => disconnect(conn.id, p.display_name)}
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 border-destructive/40"
                        >
                          Revogar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ApiKeyDialog
        open={!!dialogProvider}
        providerName={dialogProvider?.display_name ?? ''}
        providerColor={dialogProvider?.color ?? '#98C93C'}
        helpText={dialogProvider ? API_KEY_HELP[dialogProvider.id]?.text : undefined}
        helpUrl={dialogProvider ? API_KEY_HELP[dialogProvider.id]?.url : undefined}
        onClose={() => setDialogProvider(null)}
        onConfirm={(key) => dialogProvider ? saveApiKey(dialogProvider, key) : Promise.resolve()}
      />

      <ChooseAuthDialog
        open={!!chooseProvider}
        providerId={chooseProvider?.id ?? ''}
        providerName={chooseProvider?.display_name ?? ''}
        providerColor={chooseProvider?.color ?? '#98C93C'}
        hasRealOAuth={chooseProvider ? REAL_OAUTH_IDS.has(chooseProvider.id) : false}
        existingWebSessions={chooseProvider ? conns.filter(c => c.provider_id === chooseProvider.id) : []}
        onClose={() => setChooseProvider(null)}
        onPickApiKey={() => {
          const p = chooseProvider;
          setChooseProvider(null);
          if (p) setDialogProvider(p);
        }}
        onPickOAuth={(accountLabel) => {
          const p = chooseProvider;
          setChooseProvider(null);
          if (!p) return;
          if (!REAL_OAUTH_IDS.has(p.id)) {
            toast.error(`Login Web de ${p.display_name} ainda não disponível. Usa a API KEY.`);
            return;
          }
          startOAuth(p, accountLabel);
        }}
      />
    </>
  );
}
