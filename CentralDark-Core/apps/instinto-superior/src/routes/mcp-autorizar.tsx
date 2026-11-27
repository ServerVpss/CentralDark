/** Autorizacao OAuth MCP e pareamento em uma unica rota do Cockpit.
 * #OBSERVACOES#
 * @owner apps/instinto-superior/src/routes/mcp-autorizar.tsx
 * @doc_ref docs/RECEIPTS/2026-10-25-MCP-VSCODE-PAIRING-UNIFIED-CONSENT.md
 * @last_updated 2026-11-17T21:27:49.471Z
 * @implementado consentimento MCP + pareamento do Bridge/Vibe na mesma UI compacta;
 *  codigo vem da solicitacao criada pelo cliente, sem outro store ou segredo no navegador;
 *  visual a partir do HTML CentralDark em Downloads, sem importar handlers simulados.
 * @pendente prova de autenticacao real, build do host e readback do deploy no mesmo SHA.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mcp-autorizar")({
  component: AutorizarMcpNoCockpit,
  head: () => ({ meta: [
    { title: "CentralDark · Autorizar acesso" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
});

// Estes campos ja sao consumidos e validados pelo /authorize real.
// Nunca mover client_secret, pair_secret ou refresh_token para o navegador.
const CAMPOS = [
  "client_id", "redirect_uri", "response_type", "code_challenge",
  "code_challenge_method", "state", "scope", "pair_id", "pair_nonce",
] as const;
const CLIENTE_VSCODE = "centraldark.centraldark-vscode-restore";
const CLIENTE_BRIDGE = "centraldark.remote-bridge";

function MarcaROV() {
  // Mesmo SVG do template ROV CentralDark · OS (E:/CentralDark/.../ROV-CentralDark-Templates).
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2"
      className="size-[25px]" aria-hidden="true">
      <circle cx="16" cy="16" r="12" />
      <path d="M5.5 16c5.5-7 15.5-7 21 0-5.5 7-15.5 7-21 0Z" />
      <circle cx="16" cy="16" r="3.7" />
      <path d="M16 1v4m0 22v4M1 16h4m22 0h4" />
    </svg>
  );
}

function AutorizarMcpNoCockpit() {
  const [params, alterarParams] = useState<URLSearchParams | null>(null);
  const [pairCode, alterarPairCode] = useState("");
  const [erroEnvio, alterarErroEnvio] = useState("");
  const [enviando, alterarEnviando] = useState(false);
  const [confirmado, alterarConfirmado] = useState(false);

  useEffect(() => {
    alterarParams(new URLSearchParams(window.location.search));
  }, []);

  const clientId = params?.get("client_id") ?? "";
  const dispositivo = clientId === CLIENTE_BRIDGE || clientId === CLIENTE_VSCODE;
  const nome = dispositivo
    ? (clientId === CLIENTE_BRIDGE ? "CentralDark Remote Bridge" : "CentralDark · Vibe Coding")
    : (params?.get("client_name") || clientId || "Cliente MCP");
  const codigoVisivel = dispositivo && params ? params.get("pair_code") || "" : "";
  const sucesso = (params?.get("success") === "1" || confirmado) && dispositivo;
  const falha = params?.get("error") || "";
  const scopes = (params?.get("scope") || "mcp").split(/\s+/).filter(Boolean);
  const autorizado = dispositivo
    ? Boolean(params?.get("pair_id") && params?.get("pair_nonce") && (codigoVisivel || pairCode.trim()))
    : Boolean(clientId && params?.get("redirect_uri") && params?.get("response_type") === "code"
      && params?.get("code_challenge") && params?.get("code_challenge_method") === "S256");
  const titulo = dispositivo ? "Confirmar pareamento" : "Autorizar acesso MCP";

  async function enviarConsentimento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!params || !autorizado || enviando) return;
    // currentTarget pertence ao evento s?ncrono: capturar ANTES do primeiro await.
    const formulario = event.currentTarget;
    if (!(formulario instanceof HTMLFormElement)) {
      alterarErroEnvio("Formul?rio de autoriza??o indispon?vel.");
      return;
    }
    const body = new URLSearchParams();
    new FormData(formulario).forEach((value, key) => {
      if (typeof value === "string") body.append(key, value);
    });
    alterarEnviando(true);
    alterarErroEnvio("");
    try {
      // Reutilizar a mesma sessão do Cockpit; não pedir a senha do MCP novamente.
      // O servidor valida JWT e user_roles=admin; sessão local nunca equivale a autorização.
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) throw new Error("Sessão do Cockpit expirada. Entre novamente na CentralDark.");

      const response = await fetch("https://mcp.centralldark.com/authorize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "omit",
        redirect: "error",
        body: body.toString(),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || result.error_description || "Não foi possível autorizar esta solicitação.");
      }
      if (dispositivo) {
        alterarConfirmado(true);
        return;
      }
      // O redirect já foi validado contra o cadastro do cliente no backend.
      // Esta verificação adicional evita navegar fora do destino esperado.
      const destino = new URL(String(result.redirect_to || ""));
      const esperado = new URL(params.get("redirect_uri") || "");
      if (destino.origin !== esperado.origin || destino.pathname !== esperado.pathname
          || !["https:", "http:"].includes(destino.protocol)) {
        throw new Error("Destino OAuth divergente do cliente registrado.");
      }
      window.location.assign(destino.toString());
    } catch (error) {
      alterarErroEnvio(error instanceof Error ? error.message : "Falha na autorização. Confira a sessão no Cockpit.");
    } finally {
      alterarEnviando(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-3 py-5 text-foreground sm:px-5"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", width: "100%", padding: "20px 12px", boxSizing: "border-box" }}>
      <section className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-border bg-card shadow-deep"
        style={{ width: "100%", maxWidth: "480px", marginInline: "auto", boxSizing: "border-box" }}
        aria-label="Autorizacao CentralDark">
        <div className="h-0.5 bg-gradient-to-r from-gold/20 via-gold to-gold/20" aria-hidden="true" />
        <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
          <header className="flex items-center gap-3">
            <div className="grid size-[38px] shrink-0 place-items-center rounded-[11px] border border-gold/40 bg-background text-gold">
              <MarcaROV />
            </div>
            <div>
              <strong className="block text-[16px] font-semibold leading-tight tracking-tight">CentralDark</strong>
              <small className="block font-mono text-[9px] tracking-widest text-muted-foreground">CENTRALDARK · OS</small>
            </div>
            <span className="ml-auto flex items-center gap-1 rounded-full border border-gold/30 px-2 py-1 font-mono text-[9px] font-medium tracking-wide text-gold">
              <LockKeyhole aria-hidden="true" className="size-3" /> {dispositivo ? "PAREAMENTO" : "OAUTH · PKCE"}
            </span>
          </header>

          {sucesso ? (
            <div role="status" className="space-y-3 py-3 text-center">
              <ShieldCheck aria-hidden="true" className="mx-auto size-9 text-neon-green" />
              <h1 className="text-xl font-semibold">Confirmação enviada</h1>
              <p className="text-sm text-muted-foreground">
                Retorne ao {nome} e confira o estado da conexão no próprio aplicativo.
              </p>
              <p className="text-xs text-muted-foreground">
                O token do dispositivo não é exibido nesta página.
              </p>
            </div>
          ) : !params ? (
            <p role="status" className="py-4 text-sm text-muted-foreground">Carregando solicitação…</p>
          ) : !clientId ? (
            <p role="alert" className="py-4 text-sm text-muted-foreground">
              Inicie a conexão pelo cliente MCP ou pelo aplicativo CentralDark para receber uma solicitação válida.
            </p>
          ) : (
            <>
              <div className="space-y-1 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
                <p className="break-words text-xs leading-5 text-muted-foreground">
                  <strong className="font-semibold text-foreground">{nome}</strong>
                  {dispositivo ? " solicita conectar este dispositivo à CentralDark." : " solicita acesso aos recursos da sua CentralDark."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-center" aria-label="Conexao solicitada">
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 px-2 py-2">
                  <p className="text-[10px] font-semibold text-foreground">CentralDark</p>
                  <p className="font-mono text-[9px] text-muted-foreground">PROPRIETÁRIO</p>
                </div>
                <LockKeyhole className="size-4 shrink-0 text-gold" aria-hidden="true" />
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 px-2 py-2">
                  <p className="truncate text-[10px] font-semibold text-foreground" title={nome}>{nome}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {dispositivo ? "DISPOSITIVO" : "CLIENTE MCP"}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-background/50">
                <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                  <strong className="text-xs">Permissões solicitadas</strong>
                  <span className="truncate font-mono text-[10px] text-gold">{scopes.join(" ")}</span>
                </div>
                <div className="space-y-0 px-3">
                  <div className="flex items-center gap-2 border-b border-border py-2.5">
                    <KeyRound className="size-4 shrink-0 text-gold" aria-hidden="true" />
                    <p className="min-w-0 flex-1 text-xs">{dispositivo ? "Vincular o dispositivo autorizado" : "Acessar o MCP com os escopos aprovados"}</p>
                    <Check className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2 py-2.5">
                    <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" />
                    <p className="min-w-0 flex-1 text-xs">
                      {scopes.includes("admin") ? "Inclui acesso administrativo solicitado" : "Somente capacidades permitidas pelo servidor"}
                    </p>
                    <Check className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {(erroEnvio || falha) && (
                <p role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {erroEnvio || falha}
                </p>
              )}

              <form method="post" action="https://mcp.centralldark.com/authorize" onSubmit={enviarConsentimento} className="space-y-3">
                <input type="hidden" name="auth_method" value="code" />
                {CAMPOS.map(campo => (
                  <input key={campo} type="hidden" name={campo} value={params.get(campo) || ""} />
                ))}
                {dispositivo && (
                  codigoVisivel ? (
                    <div className="rounded-lg border border-gold/30 bg-background px-3 py-3 text-center">
                      <span className="block text-[10px] text-muted-foreground">Código solicitado pelo {nome}</span>
                      <output className="mt-1 block font-mono text-xl font-bold tracking-widest text-gold"
                        aria-label="Código de pareamento">{codigoVisivel}</output>
                      <input type="hidden" name="pair_code" value={codigoVisivel} />
                    </div>
                  ) : (
                    <label className="block text-xs">
                      Código apresentado pelo {nome}
                      <input type="text" name="pair_code" autoComplete="off" required
                        value={pairCode} onChange={e => alterarPairCode(e.target.value.toUpperCase())}
                        className="mt-2 block h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm uppercase tracking-widest"
                        placeholder="0000-0000" />
                    </label>
                  )
                )}
                {!autorizado && (
                  <p role="alert" className="text-xs text-destructive">
                    Solicitação incompleta. Reabra a conexão pelo aplicativo solicitante.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="glow-gold" disabled={!autorizado || enviando}>
                    {enviando ? "Validando sessão..." : dispositivo ? "Confirmar" : "Autorizar"}
                  </Button>
                </div>
              </form>
              <p className="flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3 text-gold" aria-hidden="true" />
                A sessão e as permissões são validadas pelo servidor.
              </p>
            </>
          )}
          <Link className="block text-center text-xs text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
            to="/sala-controle">Voltar à Sala de Controle</Link>
        </div>
      </section>
    </main>
  );
}
