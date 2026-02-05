import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function telegramRequest(token: string, method: string, params: Record<string, unknown> = {}) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bot_id } = await req.json();

    if (!bot_id) {
      return new Response(
        JSON.stringify({ error: "bot_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get bot info
    const { data: bot, error: botError } = await supabase
      .from("telegram_bots")
      .select("token")
      .eq("id", bot_id)
      .single();

    if (botError || !bot) {
      return new Response(
        JSON.stringify({ error: "Bot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get bot settings
    const { data: settings, error: settingsError } = await supabase
      .from("bot_settings")
      .select("group_chat_id")
      .eq("bot_id", bot_id)
      .single();

    if (settingsError || !settings?.group_chat_id) {
      return new Response(
        JSON.stringify({ error: "No group configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get chat info from Telegram
    const chatInfo = await telegramRequest(bot.token, "getChat", { 
      chat_id: settings.group_chat_id 
    });

    if (!chatInfo.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to get chat info from Telegram" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let groupPhotoUrl: string | null = null;

    if (chatInfo.result?.photo?.big_file_id) {
      const fileInfo = await telegramRequest(bot.token, "getFile", { 
        file_id: chatInfo.result.photo.big_file_id 
      });

      if (fileInfo.ok && fileInfo.result?.file_path) {
        groupPhotoUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.result.file_path}`;
      }
    }

    // Update the database
    const { error: updateError } = await supabase
      .from("bot_settings")
      .update({ 
        group_photo_url: groupPhotoUrl,
        group_title: chatInfo.result?.title || null,
      })
      .eq("bot_id", bot_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update database" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        group_photo_url: groupPhotoUrl,
        group_title: chatInfo.result?.title,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
