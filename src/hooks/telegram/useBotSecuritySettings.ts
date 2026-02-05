import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BotSecuritySettings } from "./types";

export function useBotSecuritySettings(botId: string | null) {
  const [settings, setSettings] = useState<BotSecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!botId) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("bot_security_settings")
        .select("*")
        .eq("bot_id", botId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching security settings:", error);
      }
      setSettings(data);
      setLoading(false);
    };

    fetchSettings();
  }, [botId]);

  const updateSettings = async (updates: Partial<BotSecuritySettings>) => {
    if (!botId) return false;

    try {
      const { error } = await supabase
        .from("bot_security_settings")
        .upsert({ bot_id: botId, ...updates }, { onConflict: "bot_id" });

      if (error) throw error;

      setSettings((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success("Configurações salvas!");
      return true;
    } catch (err) {
      console.error("Update settings error:", err);
      toast.error("Erro ao salvar configurações");
      return false;
    }
  };

  return { settings, loading, updateSettings };
}
