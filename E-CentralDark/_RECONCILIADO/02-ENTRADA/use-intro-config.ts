import { useQuery } from "@tanstack/react-query";
import { getLandingConfig } from "@/lib/landing-config.functions";

/**
 * Hook leve pra ler config de intro (duração + se mostra no app/auth).
 * Usa o mesmo cache da landing — sem requisição extra quando já buscado.
 */
export function useIntroConfig() {
  const { data } = useQuery({
    queryKey: ["landing-config"],
    queryFn: () => getLandingConfig(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  return {
    durationMs: data?.intro_duration_ms ?? 2200,
    showOnApp: data?.intro_show_on_app ?? true,
    introEnabled: data?.sections?.intro ?? true,
  };
}
