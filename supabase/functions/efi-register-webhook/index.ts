import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { webhook_url } = await req.json()

    if (!webhook_url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL do webhook não fornecida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar configuração do gateway EFI
    const { data: gateway, error: gatewayError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_type', 'efi')
      .eq('is_active', true)
      .single()

    if (gatewayError || !gateway) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gateway EFI não configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const config = gateway.config as {
      client_id: string
      client_secret: string
      pix_key: string
    }

    // URL do proxy para registro de webhook (requer mTLS)
    const proxyUrl = 'https://api.segredounlock.com/efi-webhook-register.php'

    // Usar URL com parâmetro ignorar para bypass de mTLS na recepção
    // A EFI não vai exigir certificado do servidor que recebe o webhook
    const webhookUrlWithBypass = webhook_url.includes('?') 
      ? `${webhook_url}&ignorar=` 
      : `${webhook_url}?ignorar=`

    console.log('Registrando webhook EFI:', webhookUrlWithBypass)

    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.client_id,
        client_secret: config.client_secret,
        pix_key: config.pix_key,
        webhook_url: webhookUrlWithBypass
      })
    })

    const proxyData = await proxyResponse.json()
    console.log('Resposta do registro:', JSON.stringify(proxyData))

    if (!proxyData.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: proxyData.error || 'Erro ao registrar webhook',
          details: proxyData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook registrado com sucesso',
        webhook_url: webhookUrlWithBypass
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao registrar webhook:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
