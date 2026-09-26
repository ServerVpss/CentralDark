// Botão flutuante com chat da Assistente MultiZap.
// Aparece em TODAS as páginas. Também escuta erros globais e oferece reportar.
import { useEffect, useRef, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Bot, X, Send, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { sendAssistantMessage, reportAssistantError } from "@/lib/assistant.functions";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type CapturedError = { id: string; message: string; summary: string };

const LS_OPEN = "multizap-assistant-open";

export function FloatingAssistant() {
  const router = useRouter();
  const sendFn = useServerFn(sendAssistantMessage);
  const reportFn = useServerFn(reportAssistantError);

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [modelLabel, setModelLabel] = useState<string>("MultiZap IA");
  const [captured, setCaptured] = useState<CapturedError | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Persiste estado aberto/fechado
  useEffect(() => {
    try { setOpen(localStorage.getItem(LS_OPEN) === "1"); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_OPEN, open ? "1" : "0"); } catch {}
  }, [open]);

  // --- Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, sending]);

  // --- Listeners globais de erro
  const reportError = useCallback(async (source: "auto" | "boundary", message: string, stack?: string) => {
    try {
      const res = await reportFn({
        data: {
          source,
          message: message.slice(0, 1900),
          stack: stack?.slice(0, 7900) ?? null,
          pagePath: typeof window !== "undefined" ? window.location.pathname : null,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          notifyTelegram: true,
        },
      });
      setCaptured({ id: res.errorId, message, summary: res.friendlySummary });
      setOpen(true);
    } catch {
      // silencioso — não queremos loop de erro
    }
  }, [reportFn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastMsg = "";
    let lastAt = 0;
    const dedupe = (m: string) => {
      const now = Date.now();
      if (m === lastMsg && now - lastAt < 10_000) return true;
      lastMsg = m; lastAt = now; return false;
    };
    const onError = (e: ErrorEvent) => {
      // Erro de recurso (img/script/css que não carregou) chega aqui sem ErrorEvent.message
      if (!e.message && e.target && e.target instanceof HTMLElement) {
        const tag = e.target.tagName?.toLowerCase();
        const src = (e.target as any).src || (e.target as any).href || "?";
        const m = `Recurso não carregou: <${tag}> ${src}`;
        if (dedupe(m)) return;
        reportError("auto", m);
        return;
      }
      const m = e.message || "Erro desconhecido";
      if (dedupe(m)) return;
      reportError("auto", m, e.error?.stack);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason: any = e.reason;
      const m = (reason?.message || String(reason || "")).slice(0, 1900);
      if (!m || dedupe(m)) return;
      reportError("auto", m, reason?.stack);
    };
    // Patch fetch para capturar respostas 5xx silenciosas
    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const res = await origFetch(...args);
        if (res.status >= 500) {
          const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
          // Ignora a própria rota de report pra não criar loop
          if (!url.includes("/assistant") && !url.includes("/monitor")) {
            const m = `HTTP ${res.status} em ${url}`;
            if (!dedupe(m)) reportError("auto", m);
          }
        }
        return res;
      } catch (err: any) {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
        const m = `Falha de rede em ${url}: ${err?.message || err}`;
        if (!dedupe(m)) reportError("auto", m, err?.stack);
        throw err;
      }
    };
    window.addEventListener("error", onError, true); // capture=true pega erros de recurso
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.fetch = origFetch;
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [reportError]);

  const submit = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await sendFn({
        data: {
          conversationId: convId,
          message: text,
          pagePath: typeof window !== "undefined" ? window.location.pathname : null,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          capturedErrorId: captured?.id ?? null,
        },
      });
      setConvId(res.conversationId);
      setModelLabel(res.modelFriendly || "MultiZap IA");
      setMsgs((m) => [...m, { role: "assistant", content: res.reply }]);
      setCaptured(null);
    } catch (e: any) {
      // Log técnico no console pra diagnóstico (sem expor secret/token)
      console.error("[FloatingAssistant] falha ao consultar IA", e?.message ?? e);
      const raw = String(e?.message ?? "");
      let friendly = "A IA está temporariamente indisponível. Tente novamente em alguns segundos.";
      if (/429|muitas perguntas/i.test(raw)) {
        friendly = "A IA recebeu muitas perguntas ao mesmo tempo. Tente de novo em 1 minuto.";
      } else if (/402|saldo|cr[eé]dito/i.test(raw)) {
        friendly = "O saldo de IA acabou. Avise o administrador para adicionar créditos.";
      } else if (/timeout|network|fetch/i.test(raw)) {
        friendly = "A IA está demorando para responder. Tente novamente em alguns segundos.";
      }
      toast.error(friendly);
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: `${friendly}\n\nEnquanto isso, o atendimento manual continua funcionando normalmente.`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const reportThisPage = async () => {
    await reportError("boundary", "Reporte manual do usuário a partir desta tela.", undefined);
    toast.success("Erro registrado. Já estou analisando aqui.");
  };

  // Esconde em rotas de auth/embed pra não atrapalhar
  const path = router.state.location.pathname;
  if (path.startsWith("/auth") || path.startsWith("/embed")) return null;

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir assistente MultiZap"
          className="fixed bottom-4 right-4 z-[9998] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Painel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-[9998] w-[360px] max-w-[calc(100vw-1rem)] h-[540px] max-h-[calc(100vh-2rem)] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Assistente MultiZap</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {modelLabel} · rápida e simples
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Mensagens */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {msgs.length === 0 && !captured && (
              <div className="text-xs text-muted-foreground text-center py-6 px-2">
                Oi! Sou sua assistente do MultiZap.
                <br />Posso te ajudar a entender o sistema, resolver dúvidas e investigar erros desta tela.
              </div>
            )}
            {captured && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Erro detectado nesta tela
                </div>
                <div className="text-muted-foreground">{captured.summary}</div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Já avisei o administrador. Quer me perguntar algo sobre isso?
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="bg-muted text-muted-foreground rounded-xl px-3 py-2 text-sm flex items-center gap-2 max-w-[85%]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> pensando…
              </div>
            )}
          </div>

          {/* Ação rápida: reportar erro */}
          <div className="px-3 pb-2">
            <button
              onClick={reportThisPage}
              className="w-full text-[11px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 py-1 rounded-md hover:bg-muted transition-colors"
            >
              <AlertTriangle className="h-3 w-3" /> Algo errado nesta tela? Reportar agora
            </button>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="flex items-end gap-2 p-3 border-t border-border bg-card"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              placeholder="Pergunte qualquer coisa…"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-32"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Enviar"
              className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
