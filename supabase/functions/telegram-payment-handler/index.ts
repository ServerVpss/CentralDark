import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

async function telegramRequest(token: string, method: string, body?: Record<string, unknown>) {
  try {
    const response = await fetch(`${TELEGRAM_API}${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    return { ok: false, description: (error as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { action, amount, userId, telegramUserId, botId, planName, planCode, planDays, chatId, txid } = body;

    if (action === 'generatePix') {
      const { data: bot } = await supabase
        .from('telegram_bots')
        .select('token, bot_username, user_id')
        .eq('id', botId)
        .single();

      if (!bot) {
        return new Response(JSON.stringify({ error: 'Bot not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/efi-generate-pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
        body: JSON.stringify({ amount, user_id: userId, telegram_user_id: telegramUserId, bot_id: botId, plan_name: planName, plan_code: planCode, plan_days: planDays }),
      });

      const result = await response.json();
      if (!result.success) {
        return new Response(JSON.stringify({ error: 'PIX creation failed' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: plan } = await supabase.from('subscription_plans').select('id').eq('code', planCode).eq('user_id', bot.user_id).single();

      await supabase.from("pending_payments").insert({
        user_id: bot.user_id, bot_id: botId, telegram_user_id: telegramUserId, telegram_chat_id: chatId,
        txid: result.data.txid, value: amount, plan_id: plan?.id, plan_code: planCode, plan_name: planName, plan_days: planDays,
        pix_copy_paste: result.data.qr_code, pix_qrcode: result.data.qr_code_image,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), status: "PENDING",
      });

      return new Response(JSON.stringify({ success: true, ...result.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'checkPayment') {
      const { data: bot } = await supabase.from('telegram_bots').select('token, bot_username').eq('id', botId).single();
      if (!bot) {
        return new Response(JSON.stringify({ error: 'Bot not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/efi-check-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
        body: JSON.stringify({ txid }),
      });

      const result = await response.json();
      const status = result.status?.toUpperCase();
      const isPaid = status === "CONCLUIDA" || status === "PAID" || result.isPaid === true;

      if (isPaid) {
        const { data: payment } = await supabase
          .from('pending_payments')
          .select('*')
          .eq('txid', txid)
          .single();

        if (payment) {
          await supabase.from("pending_payments").update({ status: "CONCLUIDA" }).eq("txid", txid);
          const expiresAt = new Date(Date.now() + payment.plan_days * 24 * 60 * 60 * 1000).toISOString();

          await supabase.from("telegram_subscriptions").insert({
            telegram_user_id: telegramUserId, bot_id: botId, plan_id: payment.plan_id,
            plan_code: payment.plan_code, plan_name: payment.plan_name, plan_days: payment.plan_days,
            value: payment.value, txid, started_at: new Date().toISOString(), expires_at: expiresAt,
          });

          const { data: settings } = await supabase.from('bot_settings').select('group_chat_id').eq('bot_id', botId).single();

          if (settings?.group_chat_id) {
            await telegramRequest(bot.token, "restrictChatMember", {
              chat_id: settings.group_chat_id, user_id: telegramUserId,
              permissions: { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true },
            });
          }

          if (payment.telegram_message_id) {
            try { await telegramRequest(bot.token, "deleteMessage", { chat_id: chatId, message_id: payment.telegram_message_id }); } catch {}
          }

          return new Response(JSON.stringify({ success: true, status: 'CONCLUIDA', payment }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({ success: true, status: status || 'PENDING' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
