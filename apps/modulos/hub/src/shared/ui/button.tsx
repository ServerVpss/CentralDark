import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "destructive"; size?: "default" | "sm" | "lg" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantCls = {
      default: "bg-primary text-primary-foreground hover:opacity-90",
      outline: "border border-border bg-transparent hover:bg-muted",
      ghost: "hover:bg-muted",
      destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
    }[variant];
    const sizeCls = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-7 px-3 text-xs",
      lg: "h-11 px-8",
      icon: "h-9 w-9",
    }[size];
    return (
      <button ref={ref} className={cn("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed", variantCls, sizeCls, className)} {...props} />
    );
  }
);
Button.displayName = "Button";
