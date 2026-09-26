import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// Página de callback do OAuth da Meta (Embedded Signup).
// Abre num popup, captura o ?code= que a Meta devolve e
// envia pra janela que abriu via postMessage. Depois fecha sozinha.
export const Route = createFileRoute("/oauth/meta-callback")({
  component: MetaCallbackPage,
});

function MetaCallbackPage() {
  const [status, setStatus] = useState<"ok" | "erro" | "esperando">("esperando");
  const [mensagem, setMensagem] = useState("Finalizando conexão...");

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const erro = url.searchParams.get("error");
      const erroDesc = url.searchParams.get("error_description");

      if (erro) {
        setStatus("erro");
        setMensagem(erroDesc ?? erro);
        if (window.opener) {
          window.opener.postMessage(
            { type: "meta_signup_error", error: erro, description: erroDesc },
            window.location.origin,
          );
        }
        return;
      }

      if (!code) {
        setStatus("erro");
        setMensagem("Código não recebido da Meta. Tente reconectar.");
        return;
      }

      if (window.opener) {
        window.opener.postMessage(
          { type: "meta_signup_code", code },
          window.location.origin,
        );
        setStatus("ok");
        setMensagem("Conectado! Você já pode fechar esta janela.");
        // tenta fechar; alguns navegadores bloqueiam, então a msg fica de backup
        setTimeout(() => {
          try {
            window.close();
          } catch {
            /* ignora */
          }
        }, 800);
      } else {
        setStatus("erro");
        setMensagem(
          "Esta página deve ser aberta pelo botão de conexão. Volte ao app e tente novamente.",
        );
      }
    } catch (e) {
      setStatus("erro");
      setMensagem((e as Error).message);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">
          {status === "ok" ? "✅" : status === "erro" ? "⚠️" : "⏳"}
        </div>
        <h1 className="mb-2 text-lg font-semibold">
          {status === "ok"
            ? "Tudo certo!"
            : status === "erro"
              ? "Não foi possível conectar"
              : "Conectando..."}
        </h1>
        <p className="text-sm text-muted-foreground">{mensagem}</p>
      </div>
    </div>
  );
}
