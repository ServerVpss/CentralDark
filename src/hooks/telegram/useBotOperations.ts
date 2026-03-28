import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TelegramBot } from "./types";

// Helper para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para extrair bot_id do token
export function extractBotIdFromToken(token: string): string | null {
  const parts = token.split(":");
  if (parts.length >= 1 && /^\d+$/.test(parts[0])) {
    return parts[0];
  }
  return null;
}

// Verificar se bot já existe
export async function checkExistingBot(token: string): Promise<TelegramBot | null> {
  const botIdFromToken = extractBotIdFromToken(token);
  if (!botIdFromToken) return null;

  const { data } = await supabase
    .from("telegram_bots")
    .select("*")
    .eq("bot_id", parseInt(botIdFromToken))
    .single();

  return data as TelegramBot | null;
}

// Invocar Edge Function com retry
export async function invokeWithRetry(
  body: Record<string, unknown>,
  maxRetries: number = 2
): Promise<{ data: unknown; error: Error | null }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} - Invoking telegram-bot function`);
      
      const { data, error } = await supabase.functions.invoke("telegram-bot", {
        body,
      });

      if (error) {
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
}

// Sincronizar bot
export async function syncBot(botId: string): Promise<boolean> {
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
}

// Health check
export async function healthCheck(botId: string): Promise<{ success: boolean; status: string }> {
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
}

// Deletar bot
export async function deleteBot(botId: string): Promise<boolean> {
  try {
    // First delete webhook
    await supabase.functions.invoke("telegram-bot", {
      body: { action: "deleteWebhook", botId },
    });

    // Delete related records first (foreign key constraints)
    await supabase.from("pending_payments").delete().eq("bot_id", botId);
    await supabase.from("telegram_subscriptions").delete().eq("bot_id", botId);
    await supabase.from("bot_analytics").delete().eq("bot_id", botId);
    await supabase.from("bot_security_settings").delete().eq("bot_id", botId);
    await supabase.from("bot_settings").delete().eq("bot_id", botId);

    // Then delete the bot
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
}

// Atualizar bot
export async function updateBot(botId: string, updates: Partial<TelegramBot>): Promise<boolean> {
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
}
