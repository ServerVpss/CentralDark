import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/shared/auth/AuthProvider";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Rocket, Mail, Lock, User, Loader2, Lock as LockIcon } from "lucide-react";
import { z } from "zod";
import { useSystemSetting } from "@/shared/hooks/useSystemSetting";
import { toast } from "sonner";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres");

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get("next");
  const destino = nextParam && nextParam.startsWith("/") ? nextParam : "/portal";
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuthContext();
  const { value: signupSetting } = useSystemSetting<{ enabled: boolean }>(
    "signup_enabled",
    { enabled: false }
  );
  const signupEnabled = !!signupSetting?.enabled;

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Formulário de login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Formulário de cadastro
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupErrors, setSignupErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(destino, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validateLogin = () => {
    const errors: { email?: string; password?: string } = {};
    try {
      emailSchema.parse(loginEmail);
    } catch (e) {
      if (e instanceof z.ZodError) errors.email = e.errors[0].message;
    }
    try {
      passwordSchema.parse(loginPassword);
    } catch (e) {
      if (e instanceof z.ZodError) errors.password = e.errors[0].message;
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors: { email?: string; password?: string; name?: string } = {};
    try {
      emailSchema.parse(signupEmail);
    } catch (e) {
      if (e instanceof z.ZodError) errors.email = e.errors[0].message;
    }
    try {
      passwordSchema.parse(signupPassword);
    } catch (e) {
      if (e instanceof z.ZodError) errors.password = e.errors[0].message;
    }
    if (!signupName.trim()) errors.name = "Nome é obrigatório";
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (!error) navigate(destino, { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEnabled) {
      toast.error("Cadastros estão temporariamente desligados pelo administrador.");
      return;
    }
    if (!validateSignup()) return;
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    if (!error) navigate(destino, { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Névoa esmeralda no topo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />
      {/* Grid de pontinhos sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-5 py-10 md:py-16">
        {/* Cabeçalho estilo Mega Painel */}
        <div className="mb-8 md:mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-primary mb-5">
            CENTRALDARK INTELLIGENCE
          </span>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary shadow-3d-primary shrink-0">
              <Rocket className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
              Bem-vindo de volta
            </h1>
          </div>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl">
            Acesse o painel pra gerenciar seus bots, automações e o ecossistema CentralDark.
          </p>
        </div>

        {/* Grid: formulário + card de status */}
        <div className="grid md:grid-cols-[1fr_320px] gap-5">
          {/* Card do formulário */}
          <div className="relative rounded-2xl border border-border/60 bg-card shadow-3d overflow-hidden">
            {/* Halo esmeralda no canto */}
            <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.25),transparent_70%)]" />

            <div className="relative p-6 md:p-8">
              <Tabs value={signupEnabled ? activeTab : "login"} onValueChange={setActiveTab}>
                <TabsList className={`grid w-full mb-6 ${signupEnabled ? "grid-cols-2" : "grid-cols-1"}`}>
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  {signupEnabled && <TabsTrigger value="signup">Cadastrar</TabsTrigger>}
                </TabsList>

                {!signupEnabled && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                    <LockIcon className="h-4 w-4 shrink-0" />
                    <span>Cadastros de novas contas estão temporariamente desligados.</span>
                  </div>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {loginErrors.email && (
                        <p className="text-sm text-destructive">{loginErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {loginErrors.password && (
                        <p className="text-sm text-destructive">{loginErrors.password}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full shadow-3d-primary" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {signupEnabled && (
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Nome completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Seu nome"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {signupErrors.name && (
                          <p className="text-sm text-destructive">{signupErrors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {signupErrors.email && (
                          <p className="text-sm text-destructive">{signupErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {signupErrors.password && (
                          <p className="text-sm text-destructive">{signupErrors.password}</p>
                        )}
                      </div>

                      <Button type="submit" className="w-full shadow-3d-primary" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          "Criar conta"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>

          {/* Card "Sistema respirando" */}
          <div className="relative rounded-2xl border border-border/60 bg-card shadow-3d overflow-hidden">
            <div className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.25),transparent_70%)]" />

            <div className="relative p-6 flex flex-col gap-5 h-full">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <span className="text-sm font-semibold text-foreground">Sistema respirando</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                    MCP Público
                  </p>
                  <p className="text-2xl font-bold text-foreground leading-none">ONLINE</p>
                  <p className="text-[11px] text-muted-foreground mt-1">v0.4.0</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                    Tools
                  </p>
                  <p className="text-2xl font-bold text-foreground leading-none">95</p>
                  <p className="text-[11px] text-muted-foreground mt-1">conectadas</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border/60">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">
                  Progresso geral
                </p>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-foreground leading-none">94%</span>
                  <span className="text-[11px] text-muted-foreground">do roadmap</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
