# COMANDO - auth.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\routes\auth.tsx
**SHA:** ce4dd09a2d654c29
**Timestamp:** 2026-08-26T19:33:58.385249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
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
              {signupEnabled && <TabsTrigger value="signup">Criar conta</TabsTr
```