import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MISTICPAY_BASE = 'https://api.misticpay.com/api';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    let clientId = body?.client_id as string | undefined;
    let clientSecret = body?.client_secret as string | undefined;

    // Se não vier no body, buscar do banco
    if (!clientId || !clientSecret) {
      const supabaseUrl = Deno.env.get('HUB_SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('HUB_SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: gateway } = await supabase
        .from('payment_gateways')
        .select('config')
        .eq('gateway_type', 'misticpay')
        .maybeSingle();

      const cfg = gateway?.config as { client_id?: string; client_secret?: string } | null;
      clientId = clientId || cfg?.client_id;
      clientSecret = clientSecret || cfg?.client_secret;
    }

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ success: false, error: 'Credenciais ausentes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resp = await fetch(`${MISTICPAY_BASE}/users/info`, {
      method: 'GET',
      headers: { 'ci': clientId, 'cs': clientSecret, 'Content-Type': 'application/json' },
    });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return new Response(JSON.stringify({
        success: false,
        status: resp.status,
        error: data?.message || 'Credenciais inválidas ou erro na API MisticPay',
        details: data,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        name: data?.data?.name,
        email: data?.data?.email,
        document: data?.data?.document,
        accountVerified: data?.data?.accountVerified,
        availableBalance: data?.data?.availableBalance,
        blockedBalance: data?.data?.blockedBalance,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
