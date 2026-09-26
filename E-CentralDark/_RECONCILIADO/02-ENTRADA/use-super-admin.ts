import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkSuperAdmin } from "@/lib/admin.functions";
import { queryKeys } from "@/lib/query-keys";
import { assertSameEpoch, getSessionEpoch } from "@/lib/session-epoch";
import { useAuth } from "@/hooks/use-auth";

export function useIsSuperAdmin() {
  const { session } = useAuth();
  const fn = useServerFn(checkSuperAdmin);
  return useQuery({
    queryKey: queryKeys.isSuperAdmin(session?.user?.id),
    enabled: !!session?.access_token,
    retry: (failureCount, err) => {
      const msg = (err as Error)?.message || "";
      // Não tenta de novo em 401/sessão expirada — devolve false silenciosamente.
      if (/Unauthorized|No authorization header/i.test(msg)) return false;
      return (err as Error)?.name !== "StaleSessionError" && failureCount < 2;
    },
    queryFn: async () => {
      // Race guard: se o usuário mudou no meio, descarta a resposta.
      const startEpoch = getSessionEpoch();
      try {
        const result = await fn();
        assertSameEpoch(startEpoch);
        return result;
      } catch (err) {
        const msg = (err as Error)?.message || "";
        // Sessão expirada/sem token: trata como "não é super admin", evita tela branca.
        if (/Unauthorized|No authorization header/i.test(msg)) {
          return false as unknown as Awaited<ReturnType<typeof fn>>;
        }
        throw err;
      }
    },
  });
}
