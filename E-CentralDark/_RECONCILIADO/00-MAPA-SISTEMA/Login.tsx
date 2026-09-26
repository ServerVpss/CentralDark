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
                </div>
                <p className="text-sm text-foreground font-medium">E-mail enviado!</p>
                <p className="text-xs text-muted-foreground">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-muted-foreground">Digite seu e-mail para receber o link de redefinição de senha.</p>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 bg-background/40 border-border focus:border-primary/50 transition-all font-mono h-12 rounded-xl shadow-inner text-sm"
                    required
                  />
                </div>
                <Button disabled={isLoading} type="submit" className="w-full h-12 font-black tracking-widest uppercase gap-2 shadow-lg shadow-primary/20 rounded-xl">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar Link"}
                </Button>
              </form>
            )}
          </div>
        ) : (
          /* LOGIN */
          <form onSubmit={handleAuth} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold ml-1">Identificação</label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="text" 
                  placeholder="E-mail ou Usuário" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 bg-background/40 border-border focus:border-primary/50 transition-all font-mono h-12 rounded-xl shadow-inner text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/40 border-border focus:border-primary/50 transition-all font-mono h-12 rounded-xl shadow-inner"
                  required
                />
              </div>
            </div>
            <Button disabled={isLoading} type="submit" className="w-full h-12 font-black tracking-widest uppercase gap-2 mt-4 shadow-lg shadow-primary/20 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar no Sistema"}
            </Button>

            <button type="button" onClick={() => setShowReset(true)} className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors mt-2">
              Esqueceu a senha?
            </button>
          </form>
        )}

        <div className="pt-6 text-center border-t border-border/10">
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
            Protocol 2.7.0 // Independent Node Active
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes svg-draw {
          0% { stroke-dashoffset: 70; opacity: 0; }
          20% { opacity: 1; }
          50% { stroke-dashoffset: 0; }
          80% { opacity: 1; }
          100% { stroke-dashoffset: -70; opacity: 0; }
        }
        .animate-svg-draw { animation: svg-draw 4s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-svg-draw-delayed { animation: svg-draw 4s infinite cubic-bezier(0.4, 0, 0.2, 1); animation-delay: 1s; }
      `}} />
    </div>
  );
}