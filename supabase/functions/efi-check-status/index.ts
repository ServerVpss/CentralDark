import { createClient } from "jsr:@supabase/supabase-js@2";

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

    const { txid } = await req.json()

    if (!txid) {
      return new Response(
        JSON.stringify({ success: false, error: 'TXID não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar transação
    const { data: transaction, error: txError } = await supabase
      .from('pix_transactions')
      .select('*')
      .eq('external_id', txid)
      .single()

    if (txError || !transaction) {
      return new Response(
        JSON.stringify({ success: false, error: 'Transação não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Se já está paga, retornar
    if (transaction.status === 'paid') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'CONCLUIDA',
          isPaid: true,
          transaction 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar configuração do gateway
    const { data: gateway } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_type', 'efi')
      .eq('is_active', true)
      .single()

    if (!gateway) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gateway não configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const config = gateway.config as { 
      client_id: string
      client_secret: string
    }

    // URL do proxy existente para check-status
    const proxyUrl = 'https://api.segredounlock.com/efi-check-status.php'

    console.log('Checking payment status for txid:', txid)

    // Chamar proxy para verificar status
    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'check_status',
        client_id: config.client_id,
        client_secret: config.client_secret,
        txid
      })
    })

    const responseText = await proxyResponse.text()
    console.log('Proxy response:', responseText.substring(0, 500))

    // Verificar se a resposta é JSON válido
    let proxyData: { success?: boolean; data?: { status?: string; pix?: Array<{ endToEndId?: string }> }; status?: string; error?: string }
    try {
      proxyData = JSON.parse(responseText)
    } catch (_parseError) {
      console.error('Invalid JSON response from proxy')
      // Retornar status pendente se não conseguir verificar
      return new Response(
        JSON.stringify({
          success: true,
          status: 'pending',
          isPaid: false,
          efiStatus: 'ATIVA',
          message: 'Não foi possível verificar o status no momento'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Status check response:', JSON.stringify(proxyData))

    const efiStatus = proxyData.data?.status || proxyData.status
    const isPaid = efiStatus === 'CONCLUIDA'

    if (isPaid) {
      // Atualizar status da transação
      await supabase
        .from('pix_transactions')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString(),
          e2e_id: proxyData.data?.pix?.[0]?.endToEndId
        })
        .eq('id', transaction.id)

      // Atualizar pending_payments se existir
      await supabase
        .from('pending_payments')
        .update({ status: 'CONCLUIDA' })
        .eq('txid', txid)

      // Criar/atualizar assinatura do Telegram se aplicável
      if (transaction.telegram_user_id && transaction.bot_id) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // Default 30 dias

        await supabase
          .from('telegram_subscriptions')
          .upsert({
            telegram_user_id: transaction.telegram_user_id,
            bot_id: transaction.bot_id,
            plan_code: 'custom',
            plan_name: transaction.description || 'Assinatura',
            plan_days: 30,
            value: transaction.amount,
            txid,
            status: 'active',
            expires_at: expiresAt.toISOString()
          }, {
            onConflict: 'telegram_user_id,bot_id'
          })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: isPaid ? 'CONCLUIDA' : (efiStatus || 'EM_ABERTO'),
        isPaid,
        efiStatus,
        transaction: isPaid ? { ...transaction, status: 'paid' } : transaction
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
