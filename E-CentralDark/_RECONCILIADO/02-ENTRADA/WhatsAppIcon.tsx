import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import whatsappPng from "@/assets/whatsapp-icon.png";

type Tamanho = "sm" | "md" | "lg" | "xl";

const TAMANHOS: Record<Tamanho, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
  xl: "h-16 w-16",
};

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  /** Atalho de tamanho. Se passar `className` com h-/w- também, o className vence. */
  size?: Tamanho;
}

/**
 * Ícone oficial do WhatsApp (PNG).
 * Aparece igual em modo claro/escuro porque é uma imagem fechada.
 */
export function WhatsAppIcon({ size = "md", className, loading, ...props }: Props) {
  return (
    <img
      src={whatsappPng}
      alt="WhatsApp"
      draggable={false}
      loading={loading ?? "lazy"}
      className={cn("inline-block object-contain select-none", TAMANHOS[size], className)}
      {...props}
    />
  );
}
