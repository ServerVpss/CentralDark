// Tela de consentimento OAuth: o servidor de autorização redireciona pra cá
// pra o usuário aprovar (ou negar) um cliente MCP.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/compartilhado/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

type DetalhesAutorizacao = {
  client?: { name?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
} | null;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [detalhes, setDetalhes] = useState<DetalhesAutorizacao>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!authorizationId) {
        setErro("Faltou o parâmetro authorization_id.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(
        authorizationId,
      );
      if (!ativo) return;
      if (error) {
        setErro(error.message);
        return;
      }
      const imediato = data?.redirect_url ?? data?.redirect_to;
      if (imediato && !data?.client) {
        window.location.href = imediato;
        return;
      }
      setDetalhes(data);
    })();
    return () => {
      ativo = false;
    };
  }, [authorizationId]);

  async function decidir(aprovar: boolean) {
    setOcupado(true);
    const oauth = (supabase.auth as any).oauth;
    const { data, error } = aprovar
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setOcupado(false);
      setErro(error.message);
      return;
    }
    const destino = data?.redirect_url ?? data?.redirect_to;
    if (!destino) {
      setOcupado(false);
      setErro("O servidor de autorização não devolveu um redirecionamento.");
      return;
    }
    window.location.href = destino;
  }

  const nomeCliente = detalhes?.client?.name ?? "um aplicativo";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-5 py-10">
      <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-3d overflow-hidden">
        <div className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.25),transparent_70%)]" />
        <div className="relative p-7 space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-3d-primary">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>

          {erro ? (
            <>
              <h1 className="text-2xl font-bold text-foreground">Não deu pra carregar</h1>
              <p className="text-sm text-muted-foreground">{erro}</p>
            </>
          ) : !detalhes ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Carregando pedido de autorização...</span>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                Conectar {nomeCliente} à sua conta
              </h1>
              <p className="text-sm text-muted-foreground">
                Isso permite que {nomeCliente} use as ferramentas do CentralDark agindo como você.
                Você pode revogar o acesso quando quiser.
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 shadow-3d-primary"
                  disabled={ocupado}
                  onClick={() => decidir(true)}
                >
                  {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aprovar"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={ocupado}
                  onClick={() => decidir(false)}
                >
                  Negar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
