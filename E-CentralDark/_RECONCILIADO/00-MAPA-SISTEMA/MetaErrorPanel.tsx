// Painel de erro rico da Meta — mostra mensagem amigável, próximo passo e detalhes técnicos.
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type MetaErrPayload = {
  friendly: string;
  next: string | null;
  action: string;
  status: number;
  code: string | null;
  subcode: string | null;
  message: string | null;
  raw: unknown;
};

const ACTION_LABEL: Record<string, string> = {
  create_number: "Adicionar número",
  request_code: "Solicitar código",
  verify_code: "Confirmar código",
  register: "Registrar número",
};

export function parseMetaError(err: unknown): MetaErrPayload {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (msg.startsWith("META_ERR::")) {
    try {
      return JSON.parse(msg.slice("META_ERR::".length)) as MetaErrPayload;
    } catch {
      /* cai no fallback */
    }
  }
  return {
    friendly: msg || "Algo deu errado.",
    next: null, action: "", status: 0, code: null, subcode: null, message: null, raw: null,
  };
}

export function MetaErrorPanel({
  error, onRetry, retrying,
}: {
  error: MetaErrPayload;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const actionLabel = ACTION_LABEL[error.action] ?? error.action ?? "—";
  const rawJson = error.raw ? JSON.stringify(error.raw, null, 2) : null;

  return (
    <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
        <div className="space-y-1">
          <p className="font-semibold text-xl text-red-300">{error.friendly}</p>
          {error.next && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground/80">Próximo passo: </span>
              {error.next}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} disabled={retrying}>
            <RefreshCw className={`mr-1 h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
            Tentar novamente
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
          {open ? <ChevronDown className="mr-1 h-3 w-3" /> : <ChevronRight className="mr-1 h-3 w-3" />}
          Ver detalhes técnicos
        </Button>
      </div>

      {open && (
        <div className="space-y-2 rounded-md border border-white/10 bg-background/40 p-3 text-xs">
          <div className="grid grid-cols-[120px_1fr] gap-y-1">
            <span className="text-muted-foreground">Ação</span>
            <span className="font-mono">{actionLabel}</span>
            <span className="text-muted-foreground">HTTP</span>
            <span className="font-mono">{error.status || "—"}</span>
            <span className="text-muted-foreground">Código Meta</span>
            <span className="font-mono">
              {error.code ?? "—"}{error.subcode ? ` (subcode ${error.subcode})` : ""}
            </span>
            <span className="text-muted-foreground">Mensagem Meta</span>
            <span className="font-mono break-words">{error.message ?? "—"}</span>
          </div>
          {rawJson && (
            <>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Resposta bruta (sanitizada)</span>
                <Button
                  size="sm" variant="ghost" className="h-6 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(rawJson);
                    toast.success("Detalhes copiados.");
                  }}
                >
                  <Copy className="mr-1 h-3 w-3" /> Copiar
                </Button>
              </div>
              <pre className="max-h-48 overflow-auto rounded bg-black/40 p-2 font-mono text-[11px] leading-relaxed">
                {rawJson}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
