import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

async function telegramRequest(token: string, method: string, body?: Record<string, unknown>): Promise<TelegramResponse> {
  const url = `${TELEGRAM_API}${token}/${method}`;
  console.log(`Telegram API request: ${method}`);
  
  try {
    const options: RequestInit = {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(`Telegram response for ${method}:`, JSON.stringify(data).substring(0, 300));
    return data;
  } catch (error) {
    console.error(`Telegram API error:`, error);
    return { ok: false, description: (error as Error).message };
  }
}

async function fetchBotPhotoUrl(token: string, botId: number): Promise<string | null> {
  try {
    const photos = await telegramRequest(token, "getUserProfilePhotos", { user_id: botId, limit: 1 });
    const result = photos.result as { photos?: Array<Array<{ file_id: string }>> } | undefined;
    const fileId = result?.photos?.[0]?.[result.photos[0].length - 1]?.file_id;
    if (!fileId) return null;
    const fileRes = await telegramRequest(token, "getFile", { file_id: fileId });
    const filePath = (fileRes.result as { file_path?: string } | undefined)?.file_path;
    if (!filePath) return null;
    return `https://api.telegram.org/file/bot${token}/${filePath}`;
  } catch (e) {
    console.error("fetchBotPhotoUrl error:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, botId, token, ...params } = await req.json();
    console.log(`Action: ${action}, botId: ${botId}`);

    let botToken = token;
    let botRecord = null;

    // Get bot token from database if botId provided
    if (botId && !token) {
      const { data: bot } = await supabase
        .from("telegram_bots")
        .select("*")
        .eq("id", botId)
        .single();
      
      if (!bot) {
        return new Response(
          JSON.stringify({ error: "Bot não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      botToken = bot.token;
      botRecord = bot;
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      case "getMe": {
        // Verify bot token and get bot info
        const response = await telegramRequest(botToken, "getMe");
        if (response.ok) {
          const botInfo = response.result as { id: number; username: string; first_name: string };
          result = {
            success: true,
            bot: {
              id: botInfo.id,
              username: botInfo.username,
              name: botInfo.first_name,
            },
          };
        } else {
          result = { success: false, error: response.description };
        }
        break;
      }

      case "setWebhook": {
        const { webhookUrl } = params;
        const response = await telegramRequest(botToken, "setWebhook", {
          url: webhookUrl,
          allowed_updates: ["message", "edited_message", "channel_post", "callback_query", "chat_member"],
        });
        
        if (response.ok && botId) {
          await supabase
            .from("telegram_bots")
            .update({
              webhook_url: webhookUrl,
              webhook_active: true,
              health_status: "online",
              last_health_check: new Date().toISOString(),
            })
            .eq("id", botId);
        }
        
        result = { success: response.ok, error: response.description };
        break;
      }

      case "deleteWebhook": {
        const response = await telegramRequest(botToken, "deleteWebhook");
        
        if (response.ok && botId) {
          await supabase
            .from("telegram_bots")
            .update({
              webhook_active: false,
            })
            .eq("id", botId);
        }
        
        result = { success: response.ok };
        break;
      }

      case "getWebhookInfo": {
        const response = await telegramRequest(botToken, "getWebhookInfo");
        result = { success: response.ok, info: response.result };
        break;
      }

      case "sendMessage": {
        const { chatId, text, parseMode = "HTML" } = params;
        const response = await telegramRequest(botToken, "sendMessage", {
          chat_id: chatId,
          text,
          parse_mode: parseMode,
        });
        
        if (response.ok && botId) {
           // Use atomic increment function for accurate analytics
           await supabase.rpc("increment_bot_analytics", {
             p_bot_id: botId,
             p_messages_sent: 1,
           });
        }
        
        result = { success: response.ok, message: response.result };
        break;
      }

      case "deleteMessage": {
        const { chatId, messageId } = params;
        const response = await telegramRequest(botToken, "deleteMessage", {
          chat_id: chatId,
          message_id: messageId,
        });
        result = { success: response.ok };
        break;
      }

      case "banChatMember": {
        const { chatId, userId, untilDate } = params;
        const response = await telegramRequest(botToken, "banChatMember", {
          chat_id: chatId,
          user_id: userId,
          until_date: untilDate,
        });
        result = { success: response.ok };
        break;
      }

      case "restrictChatMember": {
        const { chatId, userId, permissions, untilDate } = params;
        const response = await telegramRequest(botToken, "restrictChatMember", {
          chat_id: chatId,
          user_id: userId,
          permissions: permissions || { can_send_messages: false },
          until_date: untilDate,
        });
        result = { success: response.ok };
        break;
      }

      case "healthCheck": {
        const response = await telegramRequest(botToken, "getMe");
        const webhookInfo = await telegramRequest(botToken, "getWebhookInfo");
        
        const status = response.ok ? "online" : "offline";
        const webhookResult = webhookInfo.result as { url?: string; pending_update_count?: number } | undefined;
        
        if (botId) {
          await supabase
            .from("telegram_bots")
            .update({
              health_status: status,
              last_health_check: new Date().toISOString(),
              webhook_active: !!webhookResult?.url,
            })
            .eq("id", botId);
        }
        
        result = {
          success: response.ok,
          status,
          webhookActive: !!webhookResult?.url,
          pendingUpdates: webhookResult?.pending_update_count || 0,
        };
        break;
      }

      case "syncBot": {
        // Full sync: verify token, get info, set webhook
        const getMeResponse = await telegramRequest(botToken, "getMe");
        
        if (!getMeResponse.ok) {
          result = { success: false, error: "Token inválido: " + getMeResponse.description };
          break;
        }
        
        const botInfo = getMeResponse.result as { id: number; username: string; first_name: string };
        
        // Generate webhook URL
        const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
        const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/telegram-webhook?botId=${botId || "new"}`;
        
        // Set webhook
        const webhookResponse = await telegramRequest(botToken, "setWebhook", {
          url: webhookUrl,
          allowed_updates: ["message", "edited_message", "channel_post", "callback_query", "chat_member"],
        });
        
        if (botId) {
          // Update existing bot
          await supabase
            .from("telegram_bots")
            .update({
              bot_id: botInfo.id,
              bot_username: botInfo.username,
              name: botInfo.first_name,
              webhook_url: webhookUrl,
              webhook_active: webhookResponse.ok,
              health_status: "online",
              last_health_check: new Date().toISOString(),
            })
            .eq("id", botId);
        }
        
        result = {
          success: true,
          bot: {
            id: botInfo.id,
            username: botInfo.username,
            name: botInfo.first_name,
          },
          webhookUrl,
          webhookActive: webhookResponse.ok,
        };
        break;
      }

      case "createBot": {
        // Create new bot with token
        const { name, userId } = params;
        
        const getMeResponse = await telegramRequest(botToken, "getMe");
        
        if (!getMeResponse.ok) {
          result = { success: false, error: "Token inválido: " + getMeResponse.description };
          break;
        }
        
        const botInfo = getMeResponse.result as { id: number; username: string; first_name: string };
        
        // Insert bot with user_id
        const { data: newBot, error: insertError } = await supabase
          .from("telegram_bots")
          .insert({
            name: name || botInfo.first_name,
            token: botToken,
            bot_id: botInfo.id,
            bot_username: botInfo.username,
            health_status: "online",
            last_health_check: new Date().toISOString(),
            user_id: userId,
          })
          .select()
          .single();
        
        if (insertError) {
          result = { success: false, error: insertError.message };
          break;
        }
        
        // Generate and set webhook
        const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
        const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/telegram-webhook?botId=${newBot.id}`;
        
        await telegramRequest(botToken, "setWebhook", {
          url: webhookUrl,
          allowed_updates: ["message", "edited_message", "channel_post", "callback_query", "chat_member"],
        });
        
        await supabase
          .from("telegram_bots")
          .update({ webhook_url: webhookUrl, webhook_active: true })
          .eq("id", newBot.id);
        
        // Create default security settings with user_id
        await supabase
          .from("bot_security_settings")
          .insert({ bot_id: newBot.id, user_id: userId });
        
        result = {
          success: true,
          bot: newBot,
          webhookUrl,
        };
        break;
      }

      default:
        result = { error: `Ação desconhecida: ${action}` };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
