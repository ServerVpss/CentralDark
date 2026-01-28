import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PixRequest {
  action: 'create' | 'check' | 'confirm' | 'cancel' | 'webhook';
  planCode?: string;
  txid?: string;
  amount?: number;
  description?: string;
  planId?: string;
  planName?: string;
  planDays?: number;
  userId?: string;
  telegramUserId?: number;
  telegramChatId?: number;
  botId?: string;
  pix?: Array<{ txid: string; valor: string; horario: string }>;
}

const EFI_CLIENT_ID = Deno.env.get('EFI_CLIENT_ID');
const EFI_CLIENT_SECRET = Deno.env.get('EFI_CLIENT_SECRET');
const EFI_PIX_KEY = Deno.env.get('EFI_PIX_KEY');
const EFI_BASE_URL = 'https://pix.api.efipay.com.br';
const TELEGRAM_API = "https://api.telegram.org/bot";

async function getEfiToken(): Promise<string> {
  const credentials = btoa(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`);
  
  const response = await fetch(`${EFI_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grant_type: 'client_credentials' }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Efí token error:', errorText);
    throw new Error('Failed to get Efí token');
  }

  const data = await response.json();
  return data.access_token;
}

async function createPixCharge(value: number, description: string) {
  const token = await getEfiToken();
  const txid = generateTxid();
  
  const payload = {
    calendario: { expiracao: 3600 },
    devedor: { cpf: '00000000000', nome: 'Cliente' },
    valor: { original: value.toFixed(2) },
    chave: EFI_PIX_KEY,
    solicitacaoPagador: description,
  };

  const response = await fetch(`${EFI_BASE_URL}/v2/cob/${txid}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Efí create charge error:', error);
    throw new Error('Failed to create PIX charge');
  }

  const chargeData = await response.json();
  
  const qrResponse = await fetch(`${EFI_BASE_URL}/v2/loc/${chargeData.loc.id}/qrcode`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!qrResponse.ok) throw new Error('Failed to generate QR Code');

  const qrData = await qrResponse.json();

  return {
    txid: chargeData.txid,
    locId: chargeData.loc.id,
    status: chargeData.status,
    qrcode: qrData.qrcode,
    imagemQrcode: qrData.imagemQrcode,
    valor: value,
  };
}

async function checkPaymentStatus(txid: string) {
  const token = await getEfiToken();
  
  const response = await fetch(`${EFI_BASE_URL}/v2/cob/${txid}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to check payment status');

  return await response.json();
}

function generateTxid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let txid = '';
  for (let i = 0; i < 32; i++) {
    txid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return txid;
}

async function sendTelegramMessage(token: string, chatId: number, text: string, replyMarkup?: unknown) {
  return fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup }),
  });
}

async function deleteTelegramMessage(token: string, chatId: number, messageId: number) {
  return fetch(`${TELEGRAM_API}${token}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  });
}

async function unmuteTelegramUser(token: string, chatId: number, userId: number) {
  return fetch(`${TELEGRAM_API}${token}/restrictChatMember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId,
      permissions: { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true },
    }),
  });
}

// deno-lint-ignore no-explicit-any
async function processConfirmedPayment(supabase: any, txid: string) {
  console.log(`Processing confirmed payment: ${txid}`);

  const { data: payment } = await supabase
    .from('pending_payments')
    .select('*')
    .eq('txid', txid)
    .single();

  if (!payment || payment.status === 'CONCLUIDA') {
    console.log(`Payment ${txid} not found or already processed`);
    return;
  }

  await supabase.from('pending_payments').update({ status: 'CONCLUIDA' }).eq('txid', txid);

  const expiresAt = new Date(Date.now() + payment.plan_days * 24 * 60 * 60 * 1000).toISOString();
  
  await supabase.from('telegram_subscriptions').insert({
    telegram_user_id: payment.telegram_user_id,
    bot_id: payment.bot_id,
    plan_id: payment.plan_id,
    plan_code: payment.plan_code,
    plan_name: payment.plan_name,
    plan_days: payment.plan_days,
    value: payment.value,
    txid,
    started_at: new Date().toISOString(),
    expires_at: expiresAt,
    status: 'active',
  });

  await supabase.from('payment_history').insert({
    user_id: payment.user_id,
    plan_id: payment.plan_id,
    txid,
    amount: payment.value,
    payment_method: 'pix',
    status: 'completed',
  });

  console.log(`Subscription created for user ${payment.telegram_user_id}`);

  if (payment.bot_id) {
    const { data: bot } = await supabase
      .from('telegram_bots')
      .select('token, bot_username')
      .eq('id', payment.bot_id)
      .single();

    const { data: settings } = await supabase
      .from('bot_settings')
      .select('*')
      .eq('bot_id', payment.bot_id)
      .single();

    if (bot?.token && payment.telegram_chat_id) {
      if (payment.telegram_message_id) {
        try {
          await deleteTelegramMessage(bot.token, payment.telegram_chat_id, payment.telegram_message_id);
        } catch (e) {
          console.error('Failed to delete QR message:', e);
        }
      }

      if (settings?.group_chat_id) {
        try {
          await unmuteTelegramUser(bot.token, settings.group_chat_id, payment.telegram_user_id);
          console.log(`User ${payment.telegram_user_id} unmuted in group`);
        } catch (e) {
          console.error('Failed to unmute user:', e);
        }
      }

      const buttons: Array<{ text: string; callback_data?: string; url?: string }[]> = [];
      if (settings?.group_url) {
        buttons.push([{ text: '🚪 Entrar no Grupo', url: settings.group_url }]);
      }
      buttons.push([{ text: '🔍 Fazer Consulta', callback_data: 'menu:query' }]);
      buttons.push([{ text: '🏠 Menu Principal', callback_data: 'menu:main' }]);

      await sendTelegramMessage(
        bot.token,
        payment.telegram_chat_id,
        `🎉 <b>PAGAMENTO CONFIRMADO!</b>\n\n` +
        `📦 Plano: <b>${payment.plan_name}</b>\n` +
        `💰 Valor: <b>R$ ${Number(payment.value).toFixed(2)}</b>\n` +
        `📅 Válido até: <b>${new Date(expiresAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</b>\n\n` +
        `🎫 TXID: <code>${txid}</code>\n\n` +
        `${settings?.group_chat_id ? '🚪 <b>Seu acesso foi liberado no grupo!</b>' : '✅ <b>Assinatura ativada com sucesso!</b>'}`,
        { inline_keyboard: buttons }
      );

      if (settings?.group_chat_id && settings?.announce_payments) {
        try {
          let display = `ID: ${payment.telegram_user_id}`;
          try {
            const userResponse = await fetch(`${TELEGRAM_API}${bot.token}/getChat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: payment.telegram_user_id }),
            });
            const userData = await userResponse.json();
            if (userData.ok && userData.result) {
              if (userData.result.username) display = `@${userData.result.username}`;
              else if (userData.result.first_name) display = userData.result.first_name;
            }
          } catch (_e) { /* ignore */ }

          await sendTelegramMessage(
            bot.token,
            settings.group_chat_id,
            `🔥 <b>FISCAL</b>\n` +
            `🎉 <b>NOVA ASSINATURA ATIVADA!</b>\n\n` +
            `👤 <b>Usuário:</b> ${display}\n` +
            `📦 <b>Plano:</b> ${payment.plan_name}\n` +
            `⏰ <b>Duração:</b> ${payment.plan_days} dia(s)\n` +
            `💵 <b>Valor:</b> R$ ${Number(payment.value).toFixed(2)}\n` +
            `🆔 <b>ID:</b> <code>${txid}</code>\n\n` +
            `🎊 <b>Bem-vindo(a) ao grupo!</b>`,
            { inline_keyboard: [[{ text: '🛒 COMPRAR CONSULTAS', url: `https://t.me/${bot.bot_username}?start=assinar` }]] }
          );
        } catch (e) {
          console.error('Failed to announce in group:', e);
        }
      }
    }
  }

  console.log(`Payment ${txid} fully processed`);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    
    // Handle Efí webhook callback
    if (url.searchParams.get('webhook') === 'true') {
      console.log('Received Efí webhook notification');
      
      const requestData = await req.json();
      console.log('Webhook data:', JSON.stringify(requestData).substring(0, 500));
      
      if (requestData.pix && Array.isArray(requestData.pix)) {
        for (const pix of requestData.pix) {
          if (pix.txid) {
            await processConfirmedPayment(supabaseClient, pix.txid);
          }
        }
      }
      
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const authHeader = req.headers.get('Authorization');
    const isServiceRole = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    
    let userId: string | null = null;

    if (!isServiceRole) {
      const supabaseUser = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader! } } }
      );
      
      const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      userId = user.id;
    }

    const requestData: PixRequest = await req.json();
    const { action, planCode, txid } = requestData;

    // CREATE PIX CHARGE (from Telegram bot)
    if (action === 'create' && requestData.amount && requestData.telegramUserId) {
      console.log(`Creating PIX charge for Telegram user: ${requestData.telegramUserId}`);
      
      const { amount, description, planId, planCode: pCode, planName, planDays, telegramUserId, telegramChatId, botId } = requestData;
      userId = requestData.userId || userId;

      const pixCharge = await createPixCharge(Number(amount), description || `Plano - TelePanel`);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      await supabaseClient.from('pending_payments').insert({
        user_id: userId,
        plan_id: planId,
        plan_code: pCode,
        plan_name: planName,
        plan_days: planDays,
        txid: pixCharge.txid,
        loc_id: pixCharge.locId,
        value: amount,
        pix_qrcode: pixCharge.imagemQrcode,
        pix_copy_paste: pixCharge.qrcode,
        status: 'PENDING',
        expires_at: expiresAt,
        telegram_user_id: telegramUserId,
        telegram_chat_id: telegramChatId,
        bot_id: botId,
      });

      return new Response(JSON.stringify({
        success: true,
        txid: pixCharge.txid,
        qrcode: pixCharge.imagemQrcode,
        copyPaste: pixCharge.qrcode,
        expiresAt,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // CREATE PIX CHARGE (from web app)
    if (action === 'create' && planCode) {
      const { data: plan, error: planError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('code', planCode)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        return new Response(JSON.stringify({ error: 'Plan not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const pixCharge = await createPixCharge(Number(plan.price), `${plan.name} - TelePanel`);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      const { data: pendingPayment } = await supabaseClient.from('pending_payments').insert({
        user_id: userId,
        plan_id: plan.id,
        plan_code: plan.code,
        plan_name: plan.name,
        plan_days: plan.days,
        txid: pixCharge.txid,
        loc_id: pixCharge.locId,
        value: plan.price,
        pix_qrcode: pixCharge.imagemQrcode,
        pix_copy_paste: pixCharge.qrcode,
        status: 'PENDING',
        expires_at: expiresAt,
      }).select().single();

      return new Response(JSON.stringify({
        success: true,
        payment: {
          id: pendingPayment?.id,
          txid: pixCharge.txid,
          value: plan.price,
          planName: plan.name,
          planDays: plan.days,
          qrcode: pixCharge.qrcode,
          qrcodeImage: pixCharge.imagemQrcode,
          expiresAt,
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // CHECK PAYMENT STATUS
    if (action === 'check' && txid) {
      const status = await checkPaymentStatus(txid);
      const isPaid = status.status === 'CONCLUIDA';

      if (isPaid) {
        await processConfirmedPayment(supabaseClient, txid);
      }

      return new Response(JSON.stringify({ success: true, status: status.status, isPaid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // CANCEL PAYMENT
    if (action === 'cancel' && txid) {
      await supabaseClient.from('pending_payments').update({ status: 'CANCELLED' }).eq('txid', txid);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PIX payment error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});