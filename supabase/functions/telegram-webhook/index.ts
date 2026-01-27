import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    username?: string;
    first_name?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
  };
  text?: string;
  entities?: Array<{ type: string; offset: number; length: number }>;
  new_chat_members?: Array<{ id: number; username?: string; first_name?: string }>;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
}

// Link detection patterns
const LINK_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /t\.me\/[^\s]+/gi,
  /@[a-zA-Z0-9_]+/g,
];

function containsLink(text: string): boolean {
  return LINK_PATTERNS.some(pattern => pattern.test(text));
}

async function telegramRequest(token: string, method: string, body?: Record<string, unknown>): Promise<unknown> {
  const url = `${TELEGRAM_API}${token}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get botId from query params
    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");
    
    if (!botId) {
      console.error("No botId provided");
      return new Response("OK", { status: 200 });
    }

    // Get bot info and security settings
    const { data: bot } = await supabase
      .from("telegram_bots")
      .select("*, bot_security_settings(*)")
      .eq("id", botId)
      .single();

    if (!bot) {
      console.error("Bot not found:", botId);
      return new Response("OK", { status: 200 });
    }

    const update: TelegramUpdate = await req.json();
    console.log("Received update:", JSON.stringify(update).substring(0, 500));

    const message = update.message || update.edited_message || update.channel_post;
    
    if (!message) {
      return new Response("OK", { status: 200 });
    }

    const securitySettings = bot.bot_security_settings?.[0];
    let isBlocked = false;
    let blockedReason = "";

    // Store message in database
    const messageRecord = {
      bot_id: botId,
      telegram_message_id: message.message_id,
      chat_id: message.chat.id,
      chat_type: message.chat.type,
      from_user_id: message.from?.id,
      from_username: message.from?.username,
      from_first_name: message.from?.first_name,
      message_text: message.text,
      message_type: message.text ? "text" : "other",
      raw_data: update,
      is_blocked: false,
      blocked_reason: null as string | null,
    };

    // Apply security rules
    if (message.text && securitySettings) {
      // Anti-link check
      if (securitySettings.anti_link_enabled && containsLink(message.text)) {
        isBlocked = true;
        blockedReason = "link_detected";
        
        if (securitySettings.anti_link_action === "delete") {
          await telegramRequest(bot.token, "deleteMessage", {
            chat_id: message.chat.id,
            message_id: message.message_id,
          });
        }
        
        // Update analytics
        await supabase.from("bot_analytics").upsert({
          bot_id: botId,
          date: new Date().toISOString().split("T")[0],
          links_blocked: 1,
        }, { 
          onConflict: "bot_id,date",
          ignoreDuplicates: false,
        });
      }

      // Anti-spam check (rate limiting)
      if (securitySettings.anti_spam_enabled && message.from?.id) {
        const intervalAgo = new Date(Date.now() - securitySettings.anti_spam_interval_seconds * 1000).toISOString();
        
        const { count } = await supabase
          .from("telegram_messages")
          .select("*", { count: "exact", head: true })
          .eq("bot_id", botId)
          .eq("from_user_id", message.from.id)
          .gte("created_at", intervalAgo);

        if (count && count >= securitySettings.anti_spam_max_messages) {
          isBlocked = true;
          blockedReason = "spam_detected";
          
          if (securitySettings.anti_spam_action === "mute") {
            await telegramRequest(bot.token, "restrictChatMember", {
              chat_id: message.chat.id,
              user_id: message.from.id,
              permissions: { can_send_messages: false },
              until_date: Math.floor(Date.now() / 1000) + 300, // 5 min mute
            });
          } else if (securitySettings.anti_spam_action === "delete") {
            await telegramRequest(bot.token, "deleteMessage", {
              chat_id: message.chat.id,
              message_id: message.message_id,
            });
          }
          
          await supabase.from("bot_analytics").upsert({
            bot_id: botId,
            date: new Date().toISOString().split("T")[0],
            spam_detected: 1,
          }, { onConflict: "bot_id,date" });
        }
      }
    }

    // Handle new chat members (welcome message)
    if (message.new_chat_members && securitySettings?.welcome_message_enabled && securitySettings.welcome_message) {
      for (const member of message.new_chat_members) {
        const welcomeText = securitySettings.welcome_message
          .replace("{name}", member.first_name || member.username || "Usuário")
          .replace("{username}", member.username ? `@${member.username}` : "");
        
        await telegramRequest(bot.token, "sendMessage", {
          chat_id: message.chat.id,
          text: welcomeText,
          parse_mode: "HTML",
        });
        
        await supabase.from("bot_analytics").upsert({
          bot_id: botId,
          date: new Date().toISOString().split("T")[0],
          new_users: 1,
        }, { onConflict: "bot_id,date" });
      }
    }

    // Update message record with block status
    messageRecord.is_blocked = isBlocked;
    messageRecord.blocked_reason = blockedReason || null;

    // Save message
    await supabase.from("telegram_messages").insert(messageRecord);

    // Update analytics
    await supabase.from("bot_analytics").upsert({
      bot_id: botId,
      date: new Date().toISOString().split("T")[0],
      messages_received: 1,
      blocked_messages: isBlocked ? 1 : 0,
    }, { onConflict: "bot_id,date" });

    // Update bot health status
    await supabase
      .from("telegram_bots")
      .update({
        health_status: "online",
        last_health_check: new Date().toISOString(),
      })
      .eq("id", botId);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 }); // Always return 200 to Telegram
  }
});
