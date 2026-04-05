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
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: fnError } = await supabase.functions.invoke("api-status");

      if (fnError) throw fnError;

      if (result?.success && result?.data) {
        setData(result.data);
      } else {
        setError(result?.error || "Erro ao obter status da API");
      }
    } catch (err) {
      console.error("API status fetch error:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { data, loading, error, refresh: fetchStatus };
}
