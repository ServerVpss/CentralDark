import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type JsonResponse = {
  success: boolean;
  error?: string;
  details?: unknown;
  group_photo_url?: string | null;
  group_title?: string | null;
};

function ok(body: JsonResponse) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bot_id } = await req.json().catch(() => ({}));

    if (!bot_id) {
      return ok({ success: false, error: "bot_id é obrigatório" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Bot token
    const { data: bot, error: botError } = await supabase
      .from("telegram_bots")
      .select("token")
      .eq("id", bot_id)
      .single();

    if (botError || !bot?.token) {
      return ok({ success: false, error: "Bot não encontrado", details: botError });
    }

    // Group chat id
    const { data: settings, error: settingsError } = await supabase
      .from("bot_settings")
      .select("group_chat_id")
      .eq("bot_id", bot_id)
      .single();

    if (settingsError) {
      return ok({
        success: false,
        error: "Não foi possível carregar as configurações do bot",
        details: settingsError,
      });
    }

    if (!settings?.group_chat_id) {
      return ok({ success: false, error: "Nenhum grupo configurado" });
    }

    // Telegram getChat
    const chatRes = await fetch(`https://api.telegram.org/bot${bot.token}/getChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: settings.group_chat_id }),
    });

    const chatInfo = await chatRes.json().catch(() => null);

    if (!chatInfo?.ok) {
      return ok({
        success: false,
        error:
          chatInfo?.description ||
          "Falha ao obter informações do grupo (verifique se o bot está no grupo e tem permissão)",
        details: chatInfo,
      });
    }

    let groupPhotoUrl: string | null = null;

    if (chatInfo.result?.photo?.big_file_id) {
      const fileRes = await fetch(`https://api.telegram.org/bot${bot.token}/getFile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: chatInfo.result.photo.big_file_id }),
      });

      const fileInfo = await fileRes.json().catch(() => null);

      if (fileInfo?.ok && fileInfo.result?.file_path) {
        groupPhotoUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.result.file_path}`;
      }
    }

    // Update DB
    const { error: updateError } = await supabase
      .from("bot_settings")
      .update({
        group_photo_url: groupPhotoUrl,
        group_title: chatInfo.result?.title || null,
      })
      .eq("bot_id", bot_id);

    if (updateError) {
      return ok({
        success: false,
        error: "Erro ao salvar foto/título do grupo",
        details: updateError,
      });
    }

    return ok({
      success: true,
      group_photo_url: groupPhotoUrl,
      group_title: chatInfo.result?.title || null,
    });
  } catch (error) {
    return ok({ success: false, error: "Erro inesperado", details: String(error) });
  }
});

