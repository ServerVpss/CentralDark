import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BotSettings {
  id: string;
  bot_id: string;
  owner_ids: number[];
  group_chat_id: number | null;
  group_url: string | null;
  group_title: string | null;
  terms_enabled: boolean;
  terms_text: string | null;
  mute_new_members: boolean;
  announce_payments: boolean;
  auto_delete_messages: boolean;
  show_typing: boolean;
  react_to_messages: boolean;
  reaction_mode: string;
  fixed_emoji: string;
  custom_emojis: string[];
  created_at: string;
  updated_at: string;
}

const DEFAULT_TERMS = `📄 <b>Termos de Uso</b>

Bem-vindo ao nosso sistema de assinatura!

Ao utilizar este bot, você concorda com:

1. O acesso é liberado automaticamente após confirmação do pagamento
2. As assinaturas têm validade conforme o plano escolhido
3. Não há reembolso após a confirmação do pagamento
4. Você se compromete a utilizar o serviço de forma legal e ética

✅ Ao clicar em "Aceitar", você concorda com todos os termos acima.`;

export function useBotSettings(botId: string | null) {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!botId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("bot_settings")
      .select("*")
      .eq("bot_id", botId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching bot settings:", error);
    }
    
    setSettings(data as BotSettings | null);
    setLoading(false);
  }, [botId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<BotSettings>): Promise<boolean> => {
    if (!botId) return false;

    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from("bot_settings")
        .select("id")
        .eq("bot_id", botId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("bot_settings")
          .update(updates)
          .eq("bot_id", botId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("bot_settings")
          .insert({ 
            bot_id: botId, 
            terms_text: DEFAULT_TERMS,
            ...updates 
          });

        if (error) throw error;
      }

      await fetchSettings();
      toast.success("Configurações salvas com sucesso!");
      return true;
    } catch (err) {
      console.error("Update settings error:", err);
      toast.error("Erro ao salvar configurações");
      return false;
    }
  };

  const addOwner = async (ownerId: number): Promise<boolean> => {
    const currentOwners = settings?.owner_ids || [];
    if (currentOwners.includes(ownerId)) {
      toast.error("Este ID já está na lista de owners");
      return false;
    }
    return updateSettings({ owner_ids: [...currentOwners, ownerId] });
  };

  const removeOwner = async (ownerId: number): Promise<boolean> => {
    const currentOwners = settings?.owner_ids || [];
    return updateSettings({ owner_ids: currentOwners.filter(id => id !== ownerId) });
  };

  return {
    settings,
    loading,
    updateSettings,
    addOwner,
    removeOwner,
    refetch: fetchSettings,
    defaultTerms: DEFAULT_TERMS,
  };
}
