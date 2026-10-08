import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { CockpitShell } from "@/components/central/CockpitShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { verificarAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/sala-controle")({
  component: SalaControle,
  head: () => ({
    meta: [
      { title: "Cockpit CentralDark — Sala de Controle" },
      { name: "description", content: "Sala autenticada de controle e prova da CentralDark." },
      { property: "og:title", content: "Cockpit CentralDark — Sala de Controle" },
      {
        property: "og:description",
        content: "Painel autenticado com estado vivo, conexões e Hermes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SalaControle() {
  const verificar = useServerFn(verificarAdmin);
  const q = useQuery({
    queryKey: ["admin", "verificacao"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) throw new Error("Sessão Supabase ausente ou expirada.");
      return verificar({ headers: { Authorization: `Bearer ${token}` } });
    },
    retry: false,
  });

  if (q.isPending)
    return (
      <main className="grid min-h-dvh place-items-center">
        <p className="font-mono text-xs text-muted-foreground">Verificando permissão…</p>
      </main>
    );
  if (q.isError) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <section className="panel w-full max-w-md p-7 text-center">
          <ShieldAlert className="mx-auto size-8 text-gold" />
          <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-gold uppercase">
            UNKNOWN · autorização não medida
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Não foi possível validar a sessão</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre novamente para renovar a sessão e repetir a verificação server-side.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/auth">Voltar ao acesso</Link>
          </Button>
        </section>
      </main>
    );
  }
  if (!q.data?.admin) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <section className="panel w-full max-w-md p-7 text-center">
          <ShieldAlert className="mx-auto size-8 text-destructive" />
          <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-destructive uppercase">
            403 · Acesso negado
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Esta sala é só para administradores</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sua conta entrou, mas não tem papel de administrador.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/cockpit">Voltar ao cockpit público</Link>
          </Button>
        </section>
      </main>
    );
  }
  return <CockpitShell autenticado />;
}
