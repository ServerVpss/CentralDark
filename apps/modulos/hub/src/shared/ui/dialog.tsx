// Modal headless mínimo — sem Radix, sem dependência externa.
import React, { createContext, useContext, useEffect, cloneElement, isValidElement } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const DialogCtx = createContext<Ctx | null>(null);
function useDialog() {
  const c = useContext(DialogCtx);
  if (!c) throw new Error("Dialog components must be used inside <Dialog>");
  return c;
}

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);
  return <DialogCtx.Provider value={{ open, setOpen: onOpenChange }}>{children}</DialogCtx.Provider>;
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const { setOpen } = useDialog();
  if (asChild && isValidElement(children)) {
    return cloneElement(children as any, {
      onClick: (e: any) => { (children.props as any).onClick?.(e); setOpen(true); },
    });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = useDialog();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div role="dialog" aria-modal="true" className={cn("relative z-10 w-full max-w-lg rounded-lg border border-border/60 bg-card p-6 shadow-2xl", className)}>
        <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-3 space-y-1", className)}>{children}</div>;
}
export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-base font-semibold leading-none", className)}>{children}</h2>;
}
export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>;
}
