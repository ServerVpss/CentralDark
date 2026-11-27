import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type CockpitActionButtonProps = ComponentProps<typeof Button> & {
  /** Explicação curta exibida pelo navegador quando o controle não tem espaço. */
  hint: string;
  children: ReactNode;
};

/**
 * Botão padrão de ação do Cockpit.
 * Mantém texto visível, dica técnica e nome acessível no mesmo contrato.
 */
export function CockpitActionButton({ hint, title, "aria-label": ariaLabel, children, ...props }: CockpitActionButtonProps) {
  return (
    <Button
      {...props}
      title={title ?? hint}
      aria-label={ariaLabel ?? hint}
      data-cd-action-hint={hint}
    >
      {children}
    </Button>
  );
}

