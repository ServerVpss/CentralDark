import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Gerar CPF válido com dígitos verificadores
function generateValidCpf(): string {
  const randomDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  
  // Calcula primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (10 - i)
  }
  let d1 = 11 - (sum % 11)
  if (d1 >= 10) d1 = 0
  
  // Calcula segundo dígito verificador
  sum = 0
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (11 - i)
  }
  sum += d1 * 2
  let d2 = 11 - (sum % 11)
  if (d2 >= 10) d2 = 0
  
  return [...randomDigits, d1, d2].join('')
}

// Gerar TXID único
function generateTxid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 35; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      amount, 
      user_id, 
      telegram_user_id, 
      bot_id, 
      plan_name,
      plan_code,
      plan_days 
    } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valor inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar configuração do gateway EFI para o usuário
    const { data: gateway, error: gatewayError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_type', 'efi')
      .eq('is_active', true)
      .single()

    if (gatewayError || !gateway) {
      console.error('Gateway não encontrado:', gatewayError)
      return new Response(
        JSON.stringify({ success: false, error: 'Gateway EFI não configurado ou inativo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const config = gateway.config as { 
      client_id: string
      client_secret: string
      pix_key: string 
    }

    if (!config.client_id || !config.client_secret || !config.pix_key) {
      return new Response(
        JSON.stringify({ success: false, error: 'Credenciais EFI incompletas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const proxyUrl = gateway.proxy_url || 'https://api.segredounlock.com/efi-generate-pix.php'
    const localTxid = generateTxid() // TXID local para enviar, a Efí pode retornar um diferente
    const cpf = generateValidCpf()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Chamar proxy PHP para gerar PIX
    const proxyPayload = {
      client_id: config.client_id,
      client_secret: config.client_secret,
      pix_key: config.pix_key,
      txid: localTxid,
      amount: Number(amount).toFixed(2),
      expiracao: 600, // 10 minutos em segundos
      devedor: {
        cpf,
        nome: 'Cliente'
      },
      description: plan_name ? `Plano ${plan_name}` : 'Recarga de créditos'
    }

    console.log('Chamando proxy EFI:', proxyUrl)
    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proxyPayload)
    })

    const proxyData = await proxyResponse.json()
    console.log('Resposta do proxy:', JSON.stringify(proxyData))

    if (!proxyData.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: proxyData.error || 'Erro ao gerar PIX no proxy',
          details: proxyData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // IMPORTANTE: Usar o TXID que a Efí retorna, não o que geramos!
    // A Efí retorna o txid no campo data.txid
    const efiTxid = proxyData.data?.txid || localTxid
    console.log(`TXID local: ${localTxid}, TXID da Efí: ${efiTxid}`)

    // Salvar transação no banco com o TXID da Efí
    const { data: transaction, error: txError } = await supabase
      .from('pix_transactions')
      .insert({
        user_id: user_id || gateway.user_id,
        telegram_user_id,
        bot_id,
        amount,
        gateway: 'efi',
        external_id: efiTxid, // TXID da Efí
        loc_id: proxyData.data?.loc_id,
        qr_code_text: proxyData.data?.pixCopiaECola,
        qr_code_url: proxyData.data?.qrcode,
        status: 'pending',
        description: plan_name ? `${plan_name} - ${plan_days} dias` : 'Recarga',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (txError) {
      console.error('Erro ao salvar transação:', txError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao salvar transação', details: txError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Também salvar em pending_payments para compatibilidade com o sistema existente
    if (telegram_user_id && bot_id && user_id) {
      await supabase
        .from('pending_payments')
        .insert({
          user_id,
          bot_id,
          telegram_user_id,
          txid: efiTxid, // TXID da Efí
          value: amount,
          plan_name: plan_name || 'Recarga',
          plan_code: plan_code || 'custom',
          plan_days: plan_days || 30,
          pix_copy_paste: proxyData.data?.pixCopiaECola,
          pix_qrcode: proxyData.data?.qrcode,
          expires_at: expiresAt.toISOString(),
          status: 'PENDING'
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: transaction.id,
          txid: efiTxid, // Retornar o TXID da Efí
          amount,
          qr_code: proxyData.data?.pixCopiaECola,
          qr_code_image: proxyData.data?.qrcode,
          expires_at: expiresAt.toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na geração de PIX:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
