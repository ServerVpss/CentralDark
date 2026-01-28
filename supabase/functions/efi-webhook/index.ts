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

      // Buscar transação pelo txid OU pelo txid contido no qr_code_text
      let transaction: any = null
      let txError: any = null

      // Primeiro tentar buscar pelo external_id exato
      const result1 = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('external_id', txid)
        .single()
      
      if (result1.data) {
        transaction = result1.data
      } else {
        // Se não encontrou, buscar pelo txid no qr_code_text (a Efí usa o txid dela no QR code)
        const result2 = await supabase
          .from('pix_transactions')
          .select('*')
          .like('qr_code_text', `%${txid}%`)
          .eq('status', 'pending')
          .single()
        
        if (result2.data) {
          transaction = result2.data
        } else {
          // Terceira tentativa: buscar transação pendente/expirada das últimas 24h com mesmo valor (sem restrição de expires_at)
          const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          const result3 = await supabase
            .from('pix_transactions')
            .select('*')
            .in('status', ['pending', 'expired'])
            .eq('amount', parseFloat(valor))
            .eq('gateway', 'efi')
            .gt('created_at', last24h)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (result3.data) {
            transaction = result3.data
            console.log(`Transação encontrada por valor: ${transaction.id}`)
          } else {
            // Quarta tentativa: buscar via pending_payments pelo valor e depois encontrar a pix_transaction
            const result4 = await supabase
              .from('pending_payments')
              .select('*')
              .eq('status', 'PENDING')
              .eq('value', parseFloat(valor))
              .gt('created_at', last24h)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            if (result4.data && result4.data.telegram_user_id) {
              const result5 = await supabase
                .from('pix_transactions')
                .select('*')
                .eq('telegram_user_id', result4.data.telegram_user_id)
                .in('status', ['pending', 'expired'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

              if (result5.data) {
                transaction = result5.data
                console.log(`Transação encontrada via pending_payments: ${transaction.id}`)
              } else {
                txError = 'not_found'
              }
            } else {
              txError = 'not_found'
            }
          }
        }
      }

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
      const { data: pending } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('txid', txid)
        .single()

      await supabase
        .from('pending_payments')
        .update({ status: 'PAID' })
        .eq('txid', txid)

      // Criar/atualizar assinatura se telegram_user_id existir
      if (transaction.telegram_user_id && transaction.bot_id) {
        const planDays = Number((pending as any)?.plan_days ?? 30)
        const planName = (pending as any)?.plan_name || transaction.description || 'Assinatura PIX'
        const planCode = (pending as any)?.plan_code || 'custom'
        const planId = (pending as any)?.plan_id || null

        const now = new Date()
        const expiresAt = new Date(now)
        expiresAt.setDate(expiresAt.getDate() + planDays)

        const { error: subError } = await supabase
          .from('telegram_subscriptions')
          .upsert({
            telegram_user_id: transaction.telegram_user_id,
            bot_id: transaction.bot_id,
            plan_id: planId,
            plan_code: planCode,
            plan_name: planName,
            plan_days: planDays,
            value: transaction.amount,
            txid,
            status: 'active',
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
          }, {
            onConflict: 'telegram_user_id,bot_id'
          })

        if (subError) {
          console.error(`Erro ao criar assinatura:`, subError)
        } else {
          console.log(`Assinatura criada para telegram_user_id: ${transaction.telegram_user_id}`)
        }

        // Tentar enviar notificação via Telegram + liberar no grupo automaticamente
        try {
          const { data: bot } = await supabase
            .from('telegram_bots')
            .select('token')
            .eq('id', transaction.bot_id)
            .single()

          const { data: settings } = await supabase
            .from('bot_settings')
            .select('group_chat_id, group_url, announce_payments')
            .eq('bot_id', transaction.bot_id)
            .single()

          if (bot?.token) {
            // Deletar a mensagem anterior do PIX (se tiver o message_id salvo)
            if ((pending as any)?.telegram_message_id && (pending as any)?.telegram_chat_id) {
              try {
                await fetch(`https://api.telegram.org/bot${bot.token}/deleteMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: (pending as any).telegram_chat_id,
                    message_id: (pending as any).telegram_message_id
                  })
                })
                console.log(`Mensagem PIX anterior deletada: ${(pending as any).telegram_message_id}`)
              } catch (delErr) {
                console.log('Não foi possível deletar mensagem anterior:', delErr)
              }
            }

            const planName = (pending as any)?.plan_name || transaction.description || 'Assinatura'
            const planDaysMsg = Number((pending as any)?.plan_days ?? 30)
            
            // Mensagem de confirmação com emojis de celebração
            const message = `🎉🎊 *PAGAMENTO CONFIRMADO!* 🎊🎉\n\n` +
              `✅ Seu pagamento foi aprovado com sucesso!\n\n` +
              `💰 *Valor:* R$ ${Number(transaction.amount).toFixed(2)}\n` +
              `📋 *Plano:* ${planName}\n` +
              `📅 *Dias:* ${planDaysMsg}\n` +
              `🔑 *TXID:* \`${txid.slice(0, 12)}...\`\n\n` +
              `🚀 *Seu acesso foi liberado!*\n\n` +
              `Clique no botão abaixo para fazer suas consultas! 👇`

            // Montar botão inline para ir ao grupo
            const inlineKeyboard: any = { inline_keyboard: [] }
            
            if (settings?.group_url) {
              inlineKeyboard.inline_keyboard.push([
                { text: '🔍 Fazer Consulta', url: settings.group_url }
              ])
            } else if (settings?.group_chat_id) {
              // Se não tiver URL mas tiver chat_id, tentar criar link
              inlineKeyboard.inline_keyboard.push([
                { text: '🔍 Fazer Consulta', callback_data: 'go_to_group' }
              ])
            }

            // Enviar mensagem com efeito de confete 🎉
            // ID do efeito "Festa/Confetti" do Telegram: 5046509860385561286
            const CONFETTI_EFFECT_ID = '5046509860385561286'
            
            await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: transaction.telegram_user_id,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: inlineKeyboard.inline_keyboard.length > 0 ? inlineKeyboard : undefined,
                message_effect_id: CONFETTI_EFFECT_ID
              })
            })

            // Se tiver grupo configurado, libera o usuário no grupo
            if (settings?.group_chat_id) {
              await fetch(`https://api.telegram.org/bot${bot.token}/restrictChatMember`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: settings.group_chat_id,
                  user_id: transaction.telegram_user_id,
                  permissions: {
                    can_send_messages: true,
                    can_send_media_messages: true,
                    can_send_polls: true,
                    can_send_other_messages: true,
                    can_add_web_page_previews: true,
                    can_change_info: false,
                    can_invite_users: true,
                    can_pin_messages: false,
                  },
                })
              })
            }

            // Anunciar pagamento no grupo se habilitado
            if (settings?.announce_payments && settings?.group_chat_id) {
              try {
                // Buscar info do usuário no Telegram
                const userInfoRes = await fetch(`https://api.telegram.org/bot${bot.token}/getChat`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chat_id: transaction.telegram_user_id })
                })
                const userInfo = await userInfoRes.json()
                const userName = userInfo.result?.first_name || `Usuário ${transaction.telegram_user_id}`
                
                const groupMessage = `🎉 *NOVA ASSINATURA!*\n\n` +
                  `👤 *${userName}* acabou de assinar!\n` +
                  `📋 Plano: *${planName}*\n` +
                  `💰 Valor: *R$ ${Number(transaction.amount).toFixed(2)}*\n\n` +
                  `🚀 Bem-vindo(a) à família! 🎊`
                
                await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: settings.group_chat_id,
                    text: groupMessage,
                    parse_mode: 'Markdown',
                    message_effect_id: CONFETTI_EFFECT_ID
                  })
                })
                console.log(`Anúncio de pagamento enviado no grupo ${settings.group_chat_id}`)
              } catch (announceErr) {
                console.error('Erro ao anunciar no grupo:', announceErr)
              }
            }

            console.log(`Notificação enviada e liberação aplicada para ${transaction.telegram_user_id}`)
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
