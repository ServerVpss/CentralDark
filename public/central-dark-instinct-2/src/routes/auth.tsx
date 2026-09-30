import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  component: PaginaAcesso,
  head: () => ({
    meta: [
      { title: "Acesso administrativo — CentralDark" },
      { name: "description", content: "Acesso protegido ao cockpit administrativo CentralDark." },
      { property: "og:title", content: "Acesso administrativo — CentralDark" },
      { property: "og:description", content: "Entrada protegida da sala de controle CentralDark." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function PaginaAcesso() {
  const navegar = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // Callback OAuth / confirmação de e-mail: quando a sessão existir, segue para a sala.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navegar({ to: "/sala-controle" });
    });
    const { data } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (evento === "SIGNED_IN" && sessao) void navegar({ to: "/sala-controle" });
    });
    return () => data.subscription.unsubscribe();
  }, [navegar]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setOcupado(true);
    setErro(null);
    setAviso(null);

    if (modo === "criar") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setOcupado(false);
      if (error) {
        setErro(error.message);
        return;
      }
      if (!data.session) {
        setAviso(
          "Conta criada. Confirme o e-mail que acabamos de enviar para você e depois entre.",
        );
        setModo("entrar");
        return;
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setOcupado(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
  }

  async function esqueci() {
    setErro(null);
    setAviso(null);
    if (!email) {
      setErro("Digite seu e-mail acima primeiro.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setErro(error.message);
      return;
    }
    setAviso("Enviamos um link para criar uma nova senha.");
  }

  async function entrarGoogle() {
    setOcupado(true);
    setErro(null);
    setAviso(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErro("Não foi possível concluir o acesso com Google.");
      setOcupado(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 pb-44 pt-16">
      <section className="panel-gold w-full max-w-md p-7">
        <LockKeyhole className="size-6 text-gold" />
        <p className="mt-5 font-mono text-[10px] tracking-[0.2em] text-gold uppercase">
          ACESSO ADMINISTRATIVO
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {modo === "entrar" ? "Entrar no cockpit" : "Criar conta"}
        </h1>

        <div
          className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-border p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={modo === "entrar"}
            onClick={() => {
              setModo("entrar");
              setErro(null);
            }}
            className={`rounded-md px-3 py-2 text-sm ${modo === "entrar" ? "bg-gold/15 text-gold" : "text-muted-foreground"}`}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === "criar"}
            onClick={() => {
              setModo("criar");
              setErro(null);
            }}
            className={`rounded-md px-3 py-2 text-sm ${modo === "criar" ? "bg-gold/15 text-gold" : "text-muted-foreground"}`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            aria-label="E-mail"
          />
          <Input
            type="password"
            required
            minLength={6}
            autoComplete={modo === "criar" ? "new-password" : "current-password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha (mínimo 6 caracteres)"
            aria-label="Senha"
          />
          {erro ? (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          ) : null}
          {aviso ? (
            <p role="status" className="text-sm text-neon-green">
              {aviso}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={ocupado}>
            {ocupado ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta e entrar"}
          </Button>
        </form>
        {modo === "entrar" ? (
          <button
            type="button"
            onClick={esqueci}
            className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Esqueci minha senha
          </button>
        ) : null}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={entrarGoogle}
          disabled={ocupado}
        >
          Continuar com Google
        </Button>
      </section>
    </main>
  );
}
