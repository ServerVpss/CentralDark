import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const TELEGRAM_API = 'https://api.telegram.org/bot'

interface ScheduledBroadcast {
  id: string
  user_id: string
  bot_id: string | null
  message_template: string
  target_audience: string
  target_user_ids: number[] | null
  scheduled_at: string
  status: string
  sent_count: number
  failed_count: number
}

// IDs de efeitos visuais do Telegram (fogos, curtida, coração, festa)
const MESSAGE_EFFECTS = [
  '5104841245755180586', // 🔥 fogo
  '5107584321108051014', // 👍 curtida
  '5159385139981059251', // ❤️ coração
  '5046509860389126442', // 🎉 festa/confete
  '5046463652866995212', // 👎 (descartado se quiser)
]

function pickEffectId(): string {
  // só os 4 positivos
  const positives = MESSAGE_EFFECTS.slice(0, 4)
  return positives[Math.floor(Math.random() * positives.length)]
}

async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  replyMarkup?: object
): Promise<boolean> {
  try {
    // Efeito visual só funciona em DMs (chat_id positivo). Grupos (negativo) ignoram.
    const isDM = Number(chatId) > 0
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }
    if (isDM) body.message_effect_id = pickEffectId()
    if (replyMarkup) body.reply_markup = replyMarkup

    const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = await response.json()
    if (!result.ok && isDM) {
      // fallback sem efeito caso o Telegram rejeite
      delete body.message_effect_id
      const retry = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const r2 = await retry.json()
      return r2.ok === true
    }
    return result.ok === true
  } catch (error) {
    console.error(`Erro ao enviar para ${chatId}:`, error)
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // 🔒 Só aceita chamadas com a service_role key (cron interno)
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!token || token !== serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }



  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()
    console.log(`[Scheduled Broadcasts] Verificando broadcasts pendentes em ${now}`)

    // Buscar broadcasts pendentes cuja data já passou
    const { data: broadcasts, error: fetchError } = await supabase
      .from('scheduled_broadcasts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('Erro ao buscar broadcasts:', fetchError)
      throw fetchError
    }

    if (!broadcasts || broadcasts.length === 0) {
      console.log('Nenhum broadcast pendente para enviar')
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum broadcast pendente', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Encontrados ${broadcasts.length} broadcasts para processar`)
    const results: any[] = []

    for (const broadcast of broadcasts as ScheduledBroadcast[]) {
      // Marcar como processing
      await supabase
        .from('scheduled_broadcasts')
        .update({ status: 'processing', updated_at: now })
        .eq('id', broadcast.id)

      // Buscar bot token
      const { data: bot } = await supabase
        .from('telegram_bots')
        .select('token, bot_username')
        .eq('id', broadcast.bot_id)
        .single()

      if (!bot?.token) {
        console.error(`Bot ${broadcast.bot_id} não encontrado`)
        await supabase
          .from('scheduled_broadcasts')
          .update({ 
            status: 'failed', 
            error_message: 'Bot não encontrado ou sem token',
            updated_at: new Date().toISOString()
          })
          .eq('id', broadcast.id)
        results.push({ id: broadcast.id, status: 'failed', error: 'Bot não encontrado' })
        continue
      }

      // Determinar lista de destinatários
      let userIds: number[] = []

      if (broadcast.target_user_ids && broadcast.target_user_ids.length > 0) {
        // IDs específicos fornecidos
        userIds = broadcast.target_user_ids
      } else {
        // Buscar por audiência
        let query = supabase
          .from('telegram_subscriptions')
          .select('telegram_user_id')
          .eq('bot_id', broadcast.bot_id)

        if (broadcast.target_audience === 'active') {
          query = query.eq('status', 'active')
        } else if (broadcast.target_audience === 'expired') {
          query = query.eq('status', 'expired')
        }
        // 'all' = sem filtro de status

        const { data: subs } = await query
        if (subs) {
          userIds = subs.map((s: any) => s.telegram_user_id)
        }

        // Se não tem assinantes, tentar buscar do grupo
        if (userIds.length === 0) {
          const { data: settings } = await supabase
            .from('bot_settings')
            .select('group_chat_id')
            .eq('bot_id', broadcast.bot_id)
            .single()

          if (settings?.group_chat_id) {
            // Enviar direto no grupo como fallback
            userIds = [settings.group_chat_id]
          }
        }
      }

      if (userIds.length === 0) {
        await supabase
          .from('scheduled_broadcasts')
          .update({ 
            status: 'completed', 
            sent_count: 0,
            error_message: 'Nenhum destinatário encontrado',
            updated_at: new Date().toISOString()
          })
          .eq('id', broadcast.id)
        results.push({ id: broadcast.id, status: 'completed', sent: 0, reason: 'Sem destinatários' })
        continue
      }

      console.log(`Broadcast ${broadcast.id}: enviando para ${userIds.length} destinatários`)

      let sentCount = 0
      let failedCount = 0

      for (const userId of userIds) {
        const success = await sendTelegramMessage(bot.token, userId, broadcast.message_template)
        if (success) {
          sentCount++
        } else {
          failedCount++
        }
        // Rate limiting: 30 msgs/s limit do Telegram
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Atualizar status final
      const finalStatus = failedCount === userIds.length ? 'failed' : 'completed'
      await supabase
        .from('scheduled_broadcasts')
        .update({ 
          status: finalStatus,
          sent_count: sentCount,
          failed_count: failedCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', broadcast.id)

      console.log(`Broadcast ${broadcast.id}: ${sentCount} enviados, ${failedCount} falhas`)
      results.push({ id: broadcast.id, status: finalStatus, sent: sentCount, failed: failedCount })
    }

    return new Response(
      JSON.stringify({ success: true, processed: broadcasts.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no scheduled broadcasts:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
