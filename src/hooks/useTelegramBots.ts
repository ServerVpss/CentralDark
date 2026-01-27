import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface TelegramBot {
  id: string;
  name: string;
  token: string;
  bot_username: string | null;
  bot_id: number | null;
  webhook_url: string | null;
  webhook_active: boolean;
  is_active: boolean;
  last_health_check: string | null;
  health_status: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface BotSecuritySettings {
  id: string;
  bot_id: string;
  anti_link_enabled: boolean;
  anti_link_action: string;
  anti_spam_enabled: boolean;
  anti_spam_max_messages: number;
  anti_spam_interval_seconds: number;
  anti_spam_action: string;
  anti_flood_enabled: boolean;
  anti_flood_max_messages: number;
  anti_flood_interval_seconds: number;
  anti_flood_action: string;
  welcome_message_enabled: boolean;
  welcome_message: string | null;
  user_id: string | null;
}

export function useTelegramBots() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBots = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("telegram_bots")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bots:", error);
      toast.error("Erro ao carregar bots");
    } else {
      setBots(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBots();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("telegram_bots_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_bots" },
        (payload) => {
          console.log("Bot update:", payload);
          if (payload.eventType === "INSERT") {
            setBots((prev) => [payload.new as TelegramBot, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBots((prev) =>
              prev.map((bot) =>
                bot.id === payload.new.id ? (payload.new as TelegramBot) : bot
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBots((prev) => prev.filter((bot) => bot.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBots]);

  // Helper para extrair bot_id do token
  const extractBotIdFromToken = (token: string): string | null => {
    const parts = token.split(":");
    if (parts.length >= 1 && /^\d+$/.test(parts[0])) {
      return parts[0];
    }
    return null;
  };

  // Helper para delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Verificar se bot já existe
  const checkExistingBot = async (token: string): Promise<TelegramBot | null> => {
    const botIdFromToken = extractBotIdFromToken(token);
    if (!botIdFromToken) return null;

    const { data } = await supabase
      .from("telegram_bots")
      .select("*")
      .eq("bot_id", parseInt(botIdFromToken))
      .single();

    return data as TelegramBot | null;
  };

  // Invocar Edge Function com retry
  const invokeWithRetry = async (
    body: Record<string, unknown>,
    maxRetries: number = 2
  ): Promise<{ data: unknown; error: Error | null }> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} - Invoking telegram-bot function`);
        
        const { data, error } = await supabase.functions.invoke("telegram-bot", {
          body,
        });

        if (error) {
          // Check if it's a network/fetch error (likely extension blocking)
          const isNetworkError = 
            error.message?.includes("FunctionsFetchError") ||
            error.message?.includes("Failed to fetch") ||
            error.message?.includes("NetworkError") ||
            error.message?.includes("fetch");

          if (isNetworkError && attempt < maxRetries) {
            console.log(`Network error on attempt ${attempt}, retrying in 1s...`);
            lastError = error;
            await delay(1000);
            continue;
          }
          throw error;
        }

        return { data, error: null };
      } catch (err) {
        lastError = err as Error;
        console.error(`Attempt ${attempt} failed:`, err);

        if (attempt < maxRetries) {
          await delay(1000);
        }
      }
    }

    return { data: null, error: lastError };
  };

  const createBot = async (name: string, token: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um bot");
      console.error("createBot: user not logged in", { user });
      return null;
    }

    console.log("Creating bot with userId:", user.id, "token:", token.substring(0, 10) + "...");

    try {
      // 1. Verificar se o bot já existe no banco
      const existingBot = await checkExistingBot(token);
      if (existingBot) {
        toast.info("Este bot já está cadastrado! Sincronizando...", {
          duration: 4000,
        });
        // Sincronizar o bot existente
        await syncBot(existingBot.id);
        await fetchBots();
        return existingBot;
      }

      // 2. Tentar criar com retry automático
      const { data, error } = await invokeWithRetry({
        action: "createBot",
        name,
        token,
        userId: user.id,
      });

      console.log("createBot response:", data, error);

      if (error) {
        console.error("Edge function error after retries:", error);
        
        // Verificar se é erro de rede (extensão bloqueando)
        const isNetworkError = 
          error.message?.includes("FunctionsFetchError") ||
          error.message?.includes("Failed to fetch") ||
          error.message?.includes("NetworkError");

        if (isNetworkError) {
          toast.error("Erro de conexão com o servidor", {
            duration: 8000,
            description: "Uma extensão do navegador pode estar bloqueando a requisição. Tente desabilitar extensões de VPN, proxy ou ad blockers.",
          });
        } else {
          toast.error("Erro ao conectar com o servidor. Tente novamente.");
        }
        return null;
      }

      const responseData = data as { success?: boolean; error?: string; bot?: TelegramBot };

      if (responseData?.success) {
        toast.success("Bot criado e webhook configurado com sucesso!");
        await fetchBots();
        return responseData.bot;
      } else {
        // Mensagens de erro detalhadas baseadas na resposta do Telegram
        const errorMsg = responseData?.error || "Erro desconhecido";
        let userMessage = "Erro ao criar bot";
        
        if (errorMsg.includes("Not Found") || errorMsg.includes("404")) {
          userMessage = "Token inválido ou bot não existe no Telegram. Verifique o token no @BotFather.";
        } else if (errorMsg.includes("Unauthorized") || errorMsg.includes("401")) {
          userMessage = "Token não autorizado. O token pode ter sido revogado. Gere um novo no @BotFather.";
        } else if (errorMsg.includes("duplicate") || errorMsg.includes("unique")) {
          userMessage = "Este bot já está cadastrado no sistema.";
        } else if (errorMsg.includes("Invalid")) {
          userMessage = "Formato do token inválido.";
        } else {
          userMessage = `Erro: ${errorMsg}`;
        }
        
        toast.error(userMessage, {
          duration: 6000,
          description: "Verifique o token e tente novamente",
        });
        return null;
      }
    } catch (err) {
      console.error("Create bot error:", err);
      toast.error("Erro inesperado ao criar bot. Tente novamente.");
      return null;
    }
  };

  const syncBot = async (botId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot", {
        body: { action: "syncBot", botId },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Bot sincronizado com sucesso!");
        return true;
      } else {
        toast.error(data?.error || "Erro ao sincronizar bot");
        return false;
      }
    } catch (err) {
      console.error("Sync bot error:", err);
      toast.error("Erro ao sincronizar bot");
      return false;
    }
  };

  const healthCheck = async (botId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot", {
        body: { action: "healthCheck", botId },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Health check error:", err);
      return { success: false, status: "error" };
    }
  };

  const deleteBot = async (botId: string) => {
    try {
      // First delete webhook
      await supabase.functions.invoke("telegram-bot", {
        body: { action: "deleteWebhook", botId },
      });

      // Then delete from database
      const { error } = await supabase
        .from("telegram_bots")
        .delete()
        .eq("id", botId);

      if (error) throw error;

      toast.success("Bot removido com sucesso!");
      return true;
    } catch (err) {
      console.error("Delete bot error:", err);
      toast.error("Erro ao remover bot");
      return false;
    }
  };

  const updateBot = async (botId: string, updates: Partial<TelegramBot>) => {
    try {
      const { error } = await supabase
        .from("telegram_bots")
        .update(updates)
        .eq("id", botId);

      if (error) throw error;

      toast.success("Bot atualizado com sucesso!");
      return true;
    } catch (err) {
      console.error("Update bot error:", err);
      toast.error("Erro ao atualizar bot");
      return false;
    }
  };

  return {
    bots,
    loading,
    createBot,
    syncBot,
    healthCheck,
    deleteBot,
    updateBot,
    refetch: fetchBots,
  };
}

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
