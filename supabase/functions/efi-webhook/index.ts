import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper para obter username do bot
async function getBotUsername(token: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const data = await res.json()
    return data.result?.username || null
  } catch {
    return null
  }
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
    const supabaseUrl = Deno.env.get('HUB_SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('HUB_SUPABASE_SERVICE_ROLE_KEY')!
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
        const context = (pending as any)?.context || 'group'

        const now = new Date()

        // STACK LOGIC: se já existe assinatura ativa para esse contexto, soma os dias
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
          ? undefined // preserva started_at original
          : now.toISOString()

        const subPayload: any = {
          telegram_user_id: transaction.telegram_user_id,
          bot_id: transaction.bot_id,
          context,
          plan_id: planId,
          plan_code: planCode,
          plan_name: planName,
          plan_days: planDays,
          value: transaction.amount,
          txid,
          status: 'active',
          expires_at: expiresAt.toISOString()
        }
        if (startedAt) subPayload.started_at = startedAt

        const { error: subError } = await supabase
          .from('telegram_subscriptions')
          .upsert(subPayload, {
            onConflict: 'telegram_user_id,bot_id,context'
          })

        if (subError) {
          console.error(`Erro ao criar assinatura:`, subError)
        } else {
          console.log(`Assinatura criada para telegram_user_id: ${transaction.telegram_user_id}`)
        }

        // ===== Crédito de indicação (5%) =====
        try {
          const { data: tgUser } = await supabase
            .from('telegram_users')
            .select('referred_by')
            .eq('telegram_user_id', transaction.telegram_user_id)
            .eq('bot_id', transaction.bot_id)
            .maybeSingle()

          const referrerId = tgUser?.referred_by ? Number(tgUser.referred_by) : null
          if (referrerId && referrerId !== Number(transaction.telegram_user_id)) {
            const commission = Math.round(Number(transaction.amount) * 0.05 * 100) / 100

            const { data: existingRef } = await supabase
              .from('telegram_referrals')
              .select('id')
              .eq('source_payment_id', transaction.id)
              .maybeSingle()

            if (!existingRef && commission > 0) {
              await supabase.from('telegram_referrals').insert({
                referrer_telegram_id: referrerId,
                referred_telegram_id: transaction.telegram_user_id,
                bot_id: transaction.bot_id,
                source_payment_id: transaction.id,
                commission_amount: commission,
                commission_rate: 5.00,
                paid_status: 'pending'
              })

              const { data: refUser } = await supabase
                .from('telegram_users')
                .select('referral_balance, referral_total_earned')
                .eq('telegram_user_id', referrerId)
                .eq('bot_id', transaction.bot_id)
                .maybeSingle()

              const newBalance = Number(refUser?.referral_balance || 0) + commission
              const newTotal = Number(refUser?.referral_total_earned || 0) + commission

              await supabase
                .from('telegram_users')
                .update({ referral_balance: newBalance, referral_total_earned: newTotal })
                .eq('telegram_user_id', referrerId)
                .eq('bot_id', transaction.bot_id)

              console.log(`💰 Comissão 5% (R$ ${commission}) creditada para indicador ${referrerId}`)
            }
          }
        } catch (refErr) {
          console.error('Erro ao processar indicação:', refErr)
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
            .select('group_chat_id, group_url, announce_payments, message_effect')
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
            const isPrivate = context === 'private'

            // Mensagem de confirmação contextual (privado vs grupo) — HTML + monoespaçado
            const contextLabel = isPrivate ? '🔒 PRIVADO (chat com o bot)' : '👥 GRUPO VIP'
            const accessLine = isPrivate
              ? `🤖 <b>Acesso liberado AQUI no privado com o bot!</b>\n\n` +
                `📍 Você comprou o plano <b>PRIVADO</b> — faça suas consultas direto nesta conversa.\n` +
                `❌ <b>Este plano NÃO dá acesso ao grupo.</b> Se quiser usar no grupo, é necessário adquirir o plano de grupo separadamente.`
              : `🚪 <b>Acesso liberado no GRUPO VIP!</b>\n\n` +
                `📍 Você comprou o plano de <b>GRUPO</b> — entre no grupo pelo botão abaixo e faça suas consultas por lá.`

            // Escape para HTML
            const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

            // Bloco monoespaçado alinhado (CHAVE => VALOR)
            const dataBlock =
              `VALOR  => R$ ${Number(transaction.amount).toFixed(2)}\n` +
              `PLANO  => ${esc(planName)}\n` +
              `TIPO   => ${isPrivate ? 'PRIVADO' : 'GRUPO VIP'}\n` +
              `DIAS   => ${planDaysMsg}\n` +
              `TXID   => ${esc(txid.slice(0, 12))}...`

            const message =
              `🎉🎊 <b>PAGAMENTO CONFIRMADO!</b> 🎊🎉\n\n` +
              `✅ Seu pagamento foi aprovado com sucesso!\n\n` +
              `<pre>${dataBlock}</pre>\n` +
              `🎯 ${esc(contextLabel)}\n\n` +
              `${accessLine}`

            // Botões contextuais — privado NÃO mostra link do grupo
            const inlineKeyboard: any = { inline_keyboard: [] }

            if (isPrivate) {
              inlineKeyboard.inline_keyboard.push([
                { text: '🔍 Fazer Consulta Aqui', callback_data: 'menu:query' }
              ])
              inlineKeyboard.inline_keyboard.push([
                { text: '🏠 Menu Principal', callback_data: 'menu:main' }
              ])
            } else if (settings?.group_url) {
              inlineKeyboard.inline_keyboard.push([
                { text: '🚪 Entrar no Grupo VIP', url: settings.group_url }
              ])
            } else if (settings?.group_chat_id) {
              inlineKeyboard.inline_keyboard.push([
                { text: '🚪 Entrar no Grupo VIP', callback_data: 'go_to_group' }
              ])
            }

            // SEMPRE enviar confirmação no PRIVADO do usuário (telegram_user_id)
            const targetChatId = transaction.telegram_user_id

            // Mapear efeito configurado para ID do Telegram (default = party)
            // IDs oficiais válidos (mesmos usados no telegram-webhook)
            const effectMap: Record<string, string> = {
              'fire': '5104841245755180586',      // 🔥
              'like': '5107584321108051014',      // 👍
              'heart': '5159385139981059251',     // ❤️
              'party': '5046509860389126442',     // 🎉  (corrigido — o ID antigo era inválido)
              'thumbs_up': '5107584321108051014', // 👍
            }
            const effectKey = (settings?.message_effect && settings.message_effect !== 'none')
              ? settings.message_effect
              : 'party'
            const messageEffectId = effectMap[effectKey]

            // Reação que o próprio bot dá na mensagem
            const reactionMap: Record<string, string> = {
              'fire': '🔥', 'like': '👍', 'heart': '❤️', 'party': '🎉', 'thumbs_up': '👍', 'none': '👍'
            }
            const reactionEmoji = reactionMap[effectKey] || '👍'

            const messageBody: any = {
              chat_id: targetChatId,
              text: message,
              parse_mode: 'HTML',
              reply_markup: inlineKeyboard.inline_keyboard.length > 0 ? inlineKeyboard : undefined
            }
            if (messageEffectId) messageBody.message_effect_id = messageEffectId

            let sendMsgRes = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(messageBody)
            })
            let sendMsgData = await sendMsgRes.json()

            // Retry sem efeito (alguns chats não suportam)
            if (!sendMsgData.ok && messageEffectId) {
              delete messageBody.message_effect_id
              sendMsgRes = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageBody)
              })
              sendMsgData = await sendMsgRes.json()
            }

            if (sendMsgData.ok) {
              console.log(`Confirmação enviada para chat ${targetChatId}`)
              const confMsgId = sendMsgData.result?.message_id
              if (confMsgId) {
                // Bot curte a própria mensagem de confirmação
                try {
                  await fetch(`https://api.telegram.org/bot${bot.token}/setMessageReaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: targetChatId,
                      message_id: confMsgId,
                      reaction: [{ type: 'emoji', emoji: reactionEmoji }],
                      is_big: true,
                    })
                  })
                } catch (reactErr) {
                  console.log('Não foi possível reagir:', reactErr)
                }
              }
            } else {
              console.error(`Erro ao enviar confirmação para ${targetChatId}:`, sendMsgData)
            }

            // Se tiver grupo configurado E NÃO for plano privado, libera o usuário no grupo
            if (!isPrivate && settings?.group_chat_id) {
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
                
                // Buscar username do bot para o link
                let botUsername = null
                try {
                  const meRes = await fetch(`https://api.telegram.org/bot${bot.token}/getMe`)
                  const meData = await meRes.json()
                  botUsername = meData.result?.username
                } catch {}
                
                // Botão para adquirir VIP (link para o bot no privado)
                const acquireButton = botUsername ? {
                  inline_keyboard: [[
                    { text: '💎 ADQUIRIR VIP', url: `https://t.me/${botUsername}?start=planos` }
                  ]]
                } : undefined
                
                // Nota: efeitos de mensagem não funcionam em grupos, então não usamos
                await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: settings.group_chat_id,
                    text: groupMessage,
                    parse_mode: 'Markdown',
                    reply_markup: acquireButton
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
