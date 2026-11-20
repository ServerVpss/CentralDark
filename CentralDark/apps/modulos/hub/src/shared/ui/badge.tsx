import { type HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function Badge({ className, variant: _variant, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: string }) {
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", className)} {...props} />
  );
}
