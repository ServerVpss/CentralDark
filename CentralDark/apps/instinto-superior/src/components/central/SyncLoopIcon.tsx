import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type SyncLoopIconProps = {
  /** Ciclo automático ligado (mesmo que ocioso agora). */
  autoSyncEnabled: boolean;
  /** Existe uma requisição real em andamento agora. */
  isFetching: boolean;
  /** Erro real da última tentativa, quando houver. */
  lastError?: string | null | undefined;
  size?: number;
  variant?: "default" | "compact";
  className?: string;
};

/**
 * Ícone circular único de sincronização, reutilizado em todo o Cockpit.
 * Semântica visual (nunca simula atividade que não está acontecendo):
 * - requisição real em curso → giro rápido, azul
 * - erro real na última tentativa → parado, vermelho (giro não esconde falha)
 * - ciclo automático ligado e ocioso → giro lento contínuo, verde
 * - ciclo desligado e ocioso → parado, cinza
 * Respeita prefers-reduced-motion em todos os casos.
 */
export function SyncLoopIcon({
  autoSyncEnabled,
  isFetching,
  lastError,
  size = 16,
  variant = "default",
  className,
}: SyncLoopIconProps) {
  const cor = lastError
    ? "text-red-500"
    : isFetching
      ? "text-sky-500"
      : autoSyncEnabled
        ? "text-emerald-500"
        : "text-muted-foreground";

  const animacao = isFetching
    ? "animate-spin motion-reduce:animate-none"
    : autoSyncEnabled && !lastError
      ? "animate-[spin_3s_linear_infinite] motion-reduce:animate-none"
      : "";

  return (
    <RefreshCw
      size={size}
      className={cn(cor, animacao, variant === "compact" ? "shrink-0" : "", className)}
      aria-hidden="true"
    />
  );
}

export default SyncLoopIcon;
