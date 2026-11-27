import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/hub-client";
import { subDays, startOfDay } from "date-fns";

export type ApiUsagePeriod = "today" | "7d" | "15d" | "30d";

/**
 * Conta APENAS consultas reais bem-sucedidas no provedor.
 * Não inclui cliques de botão, callbacks, /start ou outras interações do bot.
 */
export function useApiUsageHistory(period: ApiUsagePeriod) {
  return useQuery({
    queryKey: ["api-usage-history", period],
    queryFn: async () => {
      const now = new Date();
      let since: Date;
      if (period === "today") since = startOfDay(now);
      else if (period === "7d") since = subDays(now, 7);
      else if (period === "15d") since = subDays(now, 15);
      else since = subDays(now, 30);

      const { count, error } = await supabase
        .from("query_history")
        .select("*", { count: "exact", head: true })
        .eq("status", "success")
        .gte("created_at", since.toISOString());

      if (error) throw error;
      return { total: count ?? 0, since };
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60 * 1000,
  });
}
