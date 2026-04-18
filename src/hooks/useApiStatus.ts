import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ApiStatusData {
  ativo: boolean;
  plano_tipo: string;
  plano_status: string;
  vencimento: string | null;
  dias_restantes: number | null;
  tempo_restante: string | null;
  consumo_hoje: number;
  total_diario: number;
  reset_em: string | null;
  usuario: string | null;
}

export function useApiStatus() {
  const [data, setData] = useState<ApiStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    const tryOnce = async () => {
      const { data: result, error: fnError } = await supabase.functions.invoke("api-status");
      if (fnError) throw fnError;
      if (!result?.success || !result?.data) {
        throw new Error(result?.error || "Erro ao obter status da API");
      }
      return result.data as ApiStatusData;
    };

    try {
      let result: ApiStatusData;
      try {
        result = await tryOnce();
      } catch {
        // Retry once after small delay (transient network/cold start)
        await new Promise((r) => setTimeout(r, 800));
        result = await tryOnce();
      }
      setData(result);
    } catch (err) {
      console.error("API status fetch error:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { data, loading, error, refresh: fetchStatus };
}
