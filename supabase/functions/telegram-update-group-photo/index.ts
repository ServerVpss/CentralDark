import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get bot token
    const { data: bot } = await supabase
      .from("telegram_bots")
      .select("token")
      .eq("id", bot_id)
      .single();

    if (!bot?.token) {
      return new Response(
        JSON.stringify({ error: "Bot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get group_chat_id
    const { data: settings } = await supabase
      .from("bot_settings")
      .select("group_chat_id")
      .eq("bot_id", bot_id)
      .single();

    if (!settings?.group_chat_id) {
      return new Response(
        JSON.stringify({ error: "No group configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get chat info
    const chatRes = await fetch(`https://api.telegram.org/bot${bot.token}/getChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: settings.group_chat_id }),
    });
    const chatInfo = await chatRes.json();

    if (!chatInfo.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to get chat info" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let groupPhotoUrl: string | null = null;

    if (chatInfo.result?.photo?.big_file_id) {
      const fileRes = await fetch(`https://api.telegram.org/bot${bot.token}/getFile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: chatInfo.result.photo.big_file_id }),
      });
      const fileInfo = await fileRes.json();

      if (fileInfo.ok && fileInfo.result?.file_path) {
        groupPhotoUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.result.file_path}`;
      }
    }

    // Update database
    await supabase
      .from("bot_settings")
      .update({ 
        group_photo_url: groupPhotoUrl,
        group_title: chatInfo.result?.title,
      })
      .eq("bot_id", bot_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        group_photo_url: groupPhotoUrl,
        group_title: chatInfo.result?.title,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
