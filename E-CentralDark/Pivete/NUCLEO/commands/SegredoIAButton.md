# COMANDO - SegredoIAButton.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\segredo-ia\SegredoIAButton.tsx
**SHA:** 790cae23746b9b6b
**Timestamp:** 2026-08-26T19:31:10.065896
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
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
         
```