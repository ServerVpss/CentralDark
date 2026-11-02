/** Telas OAuth e pareamento movidas do servidor MCP para o Cockpit. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

  useEffect(() => { alterar(new URLSearchParams(window.location.search)); }, []);
  const falha = params?.get("error");
  const sucesso = params?.get("success") === "1";
  const dispositivo = params?.get("client_id") === "centraldark.centraldark-vscode-restore";
  const nome = params?.get("client_name") || params?.get("client_id") || "Cliente MCP";

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-5">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-lg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          CentralDark · Sala de Controle
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Autorização do MCP</h1>
        {sucesso ? (
          <p className="mt-5 text-sm">Pareamento autorizado. Retorne ao aplicativo solicitante.</p>
        ) : !params ? (
          <p className="mt-5 text-sm">Carregando solicitação…</p>
        ) : !params.get("client_id") ? (
          <p className="mt-5 text-sm text-destructive">Solicitação OAuth sem cliente.</p>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              Cliente: <strong className="text-foreground">{nome}</strong>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Permissões solicitadas: {params.get("scope") || "mcp"}
            </p>
            {falha ? (
              <p role="alert" className="mt-4 rounded-lg border border-destructive p-3 text-sm text-destructive">
                {falha}
              </p>
            ) : null}
            <form method="post" action="https://mcp.centralldark.com/authorize" className="mt-6 space-y-4">
              {CAMPOS.map((campo) => (
                <input key={campo} type="hidden" name={campo} value={params.get(campo) || ""} />
              ))}
              {dispositivo ? (
                params.get("pair_code") ? (
                  <div className="rounded-lg border border-border bg-background p-4" role="group" aria-label="Confirmação de pareamento">
                    <p className="text-sm">Compare com o código mostrado no VS Code:</p>
                    <output className="mt-2 block font-mono text-2xl font-bold tracking-wider" aria-label="Código de pareamento">{params.get("pair_code")}</output>
                    <p className="mt-2 text-xs text-muted-foreground">Se os códigos coincidirem, clique em Confirmar pareamento.</p>
                    <input type="hidden" name="pair_code" value={params.get("pair_code") || ""} />
                  </div>
                ) : (
                <label className="block text-sm">
                  Código apresentado pelo VS Code
                  <input type="text" autoComplete="off" required name="pair_code" value={pairCode}
                    onChange={(e) => alterarPairCode(e.target.value.toUpperCase())}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3 font-mono" />
                </label>
                )
              ) : (
                <label className="block text-sm">
                  Autenticação do proprietário
                  <input type="password" required autoComplete="current-password" name="password"
                    value={senha} onChange={(e) => alterarSenha(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3" />
                </label>
              )}
              <div className="flex gap-3">
                <Button type="submit">{dispositivo ? "Confirmar pareamento" : "Autorizar"}</Button>
                <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
              </div>
            </form>
          </>
        )}
        <p className="mt-7 text-xs text-muted-foreground">
          Interface no Cockpit. MCP: <code>/api/mcp</code>.
        </p>
        <Link className="mt-3 inline-block text-sm underline" to="/sala-controle">
          Voltar para a Sala de Controle
        </Link>
      </section>
    </main>
  );
}
