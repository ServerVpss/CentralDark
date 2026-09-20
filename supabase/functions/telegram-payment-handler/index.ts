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

  const supabaseUrl = Deno.env.get('HUB_SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('HUB_SUPABASE_SERVICE_ROLE_KEY')!;
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

      // Seleciona gateway ATIVO do dono do bot, com fallback automático
      const { data: activeGw } = await supabase
        .from('payment_gateways')
        .select('gateway_type, min_deposit')
        .eq('user_id', bot.user_id)
        .eq('is_active', true)
        .in('gateway_type', ['misticpay', 'efi'])
        .limit(1)
        .maybeSingle();
      const { data: allGw } = await supabase
        .from('payment_gateways')
        .select('gateway_type, min_deposit')
        .eq('user_id', bot.user_id)
        .in('gateway_type', ['misticpay', 'efi']);

      const primary = activeGw?.gateway_type ?? (allGw?.[0]?.gateway_type ?? 'efi');
      const order: string[] = [primary, ...(allGw || []).map(g => g.gateway_type).filter(g => g !== primary)];
      const endpointFor = (gw: string) => gw === 'misticpay' ? 'misticpay-generate-pix' : 'efi-generate-pix';

      let result: any = null;
      const tried = new Set<string>();
      for (const gw of order) {
        if (tried.has(gw)) continue;
        tried.add(gw);
        const gwInfo = (allGw || []).find(g => g.gateway_type === gw);
        if (gwInfo && Number(amount) < Number(gwInfo.min_deposit || 0)) continue;
        console.log(`[payment-handler] tentando gateway ${gw}`);
        const resp = await fetch(`${supabaseUrl}/functions/v1/${endpointFor(gw)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({ amount, user_id: userId, telegram_user_id: telegramUserId, bot_id: botId, plan_name: planName, plan_code: planCode, plan_days: planDays }),
        }).catch(() => null);
        if (!resp) continue;
        const r = await resp.json().catch(() => null);
        if (r?.success) { result = r; break; }
        console.warn(`[payment-handler] falha em ${gw}`, r);
      }

      if (!result?.success) {
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

          const context = (payment as any).context || 'group';
          const now = new Date();

          // STACK LOGIC: empilha dias se já existe assinatura ativa
          const { data: existingSub } = await supabase
            .from('telegram_subscriptions')
            .select('id, expires_at, status')
            .eq('telegram_user_id', telegramUserId)
            .eq('bot_id', botId)
            .eq('context', context)
            .maybeSingle();

          const baseDate = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
            ? new Date(existingSub.expires_at)
            : now;
          const expiresAtDate = new Date(baseDate.getTime() + payment.plan_days * 24 * 60 * 60 * 1000);
          const expiresAt = expiresAtDate.toISOString();

          const startedAt = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
            ? undefined
            : now.toISOString();

          const subPayload: any = {
            telegram_user_id: telegramUserId, bot_id: botId, context, plan_id: payment.plan_id,
            plan_code: payment.plan_code, plan_name: payment.plan_name, plan_days: payment.plan_days,
            value: payment.value, txid, status: 'active', expires_at: expiresAt,
          };
          if (startedAt) subPayload.started_at = startedAt;

          await supabase.from("telegram_subscriptions").upsert(subPayload, {
            onConflict: 'telegram_user_id,bot_id,context'
          });

          const { data: settings } = await supabase.from('bot_settings').select('group_chat_id').eq('bot_id', botId).single();

          // Só libera no grupo se NÃO for plano privado
          if (context !== 'private' && settings?.group_chat_id) {
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
