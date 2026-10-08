import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  component: Redefinir,
  head: () => ({
    meta: [
      { title: "Redefinir senha — CentralDark" },
      { name: "description", content: "Defina uma nova senha para o acesso CentralDark." },
      { property: "og:title", content: "Redefinir senha — CentralDark" },
      { property: "og:description", content: "Recuperação de acesso da CentralDark." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Redefinir() {
  const navegar = useNavigate();
  const [senha, setSenha] = useState("");
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    const { data } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") setPronto(true);
    });
    async function prepararRecuperacao() {
      const codigo = new URLSearchParams(window.location.search).get("code");
      if (codigo) {
        const { error } = await supabase.auth.exchangeCodeForSession(codigo);
        if (error) {
          if (ativo) setErro("O link de recuperação expirou ou já foi utilizado.");
          return;
        }
      }
      const { data: sessao } = await supabase.auth.getSession();
      if (ativo && (sessao.session || window.location.hash.includes("type=recovery"))) {
        setPronto(true);
      }
    }
    void prepararRecuperacao();
    return () => {
      ativo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro(error.message);
      return;
    }
    await navegar({ to: "/sala-controle" });
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 pb-44 pt-16">
      <section className="panel-gold w-full max-w-md p-7">
        <KeyRound className="size-6 text-gold" />
        <h1 className="mt-4 text-3xl font-semibold">Nova senha</h1>
        {!pronto ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Abra esta página pelo link enviado ao seu e-mail.
          </p>
        ) : (
          <form onSubmit={salvar} className="mt-6 space-y-4">
            <Input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Nova senha"
              aria-label="Nova senha"
            />
            {erro ? (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Salvar nova senha
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
