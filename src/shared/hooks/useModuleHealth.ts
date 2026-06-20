import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HealthLabel = "healthy" | "degraded" | "failing" | "no_data";

export interface ModuleHealth {
  module_key: string;
  total_attempts_24h: number;
  success_count_24h: number;
  notfound_count_24h: number;
  error_count_24h: number;
  success_rate: number;
  health_label: HealthLabel;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_check_at: string;
}

export function useModuleHealth() {
  const [healthMap, setHealthMap] = useState<Record<string, ModuleHealth>>({});
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("module_health_status")
      .select("*");
    if (!error && data) {
      const map: Record<string, ModuleHealth> = {};
      for (const row of data as ModuleHealth[]) map[row.module_key] = row;
      setHealthMap(map);
    }
    setLoading(false);
  }, []);

  const recalcNow = useCallback(async () => {
    setRecalculating(true);
    try {
      const { error } = await supabase.functions.invoke("module-health-calc", { body: {} });
      if (error) throw error;
      await load();
    } finally {
      setRecalculating(false);
    }
  }, [load]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("module-health")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "module_health_status" },
        (payload) => {
          const row = (payload.new ?? payload.old) as ModuleHealth | undefined;
          if (!row?.module_key) return;
          setHealthMap((prev) => ({ ...prev, [row.module_key]: row }));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { healthMap, loading, recalculating, recalcNow, reload: load };
}
