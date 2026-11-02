"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CentralDark: controle unico de fechar pop-ups.
 * Usar dentro de DialogClose/SheetClose/DrawerClose com asChild quando houver
 * gerenciamento de foco, Esc e estado pelo primitivo. Nao fechar AlertDialog
 * de confirmacao implicitamente.
 */
export const PopupCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, "aria-label": label = "Fechar painel", title = "Fechar", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={title}
    data-cd-control="popup-close"
    className={cn(
      "absolute right-3 top-3 z-10 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-red-500/40 bg-[#05070c] text-red-400 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <X aria-hidden="true" className="size-5" />
    {children}
  </button>
));
PopupCloseButton.displayName = "PopupCloseButton";
