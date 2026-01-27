import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PixRequest {
  action: 'create' | 'check' | 'confirm' | 'cancel';
  planCode?: string;
  txid?: string;
  // New fields for Telegram integration
  amount?: number;
  description?: string;
  planId?: string;
  planName?: string;
  planDays?: number;
  userId?: string;
  telegramUserId?: number;
  telegramChatId?: number;
  botId?: string;
}

// Efí API Configuration
const EFI_CLIENT_ID = Deno.env.get('EFI_CLIENT_ID');
const EFI_CLIENT_SECRET = Deno.env.get('EFI_CLIENT_SECRET');
const EFI_PIX_KEY = Deno.env.get('EFI_PIX_KEY');
const EFI_BASE_URL = 'https://pix.api.efipay.com.br';

// Get Efí OAuth token
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

// Create immediate PIX charge
async function createPixCharge(value: number, description: string): Promise<{
  txid: string;
  locId: string;
  status: string;
  qrcode: string;
  imagemQrcode: string;
  valor: number;
}> {
  const token = await getEfiToken();
  const txid = generateTxid();
  
  const payload = {
    calendario: {
      expiracao: 3600, // 1 hour
    },
    devedor: {
      cpf: '00000000000',
      nome: 'Cliente',
    },
    valor: {
      original: value.toFixed(2),
    },
    chave: EFI_PIX_KEY,
    solicitacaoPagador: description,
  };

  console.log(`Creating PIX charge with txid: ${txid}, value: ${value}`);

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
  console.log(`Charge created, getting QR code for loc: ${chargeData.loc.id}`);
  
  // Get QR Code
  const qrResponse = await fetch(`${EFI_BASE_URL}/v2/loc/${chargeData.loc.id}/qrcode`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!qrResponse.ok) {
    const qrError = await qrResponse.text();
    console.error('QR code error:', qrError);
    throw new Error('Failed to generate QR Code');
  }

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

// Check payment status
async function checkPaymentStatus(txid: string): Promise<{ status: string; [key: string]: unknown }> {
  const token = await getEfiToken();
  
  const response = await fetch(`${EFI_BASE_URL}/v2/cob/${txid}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Check payment error:', error);
    throw new Error('Failed to check payment status');
  }

  return await response.json();
}

// Generate unique TXID
function generateTxid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let txid = '';
  for (let i = 0; i < 32; i++) {
    txid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return txid;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a service role request (from other edge functions)
    const authHeader = req.headers.get('Authorization');
    const isServiceRole = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      isServiceRole 
        ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        : Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      isServiceRole ? {} : {
        global: {
          headers: { Authorization: authHeader! },
        },
      }
    );

    let userId: string | null = null;

    // For non-service-role requests, get authenticated user
    if (!isServiceRole) {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

      // Create PIX charge
      const pixCharge = await createPixCharge(
        Number(amount),
        description || `Plano - TelePanel`
      );

      // Save pending payment with Telegram info
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      const { error: saveError } = await supabaseClient
        .from('pending_payments')
        .insert({
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

      if (saveError) {
        console.error('Error saving pending payment:', saveError);
        throw new Error('Failed to save payment');
      }

      console.log(`PIX charge created for Telegram: ${pixCharge.txid}`);

      return new Response(
        JSON.stringify({
          success: true,
          txid: pixCharge.txid,
          qrcode: pixCharge.imagemQrcode,
          copyPaste: pixCharge.qrcode,
          expiresAt,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CREATE PIX CHARGE (from web app with planCode)
    if (action === 'create' && planCode) {
      console.log(`Creating PIX charge for plan: ${planCode}, user: ${userId}`);
      
      // Get plan details
      const { data: plan, error: planError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('code', planCode)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        return new Response(
          JSON.stringify({ error: 'Plan not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create PIX charge
      const pixCharge = await createPixCharge(
        Number(plan.price),
        `${plan.name} - TelePanel`
      );

      // Save pending payment
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      const { data: pendingPayment, error: saveError } = await supabaseClient
        .from('pending_payments')
        .insert({
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
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving pending payment:', saveError);
        throw new Error('Failed to save payment');
      }

      console.log(`PIX charge created: ${pixCharge.txid}`);

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: pendingPayment.id,
            txid: pixCharge.txid,
            value: plan.price,
            planName: plan.name,
            planDays: plan.days,
            qrcode: pixCharge.qrcode,
            qrcodeImage: pixCharge.imagemQrcode,
            expiresAt,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHECK PAYMENT STATUS
    if (action === 'check' && txid) {
      console.log(`Checking payment status: ${txid}`);
      
      const status = await checkPaymentStatus(txid);
      const isPaid = status.status === 'CONCLUIDA';

      if (isPaid && !isServiceRole) {
        // Get pending payment
        const { data: payment } = await supabaseClient
          .from('pending_payments')
          .select('*')
          .eq('txid', txid)
          .single();

        if (payment && payment.status !== 'PAID') {
          // Update pending payment status
          await supabaseClient
            .from('pending_payments')
            .update({ status: 'PAID' })
            .eq('txid', txid);

          // Create subscription
          const expiresAt = new Date(Date.now() + payment.plan_days * 24 * 60 * 60 * 1000).toISOString();
          
          await supabaseClient
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              plan_id: payment.plan_id,
              plan_code: payment.plan_code,
              plan_name: payment.plan_name,
              plan_days: payment.plan_days,
              txid: txid,
              value: payment.value,
              status: 'active',
              expires_at: expiresAt,
            });

          // Log payment history
          await supabaseClient
            .from('payment_history')
            .insert({
              user_id: userId,
              plan_id: payment.plan_id,
              txid: txid,
              amount: payment.value,
              payment_method: 'pix',
              status: 'completed',
              gateway_response: status,
            });

          console.log(`Payment confirmed: ${txid}`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: status.status,
          isPaid,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CANCEL PAYMENT
    if (action === 'cancel' && txid) {
      const query = supabaseClient
        .from('pending_payments')
        .update({ status: 'CANCELLED' })
        .eq('txid', txid);
      
      if (userId) {
        query.eq('user_id', userId);
      }
      
      await query;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PIX payment error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
