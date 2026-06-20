import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSystemSetting<T = any>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  const fetchValue = useCallback(async () => {
    const { data, error } = await supabase
      .from("system_settings" as any)
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (!error && data) {
      setValue((data as any).value as T);
    }
    setLoading(false);
  }, [key]);

  useEffect(() => {
    fetchValue();
    const ch = supabase
      .channel(`system_settings:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: `key=eq.${key}` },
        () => fetchValue()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [key, fetchValue]);

  const update = useCallback(
    async (newValue: T) => {
      const { error } = await supabase
        .from("system_settings" as any)
        .upsert({ key, value: newValue as any }, { onConflict: "key" });
      if (!error) setValue(newValue);
      return { error };
    },
    [key]
  );

  return { value, loading, update };
}
