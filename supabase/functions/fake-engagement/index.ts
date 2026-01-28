import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Planos disponíveis para sortear
const PLANS = [
  { name: 'Diário', price: 2.00 },
  { name: 'Semanal', price: 15.00 },
  { name: 'Quinzenal', price: 20.00 },
  { name: 'Mensal', price: 30.00 },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar todos os bots com fake engagement habilitado
    const { data: settings, error: settingsError } = await supabase
      .from('bot_settings')
      .select(`
        id,
        bot_id,
        group_chat_id,
        fake_engagement_enabled,
        fake_engagement_interval_minutes,
        fake_engagement_names,
        fake_engagement_last_sent
      `)
      .eq('fake_engagement_enabled', true)
      .not('group_chat_id', 'is', null)

    if (settingsError) {
      console.error('Erro ao buscar configurações:', settingsError)
      throw settingsError
    }

    if (!settings || settings.length === 0) {
      console.log('Nenhum bot com fake engagement habilitado')
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum bot configurado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: any[] = []
    const now = new Date()

    for (const setting of settings) {
      const intervalMs = (setting.fake_engagement_interval_minutes || 30) * 60 * 1000
      const lastSent = setting.fake_engagement_last_sent 
        ? new Date(setting.fake_engagement_last_sent) 
        : new Date(0)
      
      const timeSinceLastSent = now.getTime() - lastSent.getTime()
      
      // Verificar se já passou o intervalo
      if (timeSinceLastSent < intervalMs) {
        console.log(`Bot ${setting.bot_id}: aguardando intervalo (faltam ${Math.round((intervalMs - timeSinceLastSent) / 60000)} min)`)
        results.push({ bot_id: setting.bot_id, status: 'waiting', minutes_left: Math.round((intervalMs - timeSinceLastSent) / 60000) })
        continue
      }

      // Buscar token do bot
      const { data: bot } = await supabase
        .from('telegram_bots')
        .select('token, bot_username')
        .eq('id', setting.bot_id)
        .single()

      if (!bot?.token) {
        console.log(`Bot ${setting.bot_id}: token não encontrado`)
        results.push({ bot_id: setting.bot_id, status: 'error', error: 'Token não encontrado' })
        continue
      }

      // Sortear nome e plano
      const names = setting.fake_engagement_names || ['Cliente VIP']
      const randomName = names[Math.floor(Math.random() * names.length)]
      const randomPlan = PLANS[Math.floor(Math.random() * PLANS.length)]

      // Montar mensagem
      const message = `🎉 *NOVA ASSINATURA!*\n\n` +
        `👤 *${randomName}* acabou de assinar!\n` +
        `📋 Plano: *${randomPlan.name}*\n` +
        `💰 Valor: *R$ ${randomPlan.price.toFixed(2)}*\n\n` +
        `🚀 Bem-vindo(a) à família! 🎊`

      // Botão para adquirir VIP
      const acquireButton = bot.bot_username ? {
        inline_keyboard: [[
          { text: '💎 ADQUIRIR VIP', url: `https://t.me/${bot.bot_username}?start=planos` }
        ]]
      } : undefined

      // Enviar mensagem no grupo
      const response = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: setting.group_chat_id,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: acquireButton
        })
      })

      const result = await response.json()

      if (result.ok) {
        // Atualizar timestamp do último envio
        await supabase
          .from('bot_settings')
          .update({ fake_engagement_last_sent: now.toISOString() })
          .eq('id', setting.id)

        console.log(`Bot ${setting.bot_id}: mensagem enviada para ${setting.group_chat_id}`)
        results.push({ 
          bot_id: setting.bot_id, 
          status: 'sent', 
          name: randomName, 
          plan: randomPlan.name 
        })
      } else {
        console.error(`Bot ${setting.bot_id}: erro ao enviar`, result)
        results.push({ bot_id: setting.bot_id, status: 'error', error: result.description })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no fake engagement:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
