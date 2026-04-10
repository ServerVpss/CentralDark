import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { TelegramBot } from "./types";
import {
  checkExistingBot,
  invokeWithRetry,
  syncBot,
  healthCheck,
  deleteBot,
  updateBot,
} from "./useBotOperations";

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

  const createBot = async (name: string, token: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um bot");
      console.error("createBot: user not logged in", { user });
      return null;
    }

    

    try {
      // 1. Verificar se o bot já existe no banco
      const existingBot = await checkExistingBot(token);
      if (existingBot) {
        toast.info("Este bot já está cadastrado! Sincronizando...", {
          duration: 4000,
        });
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

      

      if (error) {
        console.error("Edge function error after retries:", error);
        
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

// Re-export types and other hooks
export type { TelegramBot, BotSecuritySettings } from "./types";
export { useBotSecuritySettings } from "./useBotSecuritySettings";
