import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';
import { useToast } from '@/components/Toast';
import { hubAuth } from '@/integrations/supabase/hub-client';
import { trackAction, logButton } from '@/lib/buttonLog';

type HybridMode = 'public-admin' | 'tunnel-admin' | 'both-admin';
type EmailMethod = 'password' | 'code';

const HYBRID_MODE_STORAGE_KEY = 'centraldark.hybridMcpAdmin.mode';

function loadHybridMode(): HybridMode {
  try {
    const value = localStorage.getItem(HYBRID_MODE_STORAGE_KEY);
    if (value === 'public-admin' || value === 'tunnel-admin' || value === 'both-admin') return value;
  } catch {
    // storage indisponível: mantém o modo seguro de preferência visual.
  }
  return 'both-admin';
}

// Página de login do HUB — uma superfície humana para N capacidades da Casa.
// A escolha de rota NÃO concede admin por si só: escopo/autoridade continuam
// sendo validados pelo backend/MCP. Toda ação passa pelo buttonLog.
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [emailMethod, setEmailMethod] = useState<EmailMethod>('code');
  const [codeSent, setCodeSent] = useState(false);
  const [hybridMode, setHybridMode] = useState<HybridMode>(() => loadHybridMode());
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    hubAuth.auth.getSession().then(({ data }) => {
      if (data.session) {
        logButton('login.session-existente', {
          user: data.session.user.email,
          hybridMode: loadHybridMode(),
        });
        window.location.replace('/');
      }
    });
  }, []);

  function persistHybridMode() {
    try { localStorage.setItem(HYBRID_MODE_STORAGE_KEY, hybridMode); } catch { /* noop */ }
    logButton('login.hybrid-mode-selected', { hybridMode });
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      persistHybridMode();
      await trackAction('login.email-password', async () => {
        const { data, error } = await hubAuth.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { status: 200, user: data.user?.email, hybridMode };
      }, { detail: { email, hybridMode } });
      toast.info('🟢 login OK — abrindo HUB');
      window.location.replace('/');
    } catch (e: any) {
      toast.info(`🔴 ${e?.message ?? 'falha no login'}`);
    } finally {
      setBusy(false);
    }
  }

  async function sendCode() {
    if (!email.trim()) {
      toast.info('🟡 informe o email primeiro');
      return;
    }
    setBusy(true);
    try {
      persistHybridMode();
      await trackAction('login.email-code-send', async () => {
        const { error } = await hubAuth.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false },
        });
        if (error) throw error;
        return { status: 200, email, hybridMode };
      }, { detail: { email, hybridMode } });
      setCodeSent(true);
      toast.info('🟢 código solicitado — confira seu email');
    } catch (e: any) {
      toast.info(`🔴 código: ${e?.message ?? 'falha ao solicitar'}`);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.info('🟡 informe o código');
      return;
    }
    setBusy(true);
    try {
      persistHybridMode();
      await trackAction('login.email-code-verify', async () => {
        const { data, error } = await hubAuth.auth.verifyOtp({
          email: email.trim(),
          token: code.trim(),
          type: 'email',
        });
        if (error) throw error;
        return { status: 200, user: data.user?.email, hybridMode };
      }, { detail: { email, hybridMode } });
      toast.info('🟢 código confirmado — abrindo HUB');
      window.location.replace('/');
    } catch (e: any) {
      toast.info(`🔴 código inválido/expirado: ${e?.message ?? 'falha na verificação'}`);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      persistHybridMode();
      await trackAction('login.google-oauth', async () => {
        const { error } = await hubAuth.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        return { status: 200, hybridMode };
      }, { detail: { hybridMode } });
    } catch (e: any) {
      toast.info(`🔴 Google OAuth: ${e?.message ?? 'falha'}`);
    }
  }

  const routeOptions: Array<{ value: HybridMode; title: string; detail: string }> = [
    { value: 'public-admin', title: '🌐 Público', detail: 'MCP público' },
    { value: 'tunnel-admin', title: '🏠 Casa', detail: 'túnel / RDC' },
    { value: 'both-admin', title: '🧬 Os dois', detail: 'público + Casa' },
  ];

  return (
    <div className="min-h-screen w-full grid md:grid-cols-2 bg-background">
      <div className="relative hidden md:flex flex-col justify-between overflow-hidden p-10 border-r border-border/60">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.25), transparent 55%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.15), transparent 60%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center text-primary-foreground font-bold shadow-3d-primary">
              CD
            </div>
            <span className="font-semibold tracking-tight">CentralDark HUB</span>
          </div>
        </div>

        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Uma entrada. <span className="text-gradient-emerald">A Casa por baixo.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Você entra uma vez no HUB. MCP público, túnel local, providers e ferramentas continuam com credenciais e escopos separados por baixo.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[11px] px-2 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary">
              🔐 uma sessão humana
            </span>
            <span className="text-[11px] px-2 py-1 rounded-full border border-border bg-card">
              🧬 N capacidades
            </span>
            <span className="text-[11px] px-2 py-1 rounded-full border border-border bg-card">
              ⚖️ escopo continua obrigatório
            </span>
          </div>
        </div>

        <div className="relative text-[11px] text-muted-foreground">
          ONE LOGIN != ONE SECRET · CentralDark HUB
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="card-premium w-full max-w-md p-8 space-y-6 border-border/60">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Entrar na CentralDark</h2>
            <p className="text-sm text-muted-foreground">
              Um login para abrir a Casa. Escolha a rota e depois autentique por Google, código ou senha.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rota depois do login</Label>
            <div className="grid grid-cols-3 gap-2">
              {routeOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setHybridMode(item.value)}
                  className={`rounded-lg border px-2 py-3 text-left transition ${hybridMode === item.value ? 'border-primary bg-primary/10' : 'border-border bg-card/60 hover:border-primary/40'}`}
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{item.detail}</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              A escolha pede a rota; não concede privilégio admin. O backend ainda valida sessão, escopo e política.
            </p>
          </div>

          <Button
            type="button"
            onClick={google}
            variant="outline"
            className="w-full h-11 gap-2 hover:border-primary/50"
          >
            <span className="text-base">🇬</span> Continuar com Google
          </Button>

          <div className="flex items-center gap-3 text-[11px] uppercase text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            ou com email
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={emailMethod === 'code' ? 'default' : 'outline'}
              onClick={() => setEmailMethod('code')}
            >
              Código
            </Button>
            <Button
              type="button"
              variant={emailMethod === 'password' ? 'default' : 'outline'}
              onClick={() => setEmailMethod('password')}
            >
              Senha
            </Button>
          </div>

          {emailMethod === 'code' ? (
            <form onSubmit={verifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-code" className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                <Input
                  id="email-code"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@centralldark.com"
                  className="h-11"
                />
              </div>

              {!codeSent ? (
                <Button type="button" disabled={busy} onClick={sendCode} className="w-full h-11 gradient-emerald text-primary-foreground border-0 hover:brightness-95">
                  {busy ? 'enviando...' : 'Receber código'}
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-code" className="text-xs uppercase tracking-wide text-muted-foreground">Código</Label>
                      <button type="button" onClick={sendCode} disabled={busy} className="text-[11px] text-primary hover:underline">reenviar</button>
                    </div>
                    <Input
                      id="login-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
                      placeholder="código do email"
                      className="h-11 font-mono tracking-[0.2em]"
                    />
                  </div>
                  <Button type="submit" disabled={busy} className="w-full h-11 gradient-emerald text-primary-foreground border-0 hover:brightness-95">
                    {busy ? 'confirmando...' : 'Confirmar código'}
                  </Button>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={onPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-password" className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                <Input
                  id="email-password"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@centralldark.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw" className="text-xs uppercase tracking-wide text-muted-foreground">Senha</Label>
                  <a href="#" className="text-[11px] text-primary hover:underline">esqueci</a>
                </div>
                <Input
                  id="pw"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 font-mono"
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-11 gradient-emerald text-primary-foreground border-0 hover:brightness-95">
                {busy ? '🚀 entrando...' : 'Entrar'}
              </Button>
            </form>
          )}

          <p className="text-[11px] text-center text-muted-foreground">
            Login humano único; credenciais MCP, túnel e providers permanecem separadas e nunca aparecem nesta tela.
          </p>
        </Card>
      </div>
    </div>
  );
}
