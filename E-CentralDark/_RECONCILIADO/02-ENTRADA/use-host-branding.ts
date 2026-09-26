// Hook que lê o branding white-label resolvido no SSR a partir do loader da raiz.
// Retorna null em domínios internos (MultiZap padrão) ou se o host não tem branding.
import { useRouter } from "@tanstack/react-router";
import type { HostBranding } from "@/lib/host-branding.functions";

export function useHostBranding(): HostBranding | null {
  const router = useRouter();
  const match = router.state.matches.find((m) => m.routeId === "__root__");
  const data = (match?.loaderData as { hostBranding?: HostBranding | null } | undefined)
    ?.hostBranding;
  return data ?? null;
}
