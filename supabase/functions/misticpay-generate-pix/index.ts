import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MISTICPAY_BASE = 'https://api.misticpay.com/api';

// Gerar CPF válido (igual EFI)
function generateValidCpf(): string {
  const r = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  let s = 0;
  for (let i = 0; i < 9; i++) s += r[i] * (10 - i);
  let d1 = 11 - (s % 11); if (d1 >= 10) d1 = 0;
  s = 0;
  for (let i = 0; i < 9; i++) s += r[i] * (11 - i);
  s += d1 * 2;
  let d2 = 11 - (s % 11); if (d2 >= 10) d2 = 0;
  return [...r, d1, d2].join('');
}

function generateLocalTxid(): string {
  return 'mpx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      amount,
      user_id,
      telegram_user_id,
      telegram_chat_id,
      bot_id,
      plan_name,
      plan_code,
      plan_days,
      context: paymentContext,
      payer_name,
      payer_document,
    } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Valor inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Buscar gateway MisticPay ativo
    const { data: gateway, error: gatewayError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_type', 'misticpay')
      .eq('is_active', true)
      .maybeSingle();

    if (gatewayError || !gateway) {
      return new Response(JSON.stringify({ success: false, error: 'Gateway MisticPay não configurado ou inativo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const config = gateway.config as { client_id: string; client_secret: string };
    if (!config.client_id || !config.client_secret) {
      return new Response(JSON.stringify({ success: false, error: 'Credenciais MisticPay incompletas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const localTxid = generateLocalTxid();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const webhookUrl = `${supabaseUrl}/functions/v1/misticpay-webhook`;

    const payerDoc = payer_document || generateValidCpf();
    const payerNm = payer_name || 'Cliente';

    const payload = {
      amount: Number(Number(amount).toFixed(2)),
      payerName: payerNm,
      payerDocument: payerDoc,
      transactionId: localTxid,
      description: plan_name ? `Plano ${plan_name}` : 'Recarga de créditos',
      projectWebhook: webhookUrl,
    };

    console.log('[misticpay] gerando transação:', JSON.stringify(payload));

    const mpResp = await fetch(`${MISTICPAY_BASE}/transactions/create`, {
      method: 'POST',
      headers: {
        'ci': config.client_id,
        'cs': config.client_secret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const mpData = await mpResp.json();
    console.log('[misticpay] resposta:', mpResp.status, JSON.stringify(mpData).slice(0, 400));

    if (!mpResp.ok || !mpData?.data?.copyPaste) {
      return new Response(JSON.stringify({
        success: false,
        error: mpData?.message || 'Erro ao gerar PIX na MisticPay',
        details: mpData,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ID retornado pela MisticPay
    const remoteTxid = String(mpData.data.transactionId);

    // Salvar pix_transactions (external_id = ID remoto da MisticPay)
    const { data: transaction, error: txError } = await supabase
      .from('pix_transactions')
      .insert({
        user_id: user_id || gateway.user_id,
        telegram_user_id,
        bot_id,
        amount,
        gateway: 'misticpay',
        external_id: remoteTxid,
        qr_code_text: mpData.data.copyPaste,
        qr_code_url: mpData.data.qrcodeUrl || mpData.data.qrCodeBase64,
        status: 'pending',
        description: plan_name ? `${plan_name} - ${plan_days} dias` : 'Recarga',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (txError) {
      console.error('[misticpay] erro ao salvar:', txError);
      return new Response(JSON.stringify({ success: false, error: 'Erro ao salvar transação', details: txError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // pending_payments (compatibilidade com EFI)
    if (telegram_user_id && bot_id && user_id) {
      const { data: tgUser } = await supabase
        .from('telegram_users')
        .select('username, first_name')
        .eq('telegram_user_id', telegram_user_id)
        .eq('bot_id', bot_id)
        .maybeSingle();

      await supabase.from('pending_payments').insert({
        user_id,
        bot_id,
        telegram_user_id,
        telegram_chat_id,
        txid: remoteTxid,
        value: amount,
        plan_name: plan_name || 'Recarga',
        plan_code: plan_code || 'custom',
        plan_days: plan_days || 30,
        pix_copy_paste: mpData.data.copyPaste,
        pix_qrcode: mpData.data.qrcodeUrl || mpData.data.qrCodeBase64,
        expires_at: expiresAt.toISOString(),
        status: 'PENDING',
        context: paymentContext || 'group',
        username: tgUser?.username ?? null,
        first_name: tgUser?.first_name ?? null,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: transaction.id,
        txid: remoteTxid,
        amount,
        qr_code: mpData.data.copyPaste,
        qr_code_image: mpData.data.qrcodeUrl || mpData.data.qrCodeBase64,
        expires_at: expiresAt.toISOString(),
        gateway: 'misticpay',
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[misticpay] erro:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
