import React, { useEffect, useState } from 'react';
import { hubClient as supabase } from '@/integrations/supabase/hub-client';
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
  web_oauth?: boolean; // permite também login via sessão web (Zendriver)
}

// Dicas por provedor: onde pegar a chave oficial
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
};

const WEB_OAUTH_IDS = new Set(['openai', 'claude', 'gemini', 'grok']);


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

// 🔒 Catálogo fallback — TODAS as APIs de IA + integrações Tier 1
const FALLBACK_PROVIDERS: Provider[] = [
  // ===== IA — Chat / LLM =====
  { id: 'openai',       display_name: 'OpenAI',            color: '#10a37f', icon: 'O',  scopes: 'chat completions embeddings', auth_type: 'api_key', tier: 1, web_oauth: true },
  { id: 'claude',       display_name: 'Anthropic Claude',  color: '#d97706', icon: 'C',  scopes: 'messages',      auth_type: 'api_key', tier: 1, web_oauth: true },
  { id: 'gemini',       display_name: 'Google Gemini',     color: '#4285f4', icon: 'G',  scopes: 'generateContent', auth_type: 'api_key', tier: 1, web_oauth: true },
  { id: 'grok',         display_name: 'Grok / xAI',        color: '#000000', icon: '𝕏',  scopes: 'chat',          auth_type: 'api_key', tier: 1, web_oauth: true },
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

  // ===== IA — Imagem / Vídeo / Áudio =====
  { id: 'replicate',    display_name: 'Replicate',         color: '#000000', icon: 'R',  scopes: 'predictions',   auth_type: 'api_key', tier: 1 },
  { id: 'stability',    display_name: 'Stability AI',      color: '#ff4d8d', icon: 'SD', scopes: 'generation',    auth_type: 'api_key', tier: 2 },
  { id: 'fal',          display_name: 'fal.ai',            color: '#7c3aed', icon: 'F',  scopes: 'run',           auth_type: 'api_key', tier: 2 },
  { id: 'ideogram',     display_name: 'Ideogram',          color: '#ec4899', icon: 'I',  scopes: 'generate',      auth_type: 'api_key', tier: 2 },
  { id: 'leonardo',     display_name: 'Leonardo AI',       color: '#f59e0b', icon: 'Le', scopes: 'generations',   auth_type: 'api_key', tier: 3 },
  { id: 'recraft',      display_name: 'Recraft',           color: '#111827', icon: 'Rc', scopes: 'images',        auth_type: 'api_key', tier: 3 },
  { id: 'runway',       display_name: 'Runway',            color: '#000000', icon: 'Rw', scopes: 'video',         auth_type: 'api_key', tier: 2 },
  { id: 'luma',         display_name: 'Luma Dream Machine',color: '#0ea5e9', icon: 'Lu', scopes: 'video',         auth_type: 'api_key', tier: 3 },
  { id: 'kling',        display_name: 'Kling AI',          color: '#8b5cf6', icon: 'Kl', scopes: 'video',         auth_type: 'api_key', tier: 3 },
  { id: 'pika',         display_name: 'Pika Labs',         color: '#f43f5e', icon: 'Pk', scopes: 'video',         auth_type: 'api_key', tier: 3 },
  { id: 'elevenlabs',   display_name: 'ElevenLabs',        color: '#000000', icon: '11', scopes: 'tts voices',    auth_type: 'api_key', tier: 1 },
  { id: 'suno',         display_name: 'Suno',              color: '#111827', icon: 'Su', scopes: 'music',         auth_type: 'api_key', tier: 3 },
  { id: 'assemblyai',   display_name: 'AssemblyAI',        color: '#2563eb', icon: 'AA', scopes: 'transcribe',    auth_type: 'api_key', tier: 3 },
  { id: 'deepgram',     display_name: 'Deepgram',          color: '#13ef95', icon: 'Dg', scopes: 'transcribe',    auth_type: 'api_key', tier: 3 },

  // ===== Integrações / Infra =====
  { id: 'notion',       display_name: 'Notion',            color: '#000000', icon: 'N',  scopes: 'read.content update.content', auth_type: 'oauth',  tier: 1 },
  { id: 'github',       display_name: 'GitHub',            color: '#24292f', icon: 'GH', scopes: 'repo read:user', auth_type: 'oauth', tier: 1 },
  { id: 'gdrive',       display_name: 'Google Drive',      color: '#1a73e8', icon: 'D',  scopes: 'drive.file drive.readonly', auth_type: 'oauth', tier: 1 },
  { id: 'supabase',     display_name: 'Supabase',          color: '#3ecf8e', icon: 'S',  scopes: 'management',    auth_type: 'api_key', tier: 1 },
  { id: 'cloudflare',   display_name: 'Cloudflare',        color: '#f38020', icon: 'CF', scopes: 'zone dns workers', auth_type: 'api_key', tier: 1 },
  { id: 'telegram',     display_name: 'Telegram Bot',      color: '#229ed9', icon: 'TG', scopes: 'bot',           auth_type: 'api_key', tier: 1 },
  { id: 'lovable',      display_name: 'Lovable',           color: '#10b981', icon: 'L',  scopes: 'projects',      auth_type: 'oauth',   tier: 1 },
  { id: 'efi',          display_name: 'EFI Pay',           color: '#00a868', icon: 'E',  scopes: 'pix cobranças', auth_type: 'api_key', tier: 2 },
  { id: 'iseek',        display_name: 'iSeek',             color: '#7c3aed', icon: 'iS', scopes: 'consultas',     auth_type: 'api_key', tier: 2 },
  { id: 'consultas',    display_name: 'Consultas',         color: '#1f2937', icon: 'CQ', scopes: 'consultas',     auth_type: 'api_key', tier: 2 },
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

    let missing = false;
    try {
      const cr = await supabase.from('oauth_connections').select('id, provider_id, expires_at, status, account_label').eq('user_id', uid);
      if (cr.error) throw cr.error;
      if (cr.data) c = cr.data as Connection[];
    } catch (e: any) {
      c = [];
      const msg = e?.message ?? '';
      if (/relation.*does not exist|not.?found|schema cache|PGRST|404/i.test(msg) || e?.code === 'PGRST205' || e?.code === '42P01') {
        // tabela ainda não criada — modo dev, silencia
        missing = true;
      } else {
        setLoadError(msg || 'erro ao carregar conexões');
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
    // Provedores com dupla via (API oficial + login web) abrem o seletor
    if (p.web_oauth && (p.auth_type === 'api_key' || !p.auth_type)) {
      setChooseProvider(p);
      return;
    }
    if (p.auth_type === 'api_key') {
      setDialogProvider(p);
      return;
    }
    startOAuth(p);
  }

  function startOAuth(p: Provider) {
    const back = window.location.href;
    window.location.href = `${BROKER_BASE}/oauth/${p.id}/start?user_id=${userId}&redirect_to=${encodeURIComponent(back)}`;
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
          <div className="h-3 w-80 bg-muted/30 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted/30 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 bg-muted/30 rounded animate-pulse" />
              </div>
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
                Tokens cifrados no HUB Supabase · expiração 30d · logs no Hermes
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
          <p className="text-xs text-muted-foreground border-l-2 border-primary/50 pl-2 mt-2">
            🛠️ Backend: Supabase HUB (VPS) + Edge Functions <code className="font-mono text-primary">get-token</code> / <code className="font-mono text-primary">keys/store</code>
          </p>
          {tableMissing && (
            <p className="text-[11px] text-muted-foreground/80 border-l-2 border-muted-foreground/40 pl-2 italic">
              ℹ️ modo dev: tabela <code className="font-mono">oauth_connections</code> ainda não criada no HUB — as conexões salvas não aparecem até a migration rodar.
            </p>
          )}

        </CardHeader>

        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-12 space-y-3 border border-dashed border-border rounded-lg">
              <div className="text-4xl">📭</div>
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
                    className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-4 space-y-3 transition-all hover:border-primary/50 hover:shadow-3d-primary hover:-translate-y-0.5"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }}
                    />
                    {p.tier && (
                      <div className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-background/80 border border-border text-muted-foreground">
                        T{p.tier}
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white text-base font-semibold shadow-3d"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate pr-6">{p.display_name}</div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {p.auth_type === 'api_key' && (
                            <Badge className="text-[10px] py-0 px-1.5 bg-secondary text-secondary-foreground border-border">🔑 API KEY</Badge>
                          )}
                          {p.auth_type === 'oauth' && (
                            <Badge className="text-[10px] py-0 px-1.5 bg-primary/15 text-primary border-primary/40">🔐 OAUTH</Badge>
                          )}
                          {p.web_oauth && (
                            <Badge className="text-[10px] py-0 px-1.5 bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/40">🌐 WEB</Badge>
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
                          onClick={() => disconnect(conn.id, p.display_name)}
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
          )}
        </CardContent>
      </Card>

      <ApiKeyDialog
        open={!!dialogProvider}
        providerName={dialogProvider?.display_name ?? ''}
        providerColor={dialogProvider?.color ?? '#98C93C'}
        onClose={() => setDialogProvider(null)}
        onConfirm={(key) => dialogProvider ? saveApiKey(dialogProvider, key) : Promise.resolve()}
      />
    </>
  );
}

