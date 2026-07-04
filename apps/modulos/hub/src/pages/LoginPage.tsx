import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';
import { useToast } from '@/components/Toast';

// Página de login — SOMENTE UI. Lógica de auth fica no HUB Supabase (VPS).
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // stub — plugar no HUB depois
    setTimeout(() => {
      setBusy(false);
      toast.info('🔌 login será plugado no HUB Supabase (VPS) — frontend pronto');
    }, 600);
  }

  function google() {
    toast.info('🔌 Google OAuth: configurar no HUB Supabase');
  }

  return (
    <div className="min-h-screen w-full grid md:grid-cols-2 bg-background">
      {/* Hero esquerdo */}
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
            Bem-vindo ao <span className="text-gradient-emerald">Arsenal</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Um HUB pra reger todos os módulos — Grok, Claude, Notion, GitHub, Supabase.
            Tokens cifrados, logs no Hermes, expiração 30d.
          </p>
          <div className="flex gap-2 pt-2">
            <span className="text-[11px] px-2 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary">
              🔐 tokens no HUB
            </span>
            <span className="text-[11px] px-2 py-1 rounded-full border border-border bg-card">
              🚀 edge functions
            </span>
          </div>
        </div>

        <div className="relative text-[11px] text-muted-foreground">
          v2 · dark-first · emerald · Geist
        </div>
      </div>

      {/* Form direito */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="card-premium w-full max-w-md p-8 space-y-6 border-border/60">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Entrar</h2>
            <p className="text-sm text-muted-foreground">
              Acesse seu HUB com email e senha ou continue com Google.
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

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
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
                <Label htmlFor="pw" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Senha
                </Label>
                <a href="#" className="text-[11px] text-primary hover:underline">
                  esqueci
                </a>
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

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11 gradient-emerald text-primary-foreground border-0 hover:opacity-90"
            >
              {busy ? '🚀 entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-[11px] text-center text-muted-foreground">
            Sem conta? <a href="#" className="text-primary hover:underline">Fale com o admin</a>
          </p>
        </Card>
      </div>
    </div>
  );
}
