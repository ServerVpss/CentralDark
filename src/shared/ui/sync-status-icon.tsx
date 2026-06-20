import { CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Estados visuais unificados de sincronização/carregamento usados em todo o painel.
 * - idle: parado, ícone girando bem devagar (pulsa "vivo")
 * - loading: carregando pela primeira vez
 * - syncing: atualizando dado já existente
 * - ready: tudo certo (check verde)
 * - error: falha geral
 * - timeout: estourou tempo (alerta piscando)
 */
export type SyncStatus = "idle" | "loading" | "syncing" | "ready" | "error" | "timeout";

const STATUS_TEXT: Record<SyncStatus, { label: string; aria: string }> = {
  idle: { label: "Pronto", aria: "Aguardando atualização" },
  loading: { label: "Carregando…", aria: "Carregando dados, aguarde" },
  syncing: { label: "Sincronizando…", aria: "Sincronizando informações em tempo real" },
  ready: { label: "Atualizado", aria: "Dados atualizados com sucesso" },
  error: { label: "Erro ao carregar", aria: "Falha ao carregar — clique para tentar novamente" },
  timeout: { label: "Tempo esgotado", aria: "Tempo esgotado — clique para tentar novamente" },
};

interface SyncStatusIconProps {
  status: SyncStatus;
  className?: string;
  /** Mostra um tooltip ao passar o mouse. Default: true */
  withTooltip?: boolean;
  /** Sobrescreve o texto do tooltip */
  tooltipLabel?: string;
  /** Tamanho do ícone (default 16px). */
  size?: number;
}

/**
 * Ícone de status reutilizável com cor, animação e acessibilidade (aria-label + tooltip).
 * Estados de erro/timeout piscam um alerta âmbar/vermelho.
 */
export function SyncStatusIcon({
  status,
  className,
  withTooltip = true,
  tooltipLabel,
  size = 16,
}: SyncStatusIconProps) {
  const { label, aria } = STATUS_TEXT[status];
  const text = tooltipLabel ?? label;

  let icon: React.ReactNode;
  switch (status) {
    case "loading":
      icon = (
        <Loader2
          aria-hidden="true"
          className={cn("animate-spin text-primary", className)}
          style={{ width: size, height: size }}
        />
      );
      break;
    case "syncing":
      icon = (
        <RefreshCw
          aria-hidden="true"
          className={cn("animate-spin text-sky-500", className)}
          style={{ width: size, height: size }}
        />
      );
      break;
    case "ready":
      icon = (
        <CheckCircle2
          aria-hidden="true"
          className={cn("text-emerald-500 animate-in fade-in zoom-in-50", className)}
          style={{ width: size, height: size }}
        />
      );
      break;
    case "error":
      icon = (
        <AlertTriangle
          aria-hidden="true"
          className={cn("text-destructive animate-pulse drop-shadow-[0_0_6px_hsl(var(--destructive)/0.6)]", className)}
          style={{ width: size, height: size }}
        />
      );
      break;
    case "timeout":
      icon = (
        <AlertTriangle
          aria-hidden="true"
          className={cn("text-amber-500 animate-pulse drop-shadow-[0_0_6px_rgb(245_158_11_/_0.6)]", className)}
          style={{ width: size, height: size }}
        />
      );
      break;
    case "idle":
    default:
      icon = (
        <RefreshCw
          aria-hidden="true"
          className={cn("text-muted-foreground animate-[spin_6s_linear_infinite]", className)}
          style={{ width: size, height: size }}
        />
      );
  }

  const wrapped = (
    <span
      role="status"
      aria-label={aria}
      aria-live={status === "error" || status === "timeout" ? "assertive" : "polite"}
      className="inline-flex items-center justify-center"
    >
      {icon}
      <span className="sr-only">{aria}</span>
    </span>
  );

  if (!withTooltip) return wrapped;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
