import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, Lock, Send, ShieldCheck, Loader2, X, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { formatTimeBR } from "@/lib/datetime";
import {
  getSegredoStatus,
  activateSegredoMode,
  deactivateSegredoMode,
  sendSegredoCommand,
} from "@/lib/segredo-ia.functions";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  needsConfirmation?: boolean;
  route?: string | null;
  intent?: string;
};

export function SegredoIAButton() {
  const { data: superAdmin } = useIsSuperAdmin();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!superAdmin?.isSuperAdmin) return null;

  // Esconde em telas que já têm UI densa no canto inferior (chat com composer, etc).
  const hideOnRoutes = ["/app/chat"];
  if (hideOnRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return <SegredoIAPanel open={open} onClose={() => setOpen(false)} />;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir Segredo IA"
        title="Segredo IA"
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/25 opacity-70 transition-all hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <Sparkles className="h-4 w-4" />
      </button>
      <SegredoIAPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function SegredoIAPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const statusFn = useServerFn(getSegredoStatus);
  const activateFn = useServerFn(activateSegredoMode);
  const deactivateFn = useServerFn(deactivateSegredoMode);
  const sendFn = useServerFn(sendSegredoCommand);

  const { data: status } = useQuery({
    queryKey: ["segredo-status"],
    queryFn: () => statusFn(),
    enabled: open,
    refetchInterval: open ? 30_000 : false,
  });

  const [password, setPassword] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const activateM = useMutation({
    mutationFn: (pwd: string) => activateFn({ data: { password: pwd } }),
    onSuccess: () => {
      setPassword("");
      setMessages([{ role: "assistant", content: "Modo Segredo ativado. Em que posso ajudar?" }]);
      qc.invalidateQueries({ queryKey: ["segredo-status"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const deactivateM = useMutation({
    mutationFn: () => deactivateFn(),
    onSuccess: () => {
      setMessages([]);
      qc.invalidateQueries({ queryKey: ["segredo-status"] });
      toast.success("Modo Segredo desativado.");
    },
  });

  const sendM = useMutation({
    mutationFn: (text: string) =>
      sendFn({
        data: {
          message: text,
          sessionId: status!.sessionId!,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        },
      }),
    onSuccess: (r) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: r.reply,
          needsConfirmation: r.needsConfirmation,
          route: r.route,
          intent: r.intent,
        },
      ]);
    },
    onError: (e: Error) => {
      setMessages((prev) => [...prev, { role: "assistant", content: `Erro: ${e.message}` }]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || !status?.sessionId) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    sendM.mutate(text);
  };

  const handleOpenRoute = (route: string) => {
    navigate({ to: route });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Segredo IA
            {status?.isActive && (
              <Badge variant="default" className="ml-auto bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
                <ShieldCheck className="mr-1 h-3 w-3" /> Ativo
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {status?.isActive
              ? "Modo Segredo ativo — acesso administrativo assistido."
              : "Sua assistente master. Ative o Modo Segredo para começar."}
          </SheetDescription>
        </SheetHeader>

        {!status ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !status.passwordSet ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <Lock className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-base font-semibold">Senha do Modo Segredo não configurada</h3>
            <p className="text-sm text-muted-foreground">
              Defina a senha em <strong>Configurações → Modo Segredo</strong> antes de usar.
            </p>
            <Button variant="outline" onClick={() => { navigate({ to: "/admin/configuracoes" }); onClose(); }}>
              Ir para Configurações
            </Button>
          </div>
        ) : status.isBlocked ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <Lock className="h-12 w-12 text-red-500" />
            <h3 className="text-base font-semibold">Modo Segredo bloqueado</h3>
            <p className="text-sm text-muted-foreground">
              Muitas tentativas erradas. Tente novamente após{" "}
              {status.blockedUntil ? formatTimeBR(status.blockedUntil) : "15 min"}.
            </p>
          </div>
        ) : !status.isActive ? (
          <form
            className="flex flex-1 flex-col items-center justify-center gap-3 p-6"
            onSubmit={(e) => { e.preventDefault(); if (password) activateM.mutate(password); }}
          >
            <Lock className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-base font-semibold">Informe a senha de autorização</h3>
            <Input
              type="password"
              autoFocus
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="max-w-xs"
            />
            <Button type="submit" disabled={!password || activateM.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {activateM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ativar Modo Segredo"}
            </Button>
            {(status.failedAttempts ?? 0) > 0 && (
              <p className="text-xs text-amber-500">{status.failedAttempts}/3 tentativas erradas</p>
            )}
          </form>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Diga algo como: <em>"resuma os atendimentos de hoje"</em>, <em>"abrir tickets críticos"</em>, <em>"diagnosticar WhatsApp"</em>.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.needsConfirmation && m.role === "assistant" && (
                      <div className="mt-2 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-600">
                        ⚠️ Esta ação precisa de confirmação. Digite <strong>CONFIRMAR</strong> para executar.
                      </div>
                    )}
                    {m.route && m.role === "assistant" && (
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => handleOpenRoute(m.route!)}>
                        Abrir página
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {sendM.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted px-3 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                </div>
              )}
            </div>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Pergunte ou comande algo…"
                  disabled={sendM.isPending}
                />
                <Button onClick={handleSend} disabled={!input.trim() || sendM.isPending} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Sessão expira: {status.expiresAt ? formatTimeBR(status.expiresAt) : "—"}</span>
                <button
                  onClick={() => deactivateM.mutate()}
                  className="flex items-center gap-1 text-red-500 hover:underline"
                >
                  <Power className="h-3 w-3" /> Desativar
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
