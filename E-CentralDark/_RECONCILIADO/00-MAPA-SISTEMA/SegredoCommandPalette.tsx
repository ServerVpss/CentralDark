// Atalho global Ctrl+K (super_admin only) — frase secreta "ativar modo segredo"
import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Lock, Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { activateSegredoMode } from "@/lib/segredo-ia.functions";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";

const SECRET_PHRASE = "ativar modo segredo";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function SegredoCommandPalette() {
  const { data: superAdmin } = useIsSuperAdmin();
  const isSA = !!superAdmin?.isSuperAdmin;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [step, setStep] = useState<"search" | "password">("search");
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const qc = useQueryClient();
  const activateFn = useServerFn(activateSegredoMode);

  // Atalho global Ctrl+K (ou Cmd+K) — só super admin
  useEffect(() => {
    if (!isSA) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSA]);

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      setQuery("");
      setPassword("");
      setStep("search");
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const phraseMatches = normalize(query) === SECRET_PHRASE;

  // Avança automático ao digitar a frase
  useEffect(() => {
    if (step === "search" && phraseMatches) {
      setStep("password");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [phraseMatches, step]);

  const activateM = useMutation({
    mutationFn: (pwd: string) => activateFn({ data: { password: pwd } }),
    onSuccess: () => {
      toast.success("Modo Segredo ativado", {
        description: "Sessão iniciada via atalho Ctrl+K. Abra o painel para conversar.",
      });
      qc.invalidateQueries({ queryKey: ["segredo-status"] });
      setOpen(false);
    },
    onError: (e: Error) => {
      toast.error(friendlyError(e));
      setPassword("");
    },
  });

  if (!isSA) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Caixa de comandos</DialogTitle>
          <DialogDescription>Atalho global do super admin</DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <>
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Digite um comando…  (ex.: "ativar modo segredo")'
                className="border-0 shadow-none focus-visible:ring-0 px-0"
                autoComplete="off"
              />
              <kbd className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <div className="p-4 text-sm text-muted-foreground">
              {query.length === 0 ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Comandos disponíveis</p>
                  <p>• <code className="text-emerald-600">ativar modo segredo</code> — abre o assistente master</p>
                </div>
              ) : phraseMatches ? (
                <p className="text-emerald-600 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Frase reconhecida — pedindo senha…
                </p>
              ) : (
                <p>Nenhum comando corresponde a "{query}".</p>
              )}
            </div>
          </>
        ) : (
          <form
            className="p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (password) activateM.mutate(password);
            }}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">Confirme com sua senha do Modo Segredo</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Tentativas erradas são registradas e podem bloquear seu acesso temporariamente.
            </p>
            <Input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep("search")}>
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={!password || activateM.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {activateM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ativar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
