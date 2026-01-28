import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('Iniciando polling de transações EFI...')

    // Data de 24 horas atrás
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Buscar TODAS as transações das últimas 24 horas que ainda não foram confirmadas
    // Isso inclui pending E expired (caso tenham sido pagas após expirar no sistema)
    const { data: txsToCheck, error: txError } = await supabase
      .from('pix_transactions')
      .select('*')
      .eq('gateway', 'efi')
      .in('status', ['pending', 'expired'])
      .gt('created_at', last24h)
      .order('created_at', { ascending: false })
      .limit(100)

    if (txError) {
      console.error('Erro ao buscar transações:', txError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao buscar transações' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!txsToCheck || txsToCheck.length === 0) {
      console.log('Nenhuma transação para verificar nas últimas 24h')
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhuma transação para verificar', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Verificando ${txsToCheck.length} transações das últimas 24h...`)

    // Buscar configuração do gateway
    const { data: gateway } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_type', 'efi')
      .eq('is_active', true)
      .single()

    if (!gateway) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gateway EFI não configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const config = gateway.config as { 
      client_id: string
      client_secret: string 
    }

    // Usar o proxy unificado com action check_status
    const proxyUrl = 'https://api.segredounlock.com/efi-pix-proxy.php'

    let processed = 0
    let paid = 0
    const results: any[] = []

    for (const tx of txsToCheck) {
      try {
        const proxyResponse = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check_status',
            client_id: config.client_id,
            client_secret: config.client_secret,
            txid: tx.external_id
          })
        })

        // Tratar resposta como texto primeiro para verificar se é JSON válido
        const responseText = await proxyResponse.text()
        let proxyData
        try {
          proxyData = JSON.parse(responseText)
        } catch (e) {
          console.error(`Resposta inválida do proxy para ${tx.external_id}: ${responseText.substring(0, 100)}`)
          results.push({ txid: tx.external_id, error: 'Resposta inválida do proxy' })
          continue
        }
        const efiStatus = proxyData.data?.status || proxyData.status
        const isPaid = efiStatus === 'CONCLUIDA'

        processed++

        if (isPaid) {
          paid++
          
          // Atualizar transação
          await supabase
            .from('pix_transactions')
            .update({ 
              status: 'paid', 
              paid_at: new Date().toISOString(),
              e2e_id: proxyData.data?.pix?.[0]?.endToEndId
            })
            .eq('id', tx.id)

          // Atualizar pending_payments
          await supabase
            .from('pending_payments')
            .update({ status: 'PAID' })
            .eq('txid', tx.external_id)

          // Criar assinatura se telegram_user_id existir
          if (tx.telegram_user_id && tx.bot_id) {
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30)

            await supabase
              .from('telegram_subscriptions')
              .upsert({
                telegram_user_id: tx.telegram_user_id,
                bot_id: tx.bot_id,
                plan_code: 'custom',
                plan_name: tx.description || 'Assinatura',
                plan_days: 30,
                value: tx.amount,
                txid: tx.external_id,
                status: 'active',
                expires_at: expiresAt.toISOString()
              }, {
                onConflict: 'telegram_user_id,bot_id'
              })

            console.log(`Assinatura criada para usuário ${tx.telegram_user_id}`)
          }

          results.push({ txid: tx.external_id, status: 'paid' })
        } else {
          results.push({ txid: tx.external_id, status: 'pending', efiStatus })
        }

        // Pequeno delay entre requisições
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (err) {
        console.error(`Erro ao processar txid ${tx.external_id}:`, err)
        results.push({ txid: tx.external_id, error: String(err) })
      }
    }

    console.log(`Polling concluído: ${processed} processadas, ${paid} pagas`)

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        paid,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no polling:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
