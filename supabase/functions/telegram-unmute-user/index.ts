import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { telegramUserId, botId } = await req.json();

    if (!telegramUserId || !botId) {
      return new Response(JSON.stringify({ error: 'telegramUserId and botId are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: bot } = await supabase
      .from('telegram_bots')
      .select('token')
      .eq('id', botId)
      .single();

    const { data: settings } = await supabase
      .from('bot_settings')
      .select('group_chat_id')
      .eq('bot_id', botId)
      .single();

    if (!bot?.token || !settings?.group_chat_id) {
      return new Response(JSON.stringify({ error: 'Bot or group not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(`${TELEGRAM_API}${bot.token}/restrictChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.group_chat_id,
        user_id: telegramUserId,
        permissions: {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_other_messages: true,
          can_add_web_page_previews: true,
        },
      }),
    });

    const result = await response.json();
    console.log(`Unmute result for user ${telegramUserId}:`, result);

    if (result.ok) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: `User ${telegramUserId} unmuted in group ${settings.group_chat_id}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.description 
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Unmute error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
