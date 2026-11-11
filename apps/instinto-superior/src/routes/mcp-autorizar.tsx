/** Telas OAuth e pareamento movidas do servidor MCP para o Cockpit.
 * #OBSERVACOES#
 * @owner apps/instinto-superior/src/routes/mcp-autorizar.tsx
 * @doc_ref docs/RECEIPTS/2026-10-25-MCP-VSCODE-PAIRING-UNIFIED-CONSENT.md
 * @last_updated 2026-11-08T22:47:36Z
 * @implementado código dourado para Vibe Coding e Remote Bridge, com senha administrativa fallback
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mcp-autorizar")({
  component: AutorizarMcpNoCockpit,
  head: () => ({ meta: [
    { title: "CentralDark — Autorizar MCP" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
});

const CAMPOS = [
  "client_id", "redirect_uri", "response_type", "code_challenge",
  "code_challenge_method", "state", "scope", "pair_id", "pair_nonce",
] as const;

function AutorizarMcpNoCockpit() {
  const [params, alterar] = useState<URLSearchParams | null>(null);
  const [pairCode, alterarPairCode] = useState("");
  const [senha, alterarSenha] = useState("");
  const [metodo, alterarMetodo] = useState<"code" | "password">("code");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    alterar(query);
    alterarMetodo(query.get("auth_method") === "password" ? "password" : "code");
  }, []);
  const falha = params?.get("error");
  const sucesso = params?.get("success") === "1";
  const deviceClient = params?.get("client_id");
  const dispositivo = deviceClient === "centraldark.centraldark-vscode-restore" || deviceClient === "centraldark.remote-bridge";
  const deviceLabel = deviceClient === "centraldark.remote-bridge" ? "Remote Bridge" : "Vibe Coding";
  const nome = params?.get("client_name") || params?.get("client_id") || "Cliente MCP";
  const codigoVisivel = params && dispositivo ? params.get("pair_code") : null;
  const confirmarCodigo = Boolean(codigoVisivel && !sucesso);

  return (
    <main className={confirmarCodigo
      ? "grid min-h-dvh place-items-center px-4 pb-44 pt-16"
      : "grid min-h-dvh place-items-center bg-background p-5"}>
      <section className={confirmarCodigo
        ? "panel-gold w-full max-w-md p-7"
        : "w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-lg"}>
        {confirmarCodigo ? (
          <>
            <LockKeyhole className="size-6 text-gold" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-semibold">Confirmar pareamento</h1>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              CentralDark · Sala de Controle
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Autorização do MCP</h1>
          </>
        )}
        {sucesso ? (
          <p className="mt-5 text-sm">Pareamento autorizado. Retorne ao aplicativo solicitante.</p>
        ) : !params ? (
          <p className="mt-5 text-sm">Carregando solicitação…</p>
        ) : !params.get("client_id") ? (
          <p className="mt-5 text-sm text-destructive">Solicitação OAuth sem cliente.</p>
        ) : (
          <>
            {!confirmarCodigo && (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  Cliente: <strong className="text-foreground">{nome}</strong>
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Permissões solicitadas: {params.get("scope") || "mcp"}
                </p>
              </>
            )}
            {falha ? (
              <p role="alert" className="mt-4 rounded-lg border border-destructive p-3 text-sm text-destructive">
                {falha}
              </p>
            ) : null}
            <form method="post" action="https://mcp.centralldark.com/authorize" className="mt-6 space-y-4">
              {dispositivo && <input type="hidden" name="auth_method" value={metodo} />}
              {CAMPOS.map((campo) => (
                <input key={campo} type="hidden" name={campo} value={params.get(campo) || ""} />
              ))}
              {dispositivo ? (
                <>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Opção de autorização">
                    <Button type="button" variant={metodo === "code" ? "default" : "outline"} onClick={() => alterarMetodo("code")}>
                      Confirmar código
                    </Button>
                    <Button type="button" variant={metodo === "password" ? "default" : "outline"} onClick={() => alterarMetodo("password")}>
                      Usar senha
                    </Button>
                  </div>
                  {codigoVisivel ? (
                  <>
                    <output className="block rounded-lg border border-border bg-background p-4 text-center font-mono text-3xl font-bold tracking-wider text-gold" aria-label="Código de pareamento">{codigoVisivel}</output>
                    <input type="hidden" name="pair_code" value={codigoVisivel} />
                  </>
                ) : (
                <label className="block text-sm">
                  Código apresentado pelo {deviceLabel}
                  <input type="text" autoComplete="off" required name="pair_code" value={pairCode}
                    onChange={(e) => alterarPairCode(e.target.value.toUpperCase())}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3 font-mono" />
                </label>
                  )}
                  {metodo === "password" ? (
                    <label className="block text-sm">
                      Senha administrativa do MCP
                      <input type="password" required autoComplete="current-password" name="password"
                        value={senha} onChange={(e) => alterarSenha(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-background p-3" />
                      <span className="mt-2 block text-xs text-muted-foreground">O código e o nonce continuam obrigatórios. A senha não fica no Bridge.</span>
                    </label>
                  ) : (
                    <p className="text-xs text-muted-foreground">Confirme com a sessão MCP ativa. Caso não esteja autenticado, selecione Usar senha.</p>
                  )}
                </>
              ) : (
                <label className="block text-sm">
                  Autenticação do proprietário
                  <input type="password" required autoComplete="current-password" name="password"
                    value={senha} onChange={(e) => alterarSenha(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3" />
                </label>
              )}
              <div className="flex gap-3">
                <Button type="submit" className={confirmarCodigo ? "w-full" : undefined}>
                  {dispositivo ? "Confirmar pareamento" : "Autorizar"}
                </Button>
                {!confirmarCodigo && (
                  <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
                )}
              </div>
            </form>
          </>
        )}
        {!confirmarCodigo && (
          <>
            <p className="mt-7 text-xs text-muted-foreground">
              Interface no Cockpit. MCP: <code>/api/mcp</code>.
            </p>
            <Link className="mt-3 inline-block text-sm underline" to="/sala-controle">
              Voltar para a Sala de Controle
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
