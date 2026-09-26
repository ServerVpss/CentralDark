// Ícone de status estilo WhatsApp Web:
// ⏱ pending → ✓ sent → ✓✓ delivered (cinza) → ✓✓ read (azul) → ⚠ failed
import { Clock, Check, CheckCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeliveryStatus = "pending" | "sending" | "sent" | "delivered" | "read" | "failed";

export function MessageStatusIcon({
  status,
  className,
}: {
  status: DeliveryStatus | string | null | undefined;
  className?: string;
}) {
  const s = (status ?? "sent") as DeliveryStatus;
  if (s === "pending" || s === "sending") {
    return <Clock className={cn("h-3.5 w-3.5 text-muted-foreground/70", className)} aria-label="Enviando" />;
  }
  if (s === "sent") {
    return <Check className={cn("h-3.5 w-3.5 text-muted-foreground", className)} aria-label="Enviado" />;
  }
  if (s === "delivered") {
    return <CheckCheck className={cn("h-3.5 w-3.5 text-muted-foreground", className)} aria-label="Entregue" />;
  }
  if (s === "read") {
    return <CheckCheck className={cn("h-3.5 w-3.5 text-sky-500", className)} aria-label="Lido" />;
  }
  if (s === "failed") {
    return <AlertCircle className={cn("h-3.5 w-3.5 text-red-500", className)} aria-label="Falhou" />;
  }
  return null;
}
