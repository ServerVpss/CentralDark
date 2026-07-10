import { type ButtonHTMLAttributes, forwardRef, cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/shared/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "default", size = "default", asChild, children, ...props }, ref) => {
    const variantCls = {
      default: "bg-primary text-primary-foreground shadow-3d-primary hover:bg-primary-glow active:translate-y-[1px]",
      outline: "border border-border bg-card/50 shadow-3d-soft hover:bg-secondary active:translate-y-[1px]",
      ghost: "hover:bg-muted",
      destructive: "bg-destructive text-destructive-foreground shadow-3d-destructive hover:brightness-95 active:translate-y-[1px]",
    }[variant];
    const sizeCls = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-7 px-3 text-xs",
      lg: "h-11 px-8",
      icon: "h-9 w-9",
    }[size];
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
      variantCls, sizeCls, className,
    );
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<any>;
      return cloneElement(child, {
        ...props,
        className: cn(classes, child.props.className),
        ref,
      });
    }
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
