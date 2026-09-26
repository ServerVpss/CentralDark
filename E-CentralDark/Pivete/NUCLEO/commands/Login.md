# COMANDO - Login.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot\src\pages\Login.tsx
**SHA:** 0e702b2bd55038de
**Timestamp:** 2026-08-26T19:31:02.756503
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { logService } from "@/services/logService";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    let finalEmail = identifier.trim();
    if (!finalEmail.includes("@")) {
      finalEmail = `${finalEmail}@wabot.local`;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: finalEmail, 
        password 
      });
      
      if (error) {
        await logService.error("auth.login.failure", { identifier, error: error.message });
        toast.error("Acesso negado", { description: "Credenciais inválidas ou conta não autorizada." });
        setIsLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      await logService.info("auth.login.success", { user_id: data.user.id, role: memberData?.role });
      toast.success("Autenticação autorizada!");
      navigate("/portal");

    } catch (error: any) {
      toast.error("Erro de conexão", { description: "Não foi possível contatar o servidor de segurança." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: "https://multizap.dev/auth/reset-password",
      });

      if (error) {
        toast.error("Erro ao enviar", { description: error.message });
      } else {
        setResetSent(true);
        toast.success("E-mail enviado!", { description: "Verifique sua caixa de entrada." });
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden" 
      style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="w-full max-w-sm space-y-6 bg-card/60 p-8 rounded-xl backdrop-blur-md relative z-10 glow-border spinning-ring">
        
        {/* LOGO */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24 flex items-center justify-center group">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-svg-draw" style={{ strokeDasharray: 70, strokeDashoffset: 70 }} />
              <path d="M3 8l9 5 9-5M12 13v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-svg-draw-delayed" style={{ strokeDasharray: 50, strokeDashoffset: 50 }} />
              <circle cx="12" cy="13" r="0.5" fill="currentColor" className="text-primary animate-ping" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl tracking-[0.2em] text-foreground uppercase">MultiZap</h1>
            <h2 className="font-mono text-[9px] text-primary tracking-[0.4em] uppercase opacity-70 mt-1">Terminal de Acesso</h2>
          </div>
        </div>

        {showReset ? (
          /* RESET PASSWORD */
          <div className="space-y-4 mt-4">
            <button onClick={() => { setShowReset(false); setResetSent(false); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3 h-3" /> Voltar ao login
            </button>

            {resetSent ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">📧</span>
         
```

---

# COMANDO - Login.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\components\Login.tsx
**SHA:** 55b8478a46cecea6
**Timestamp:** 2026-08-26T19:33:40.153248
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import React, { useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: FC = () => {
  const navigate = useNavigate();
  const onLogin = () => navigate('/app');
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('test@123');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd validate here. For now, we just call onLogin.
    onLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="material-symbols-outlined">chat_bubble</span>
          <h2>NexChat</h2>
        </div>

        <div className="auth-header">
          <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Join our community of 2k+ users today.' : 'Please enter your details to sign in.'}</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-dark-surface-light p-1 rounded-xl mb-8">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-primary text-background-dark' : 'text-dark-text-muted hover:text-white'}`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-primary text-background-dark' : 'text-dark-text-muted hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="social-auth">
          <button onClick={onLogin} className="social-btn">
            <span>Google</span>
          </button>
          <button onClick={onLogin} className="social-btn">
            <span>Apple</span>
          </button>
        </div>

        <div className="auth-divider">Or continue with</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isSignUp && (
            <div className="flex justify-end mb-2">
              <a href="#" className="text-sm font-bold text-primary hover:underline">Forgot Password?</a>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full py-4 mt-2">
            <span>{isSignUp ? 'Get Started' : 'Sign In'}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
              {isSignUp ? 'Log in here' : 'Create one now'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

```