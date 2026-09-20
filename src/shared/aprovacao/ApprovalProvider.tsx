import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, ShieldOff, ShieldCheck } from "lucide-react";

// === Tipos ===
export type Risco = "baixo" | "medio" | "alto";

export interface PedidoAprovacao {
  acao: string;          // ex: "Deletar arquivo"
  alvo?: string;         // ex: "cerebro/teste.md"
  risco?: Risco;         // default: "alto"
  detalhes?: string;     // texto extra opcional
}

type Resposta = "sim" | "nao";

interface ApprovalContextValue {
  pedirAprovacao: (p: PedidoAprovacao) => Promise<Resposta>;
  bypassAtivo: boolean;
  ligarBypass: () => void;
  desligarBypass: () => void;
}

const ApprovalContext = createContext<ApprovalContextValue | null>(null);

const CHAVE_BYPASS = "centraldark:bypass-destrutivo";

// === Hook público ===
export function useAprovacao() {
  const ctx = useContext(ApprovalContext);
  if (!ctx) throw new Error("useAprovacao precisa estar dentro do <ApprovalProvider>");
  return ctx;
}

// === Provider ===
export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const [pedido, setPedido] = useState<PedidoAprovacao | null>(null);
  const [bypassAtivo, setBypassAtivo] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(CHAVE_BYPASS) === "1";
  });

  // promessa pendente
  const resolverRef = useRef<((r: Resposta) => void) | null>(null);

  const ligarBypass = useCallback(() => {
    sessionStorage.setItem(CHAVE_BYPASS, "1");
    setBypassAtivo(true);
  }, []);

  const desligarBypass = useCallback(() => {
    sessionStorage.removeItem(CHAVE_BYPASS);
    setBypassAtivo(false);
  }, []);

  const pedirAprovacao = useCallback(
    (p: PedidoAprovacao): Promise<Resposta> => {
      // Bypass: libera direto, sem abrir modal
      if (sessionStorage.getItem(CHAVE_BYPASS) === "1") {
        console.info("[aprovacao] bypass ativo — liberado:", p.acao, p.alvo ?? "");
        return Promise.resolve("sim");
      }
      return new Promise<Resposta>((resolve) => {
        resolverRef.current = resolve;
        setPedido({ risco: "alto", ...p });
        setAberto(true);
      });
    },
    []
  );

  const responder = useCallback(
    (r: Resposta) => {
      console.info("[aprovacao]", pedido?.acao, "→", r);
      resolverRef.current?.(r);
      resolverRef.current = null;
      setAberto(false);
      setPedido(null);
    },
    [pedido]
  );

  const responderBypass = useCallback(() => {
    ligarBypass();
    responder("sim");
  }, [ligarBypass, responder]);

  // Fecha como "nao" se o modal for fechado por fora (Esc, clique fora)
  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open && resolverRef.current) {
        responder("nao");
      } else {
        setAberto(open);
      }
    },
    [responder]
  );

  const valor = useMemo<ApprovalContextValue>(
    () => ({ pedirAprovacao, bypassAtivo, ligarBypass, desligarBypass }),
    [pedirAprovacao, bypassAtivo, ligarBypass, desligarBypass]
  );

  const corRisco =
    pedido?.risco === "baixo"
      ? "text-emerald-600"
      : pedido?.risco === "medio"
      ? "text-amber-600"
      : "text-destructive";

  return (
    <ApprovalContext.Provider value={valor}>
      {children}

      <AlertDialog open={aberto} onOpenChange={onOpenChange}>
        <AlertDialogContent className="rounded-xl shadow-3d max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${corRisco}`} />
              Confirmar ação
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Ação: </span>
                  <span className="font-medium text-foreground">{pedido?.acao}</span>
                </div>
                {pedido?.alvo && (
                  <div className="break-all">
                    <span className="text-muted-foreground">Alvo: </span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{pedido.alvo}</code>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Risco: </span>
                  <span className={`font-semibold uppercase ${corRisco}`}>
                    {pedido?.risco ?? "alto"}
                  </span>
                </div>
                {pedido?.detalhes && (
                  <p className="pt-1 text-muted-foreground">{pedido.detalhes}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            <div className="flex w-full gap-2">
              <AlertDialogCancel
                onClick={() => responder("nao")}
                className="flex-1 rounded-lg shadow-3d-soft active:translate-y-[1px]"
              >
                Não
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => responder("sim")}
                className="flex-1 rounded-lg shadow-3d-primary active:translate-y-[1px]"
              >
                Sim
              </AlertDialogAction>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={responderBypass}
              className="w-full rounded-lg text-xs shadow-3d-soft active:translate-y-[1px]"
            >
              <ShieldOff className="mr-2 h-3.5 w-3.5" />
              Permitir tudo nesta sessão (bypass)
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BannerBypass ativo={bypassAtivo} desligar={desligarBypass} />
    </ApprovalContext.Provider>
  );
}

// === Faixa superior quando o bypass está ligado ===
function BannerBypass({ ativo, desligar }: { ativo: boolean; desligar: () => void }) {
  // Limpa o bypass se a aba reabrir noutra sessão (segurança extra)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && sessionStorage.getItem(CHAVE_BYPASS) !== "1") {
        // estado já bate
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!ativo) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 bg-amber-500/95 px-3 py-1.5 text-xs font-medium text-amber-950 shadow-3d-soft">
      <ShieldCheck className="h-4 w-4" />
      Bypass ativo — ações destrutivas liberadas nesta sessão
      <button
        type="button"
        onClick={desligar}
        className="rounded-md bg-amber-950/10 px-2 py-0.5 text-amber-950 hover:bg-amber-950/20"
      >
        Desligar
      </button>
    </div>
  );
}
