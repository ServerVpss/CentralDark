import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { SyncLoopIcon } from "@/components/central/SyncLoopIcon";
import { useRelogioVivo, tempoDecorrido } from "@/hooks/useRelogioVivo";

export type SyncActionButtonProps = {
  label: string;
  onClick: () => void;
  autoSyncEnabled?: boolean;
  isFetching: boolean;
  lastSuccessAt?: string | number | null | undefined;
  lastError?: string | null | undefined;
  disabled?: boolean;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "secondary";
  className?: string;
} & Omit<ComponentProps<typeof Button>, "onClick" | "disabled" | "size" | "variant" | "className" | "children">;

/**
 * Botão de sincronização/medição padrão do Cockpit: usa o mesmo SyncLoopIcon
 * e o mesmo relógio global (useRelogioVivo) em vez de cada tela inventar o
 * próprio timer, cor de ícone ou texto de "há Xs". Um giro não é prova de
 * dado atualizado — o texto de tempo decorrido só muda quando a medição real
 * (lastSuccessAt) muda.
 */
export function SyncActionButton({
  label,
  onClick,
  autoSyncEnabled = false,
  isFetching,
  lastSuccessAt,
  lastError,
  disabled,
  size = "sm",
  variant = "outline",
  className,
  ...resto
}: SyncActionButtonProps) {
  const agora = useRelogioVivo();
  return (
    <Button onClick={onClick} disabled={disabled || isFetching} size={size} variant={variant} className={className} {...resto}>
      <SyncLoopIcon autoSyncEnabled={autoSyncEnabled} isFetching={isFetching} lastError={lastError} />
      <span className="ml-2">{isFetching ? `${label}…` : label}</span>
      {lastSuccessAt && !isFetching ? (
        <span className="ml-2 text-[10px] text-muted-foreground">· {tempoDecorrido(lastSuccessAt, agora)}</span>
      ) : null}
    </Button>
  );
}

export default SyncActionButton;
