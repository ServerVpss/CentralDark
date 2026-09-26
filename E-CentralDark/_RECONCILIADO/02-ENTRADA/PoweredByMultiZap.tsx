// Selo "Powered by MultiZap" — fica oculto quando o branding white-label
// do host atual marca hide_lovable_brand = true.
import { useHostBranding } from "@/hooks/use-host-branding";

export function PoweredByMultiZap({ className }: { className?: string }) {
  const branding = useHostBranding();
  if (branding?.hide_lovable_brand) return null;
  return (
    <p className={className ?? "mt-6 text-center text-xs text-muted-foreground"}>
      Powered by <span className="font-semibold">MultiZap</span>
    </p>
  );
}
