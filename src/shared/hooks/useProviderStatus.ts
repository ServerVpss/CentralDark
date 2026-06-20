import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProviderStatus {
  id: string;
  name: string;
  port: number | null;
  is_active: boolean;
  status: 'online' | 'offline' | 'checking';
  latency_ms?: number;
  last_check?: string;
  error?: string;
}

interface UseProviderStatusReturn {
  providers: ProviderStatus[];
  isLoading: boolean;
  checkStatus: () => Promise<void>;
}

export function useProviderStatus(): UseProviderStatusReturn {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);

    // Show "checking" state immediately with known providers
    setProviders((prev) => {
      if (prev.length > 0) {
        return prev.map((p) => ({ ...p, status: 'checking' as const }));
      }
      // Default placeholders while loading
      return [
        { id: 'nexfuture', name: 'NexFuture', port: 25589, is_active: true, status: 'checking' as const },
        { id: 'nexfuture_cpf', name: 'NexFuture CPF', port: 25594, is_active: true, status: 'checking' as const },
        { id: 'tconect_score', name: 'TConect Score', port: 3036, is_active: true, status: 'checking' as const },
        { id: 'tconect_placa', name: 'TConect Placa', port: 3041, is_active: true, status: 'checking' as const },
        { id: 'tconect_foto', name: 'TConect Foto', port: 3030, is_active: true, status: 'checking' as const },
      ];
    });

    try {
      const { data, error } = await supabase.functions.invoke("provider-ping");

      if (error) {
        console.error("Provider ping error:", error);
        // On error, mark all as offline
        setProviders((prev) =>
          prev.map((p) => ({
            ...p,
            status: 'offline' as const,
            last_check: new Date().toISOString(),
            error: 'Falha ao verificar',
          }))
        );
        setIsLoading(false);
        return;
      }

      const pingResults = data?.providers || [];
      const checkedAt = data?.summary?.checked_at || new Date().toISOString();

      const updatedProviders: ProviderStatus[] = pingResults.map((p: any) => ({
        id: p.id,
        name: p.name,
        port: p.port,
        is_active: true,
        status: p.status as 'online' | 'offline',
        latency_ms: p.latency_ms ?? undefined,
        last_check: checkedAt,
        error: p.error,
      }));

      setProviders(updatedProviders);
    } catch (err) {
      console.error("Provider status check failed:", err);
      setProviders((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'offline' as const,
          last_check: new Date().toISOString(),
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    
    // Refresh every 60 seconds
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    providers,
    isLoading,
    checkStatus,
  };
}
