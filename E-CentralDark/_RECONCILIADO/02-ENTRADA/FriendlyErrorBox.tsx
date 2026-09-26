import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { translateWhatsAppError } from "@/lib/whatsapp-error-translate";
import { cn } from "@/lib/utils";

export function FriendlyErrorBox({
  error,
  className,
}: {
  error?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const f = translateWhatsAppError(error);
  if (!f || !error) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold text-red-600 dark:text-red-400">
            {f.title}
          </p>
          {f.detail && (
            <p className="text-xs leading-relaxed text-foreground/80">
              {f.detail}
            </p>
          )}
          {f.action && (
            <p className="text-xs font-medium text-foreground">
              👉 {f.action}
            </p>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {open ? "Esconder" : "Ver"} mensagem técnica original
          </button>
          {open && (
            <pre className="mt-1 max-h-32 overflow-auto rounded border border-border/50 bg-muted/40 p-2 font-mono text-[10px] leading-snug text-muted-foreground whitespace-pre-wrap">
              {error}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
