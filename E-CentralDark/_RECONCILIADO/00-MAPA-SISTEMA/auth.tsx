import { createFileRoute, useNavigate, Link, ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MessageSquare, ArrowLeft, Loader2, Mail, Lock } from "lucide-react";
import { IntroAnimation } from "@/components/landing/IntroAnimation";
import { useIntroConfig } from "@/hooks/use-intro-config";
import { useHostBranding } from "@/hooks/use-host-branding";
import { PoweredByMultiZap } from "@/components/branding/PoweredByMultiZap";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const intro = useIntroConfig();
  const branding = useHostBranding();
  const isWhiteLabel = !!branding?.white_label_active;
  const brandName = isWhiteLabel ? (branding?.brand_name || branding?.workspace_name || "Atendimento") : "MultiZap";
  const tagline = isWhiteLabel ? "Atendimento" : "Atendimento Profissional";
  const logoUrl = isWhiteLabel ? branding?.logo_url : null;
  const bgStyle = isWhiteLabel && branding?.login_background_url
    ? { backgroundImage: `url(${branding.login_background_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;
  const accent = isWhiteLabel && branding?.primary_color ? { color: branding.primary_color } : undefined;

  const [signupEnabled, setSignupEnabled] = useState(true);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/app" });
  }, [session, loading, navigate]);

  useEffect(() => {
    supabase.rpc("get_master_public_settings").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row && typeof row.public_signup_enabled === "boolean") {
        setSignupEnabled(row.public_signup_enabled);
      }
    });
  }, []);

  // Se estiver no modo redefinir senha, mostra só o reset
  if (showReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12" style={bgStyle}>
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-10 w-auto max-w-[160px] object-contain" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
            )}
            <div className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight">{brandName}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary" style={accent}>
                {tagline}
              </span>
            </div>
          </Link>
          <div className="rounded-xl border bg-card/95 p-6 shadow-sm backdrop-blur">
            <ResetPasswordForm onBack={() => setShowReset(false)} />
          </div>
          <PoweredByMultiZap />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12" style={bgStyle}>
      {intro.introEnabled && intro.showOnApp && !isWhiteLabel && (
        <ClientOnly fallback={null}>
          <IntroAnimation brandName="MultiZap" durationMs={intro.durationMs} storageKey="auth-intro-seen" />
        </ClientOnly>
      )}
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-10 w-auto max-w-[160px] object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
          )}
          <div className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">{brandName}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary" style={accent}>
              {tagline}
            </span>
          </div>
        </Link>

        <div className="rounded-xl border bg-card/95 p-6 shadow-sm backdrop-blur">
          <Tabs defaultValue="login">
            <TabsList className={`grid w-full ${signupEnabled ? "grid-cols-2" : "grid-cols-1"}`}>
              <TabsTrigger value="login">Entrar</TabsTrigger>
              {signupEnabled && <TabsTrigger value="signup">Criar conta</TabsTrigger>}
            </TabsList>
            <TabsContent value="login"><LoginForm onResetPassword={() => setShowReset(true)} /></TabsContent>
            {signupEnabled ? (
              <TabsContent value="signup"><SignupForm /></TabsContent>
            ) : (
              <p className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                Cadastro público indisponível. Solicite um convite ao administrador.
              </p>
            )}
          </Tabs>
        </div>

        <PoweredByMultiZap />
      </div>
    </div>
  );
}

/** Formulário de redefinição de senha (segue o mesmo padrão do Bot) */
function ResetPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "https://multizap.dev/auth/reset-password",
    });
    setBusy(false);
    if (error) {
      toast.error("Erro ao enviar", { description: error.message });
    } else {
      setSent(true);
      toast.success("E-mail enviado!", { description: "Verifique sua caixa de entrada." });
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-3 h-3" /> Voltar ao login
      </button>

      {sent ? (
        <div className="text-center space-y-3 py-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl">📧</span>
          </div>
          <p className="text-sm font-medium">E-mail enviado!</p>
          <p className="text-xs text-muted-foreground">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-xs text-muted-foreground">Digite seu e-mail para receber o link de redefinição de senha.</p>
          <div className="space-y-2">
            <Label htmlFor="reset-email">E-mail</Label>
            <Input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</> : "Enviar Link"}
          </Button>
        </form>
      )}
    </div>
  );
}

function LoginForm({ onResetPassword }: { onResetPassword: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "E-mail ou senha incorretos"
        : error.message);
      return;
    }
    toast.success("Bem-vindo de volta");
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
          <Input id="login-email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} className="pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-pw">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
          <Input id="login-pw" type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)} className="pl-10" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Entrando..." : "Entrar"}
      </Button>
      <button type="button" onClick={onResetPassword}
        className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
        Esqueceu a senha?
      </button>
    </form>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Senha deve ter ao menos 6 caracteres");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: name, workspace_name: workspace || "Minha Empresa" },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Conta criada! Verifique seu e-mail para confirmar.");
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="su-name">Seu nome</Label>
        <Input id="su-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-ws">Nome da empresa</Label>
        <Input id="su-ws" placeholder="Minha Empresa" value={workspace} onChange={(e) => setWorkspace(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-email">E-mail</Label>
        <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-pw">Senha</Label>
        <Input id="su-pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Criando..." : "Criar conta"}
      </Button>
    </form>
  );
}