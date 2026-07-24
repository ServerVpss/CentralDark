import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/hub-client";

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

export type ApiStatusErrorKind = "expired_key" | "network" | "unknown" | null;

export function useApiStatus() {
  const [data, setData] = useState<ApiStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ApiStatusErrorKind>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
    const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

    const classifyPayload = (payload: any): ApiStatusErrorKind => {
      const upstreamStatus = payload?.upstream_status;
      if (upstreamStatus === 401 || upstreamStatus === 403) return "expired_key";
      const msg = String(payload?.error || "").toLowerCase();
      if (msg.includes("api key") || msg.includes("não autoriz") || msg.includes("unauthorized")) {
        return "expired_key";
      }
      if (msg.includes("rede") || msg.includes("network") || msg.includes("indisponível")) {
        return "network";
      }
      return "unknown";
    };

    const tryOnce = async () => {
      // Fetch direto — permite ler o payload de erro do 503 que a edge devolve
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || ANON_KEY;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/api-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": ANON_KEY,
        },
        body: "{}",
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result?.success || !result?.data) {
        const kind = classifyPayload(result);
        const err = new Error(result?.error || `HTTP ${res.status}`) as Error & { kind: ApiStatusErrorKind };
        err.kind = kind;
        throw err;
      }
      return result.data as ApiStatusData;
    };

    // Até 3 tentativas com backoff
    const delays = [0, 800, 2000];
    let lastErr: any = null;
    for (const delay of delays) {
      if (delay) await new Promise((r) => setTimeout(r, delay));
      try {
        const result = await tryOnce();
        setData(result);
        setError(null);
        setErrorKind(null);
        setLoading(false);
        return;
      } catch (err) {
        lastErr = err;
        // Se já sabemos que é chave expirada, não adianta insistir
        if (lastErr?.kind === "expired_key") break;
      }
    }
    console.error("API status fetch error:", lastErr);
    const kind: ApiStatusErrorKind = lastErr?.kind ?? "network";
    setErrorKind(kind);
    setData((prev) => {
      if (!prev) {
        setError(lastErr instanceof Error ? lastErr.message : "Erro desconhecido");
      }
      return prev;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { data, loading, error, errorKind, refresh: fetchStatus };
}

