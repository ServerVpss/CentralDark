import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Permitir GET para verificação de saúde do webhook
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'EFI Webhook endpoint active' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    console.log('Webhook EFI recebido:', JSON.stringify(body))

    // O webhook da EFI envia um array de transações PIX
    const pixArray = body.pix || []

    if (!pixArray.length) {
      console.log('Nenhuma transação PIX no webhook')
      return new Response(
        JSON.stringify({ success: true, message: 'No pix transactions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: any[] = []

    for (const pix of pixArray) {
      const txid = pix.txid
      const valor = pix.valor
      const endToEndId = pix.endToEndId

      console.log(`Processando PIX: txid=${txid}, valor=${valor}, e2e=${endToEndId}`)

      if (!txid) {
        results.push({ error: 'txid não fornecido' })
        continue
      }

      // Buscar transação pelo txid
      const { data: transaction, error: txError } = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('external_id', txid)
        .single()

      if (txError || !transaction) {
        console.log(`Transação não encontrada para txid: ${txid}`)
        results.push({ txid, error: 'Transação não encontrada' })
        continue
      }

      // Já está paga?
      if (transaction.status === 'paid') {
        console.log(`Transação ${txid} já está paga`)
        results.push({ txid, status: 'already_paid' })
        continue
      }

      // Atualizar transação como paga
      const { error: updateError } = await supabase
        .from('pix_transactions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          e2e_id: endToEndId
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error(`Erro ao atualizar transação ${txid}:`, updateError)
        results.push({ txid, error: 'Erro ao atualizar' })
        continue
      }

      // Atualizar pending_payments
      await supabase
        .from('pending_payments')
        .update({ status: 'PAID' })
        .eq('txid', txid)

      // Criar/atualizar assinatura se telegram_user_id existir
      if (transaction.telegram_user_id && transaction.bot_id) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const { error: subError } = await supabase
          .from('telegram_subscriptions')
          .upsert({
            telegram_user_id: transaction.telegram_user_id,
            bot_id: transaction.bot_id,
            plan_code: 'custom',
            plan_name: transaction.description || 'Assinatura PIX',
            plan_days: 30,
            value: transaction.amount,
            txid,
            status: 'active',
            expires_at: expiresAt.toISOString()
          }, {
            onConflict: 'telegram_user_id,bot_id'
          })

        if (subError) {
          console.error(`Erro ao criar assinatura:`, subError)
        } else {
          console.log(`Assinatura criada para telegram_user_id: ${transaction.telegram_user_id}`)
        }

        // Tentar enviar notificação via Telegram
        try {
          const { data: bot } = await supabase
            .from('telegram_bots')
            .select('token')
            .eq('id', transaction.bot_id)
            .single()

          if (bot?.token) {
            const message = `✅ *Pagamento Confirmado!*\n\n` +
              `💰 Valor: R$ ${Number(transaction.amount).toFixed(2)}\n` +
              `📋 Plano: ${transaction.description || 'Assinatura'}\n` +
              `🔑 TXID: \`${txid.slice(0, 12)}...\`\n\n` +
              `Seu acesso foi liberado! 🎉`

            await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: transaction.telegram_user_id,
                text: message,
                parse_mode: 'Markdown'
              })
            })

            console.log(`Notificação enviada para ${transaction.telegram_user_id}`)
          }
        } catch (notifyError) {
          console.error('Erro ao notificar via Telegram:', notifyError)
        }
      }

      results.push({ txid, status: 'paid', amount: valor })
    }

    console.log('Webhook processado:', JSON.stringify(results))

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no webhook EFI:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
