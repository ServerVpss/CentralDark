import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELEGRAM_API = "https://api.telegram.org/bot";

async function sendTelegramMessage(token: string, chatId: number, text: string, replyMarkup?: object) {
  try {
    const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...(replyMarkup && { reply_markup: replyMarkup }),
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar mensagem Telegram:", error);
    return { ok: false };
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

    // Usar o proxy existente para verificar status
    const proxyUrl = 'https://api.segredounlock.com/efi-check-status.php'

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
        // PHP retorna status e pix diretamente na raiz (não dentro de data)
        const efiStatus = proxyData.status || proxyData.data?.status
        const isPaid = efiStatus === 'CONCLUIDA'

        processed++

        if (isPaid) {
          paid++
          
          // Atualizar transação
          // Extrair e2e_id do formato correto do PHP (pix na raiz)
          const pixArray = proxyData.pix || proxyData.data?.pix || []
          const e2eId = pixArray[0]?.endToEndId || null
          
          await supabase
            .from('pix_transactions')
            .update({ 
              status: 'paid', 
              paid_at: new Date().toISOString(),
              e2e_id: e2eId
            })
            .eq('id', tx.id)

          // Atualizar pending_payments
          await supabase
            .from('pending_payments')
            .update({ status: 'PAID' })
            .eq('txid', tx.external_id)

          // Buscar dados do pending_payment para pegar plan_days correto
          const { data: pendingPayment } = await supabase
            .from('pending_payments')
            .select('plan_days, plan_name, plan_code, plan_id, context, telegram_chat_id, telegram_message_id')
            .eq('txid', tx.external_id)
            .maybeSingle()

          const planDays = pendingPayment?.plan_days || 30
          const planName = pendingPayment?.plan_name || tx.description || 'Assinatura'
          const planCode = pendingPayment?.plan_code || 'custom'
          const context = (pendingPayment as any)?.context || 'group'
          const chatId = pendingPayment?.telegram_chat_id || tx.telegram_user_id

          // Criar assinatura se telegram_user_id existir
          let expiresAt: Date = new Date()
          if (tx.telegram_user_id && tx.bot_id) {
            const now = new Date()

            // STACK LOGIC: empilha dias se já existe assinatura ativa
            const { data: existingSub } = await supabase
              .from('telegram_subscriptions')
              .select('id, expires_at, status')
              .eq('telegram_user_id', tx.telegram_user_id)
              .eq('bot_id', tx.bot_id)
              .eq('context', context)
              .maybeSingle()

            const baseDate = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
              ? new Date(existingSub.expires_at)
              : now
            expiresAt = new Date(baseDate)
            expiresAt.setDate(expiresAt.getDate() + planDays)

            const startedAt = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
              ? undefined
              : now.toISOString()

            const subPayload: any = {
              telegram_user_id: tx.telegram_user_id,
              bot_id: tx.bot_id,
              context,
              plan_code: planCode,
              plan_name: planName,
              plan_days: planDays,
              value: tx.amount,
              txid: tx.external_id,
              status: 'active',
              expires_at: expiresAt.toISOString()
            }
            if (startedAt) subPayload.started_at = startedAt

            await supabase
              .from('telegram_subscriptions')
              .upsert(subPayload, {
                onConflict: 'telegram_user_id,bot_id,context'
              })

            console.log(`Assinatura criada para usuário ${tx.telegram_user_id}`)

            // Buscar token do bot para enviar notificação
            const { data: bot } = await supabase
              .from('telegram_bots')
              .select('token, bot_settings(group_url, group_chat_id)')
              .eq('id', tx.bot_id)
              .maybeSingle()

            if (bot?.token && chatId) {
              // Deletar mensagem do QR Code PIX antes de enviar confirmação
              if (pendingPayment?.telegram_message_id) {
                try {
                  await fetch(`${TELEGRAM_API}${bot.token}/deleteMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: chatId,
                      message_id: pendingPayment.telegram_message_id
                    }),
                  })
                  console.log(`Mensagem PIX deletada: ${pendingPayment.telegram_message_id}`)
                } catch (e) {
                  console.error("Erro ao deletar mensagem PIX:", e)
                }
              }

              const expiresAtFormatted = formatDate(expiresAt.toISOString())
              const isPrivate = context === 'private'
              const buttons: { text: string; callback_data?: string; url?: string }[][] = []

              const settings = bot.bot_settings as { group_url?: string; group_chat_id?: number } | null

              // Botões contextuais — privado NÃO mostra link do grupo
              if (isPrivate) {
                buttons.push([{ text: "🔍 Fazer Consulta Aqui", callback_data: "menu:query" }])
                buttons.push([{ text: "🏠 Menu Principal", callback_data: "menu:main" }])
              } else {
                if (settings?.group_url) {
                  buttons.push([{ text: "🚪 Entrar no Grupo VIP", url: settings.group_url }])
                }
                buttons.push([{ text: "🔍 Fazer Consulta", callback_data: "menu:query" }])
                buttons.push([{ text: "🏠 Menu Principal", callback_data: "menu:main" }])
              }

              const contextLabel = isPrivate ? '🔒 PRIVADO (chat com o bot)' : '👥 GRUPO VIP'
              const accessLine = isPrivate
                ? `🤖 <b>Acesso liberado AQUI no privado com o bot!</b>\n\n` +
                  `📍 Você comprou o plano <b>PRIVADO</b> — faça suas consultas direto nesta conversa.\n` +
                  `❌ <b>Este plano NÃO dá acesso ao grupo.</b> Para usar no grupo, adquira o plano de grupo separadamente.`
                : (settings?.group_chat_id
                    ? `🚪 <b>Seu acesso foi liberado no GRUPO VIP!</b>\n📍 Entre pelo botão abaixo e faça suas consultas no grupo.`
                    : `✅ <b>Assinatura ativada com sucesso!</b>`)

              await sendTelegramMessage(
                bot.token,
                chatId,
                `🎉 <b>PAGAMENTO CONFIRMADO!</b>\n\n` +
                `📦 Plano: <b>${planName}</b>\n` +
                `🎯 Tipo: <b>${contextLabel}</b>\n` +
                `💰 Valor: <b>R$ ${Number(tx.amount).toFixed(2)}</b>\n` +
                `📅 Válido até: <b>${expiresAtFormatted}</b>\n\n` +
                `🎫 TXID: <code>${tx.external_id}</code>\n\n` +
                `${accessLine}`,
                { inline_keyboard: buttons }
              )

              // Liberar usuário no grupo APENAS se não for plano privado
              if (!isPrivate && settings?.group_chat_id) {
                try {
                  await fetch(`${TELEGRAM_API}${bot.token}/restrictChatMember`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: settings.group_chat_id,
                      user_id: tx.telegram_user_id,
                      permissions: {
                        can_send_messages: true,
                        can_send_media_messages: true,
                        can_send_other_messages: true,
                        can_add_web_page_previews: true,
                      },
                    }),
                  })
                  console.log(`Usuário ${tx.telegram_user_id} liberado no grupo`)
                } catch (e) {
                  console.error("Erro ao liberar usuário no grupo:", e)
                }
              }

              console.log(`Notificação enviada para usuário ${tx.telegram_user_id}`)
            }
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
