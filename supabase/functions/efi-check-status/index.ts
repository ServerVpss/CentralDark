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
    let proxyData: {
      success?: boolean;
      data?: { status?: string; pix?: Array<{ endToEndId?: string }> };
      status?: string;
      pix?: Array<{ endToEndId?: string }>;
      error?: string;
    }
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

    // PHP retorna status e pix diretamente na raiz (não dentro de data)
    const efiStatus = proxyData.status || proxyData.data?.status
    const isPaid = efiStatus === 'CONCLUIDA'

    if (isPaid) {
      // Extrair e2e_id do formato correto do PHP (pix na raiz)
      const pixArray = proxyData.pix || proxyData.data?.pix || []
      const e2eId = pixArray[0]?.endToEndId || null
      
      // Atualizar status da transação
      await supabase
        .from('pix_transactions')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString(),
          e2e_id: e2eId
        })
        .eq('id', transaction.id)

      // Atualizar pending_payments se existir
      await supabase
        .from('pending_payments')
        .update({ status: 'CONCLUIDA' })
        .eq('txid', txid)

      // Criar/atualizar assinatura do Telegram se aplicável
      if (transaction.telegram_user_id && transaction.bot_id) {
        // Buscar pending para obter plan_days e context corretos
        const { data: pending } = await supabase
          .from('pending_payments')
          .select('plan_days, plan_name, plan_code, context')
          .eq('txid', txid)
          .maybeSingle()

        const planDays = (pending as any)?.plan_days ?? 30
        const planName = (pending as any)?.plan_name || transaction.description || 'Assinatura'
        const planCode = (pending as any)?.plan_code || 'custom'
        const context = (pending as any)?.context || 'group'

        const now = new Date()

        // STACK LOGIC: empilha dias se já existe assinatura ativa
        const { data: existingSub } = await supabase
          .from('telegram_subscriptions')
          .select('id, expires_at, status')
          .eq('telegram_user_id', transaction.telegram_user_id)
          .eq('bot_id', transaction.bot_id)
          .eq('context', context)
          .maybeSingle()

        const baseDate = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
          ? new Date(existingSub.expires_at)
          : now
        const expiresAt = new Date(baseDate)
        expiresAt.setDate(expiresAt.getDate() + planDays)

        const startedAt = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
          ? undefined
          : now.toISOString()

        const subPayload: any = {
          telegram_user_id: transaction.telegram_user_id,
          bot_id: transaction.bot_id,
          context,
          plan_code: planCode,
          plan_name: planName,
          plan_days: planDays,
          value: transaction.amount,
          txid,
          status: 'active',
          expires_at: expiresAt.toISOString()
        }
        if (startedAt) subPayload.started_at = startedAt

        await supabase
          .from('telegram_subscriptions')
          .upsert(subPayload, { onConflict: 'telegram_user_id,bot_id,context' })
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
