// Disparo de teste de efeito visual no privado do owner (master).
// Não confirma pagamento — só envia uma mensagem de teste com o efeito escolhido.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Mapa oficial — DEVE bater 1:1 com efi-webhook e com o painel.
const EFFECT_MAP: Record<string, string> = {
  fire:  '5104841245755180586', // 🔥
  like:  '5107584321108051014', // 👍
  heart: '5159385139981059251', // ❤️
  party: '5046509860389126442', // 🎉
}
const REACTION_MAP: Record<string, string> = {
  fire: '🔥', like: '👍', heart: '❤️', party: '🎉',
}
const VALID_EFFECTS = new Set([...Object.keys(EFFECT_MAP), 'none'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { botId, effect } = await req.json()

    if (!botId || typeof botId !== 'string') {
      return json({ error: 'botId é obrigatório' }, 400)
    }
    if (!effect || !VALID_EFFECTS.has(effect)) {
      return json({ error: `Efeito inválido. Permitidos: ${[...VALID_EFFECTS].join(', ')}` }, 400)
    }

    const supabase = createClient(
      Deno.env.get('HUB_SUPABASE_URL')!,
      Deno.env.get('HUB_SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: bot, error: botErr } = await supabase
      .from('telegram_bots')
      .select('token')
      .eq('id', botId)
      .single()
    if (botErr || !bot?.token) return json({ error: 'Bot não encontrado' }, 404)

    const { data: settings } = await supabase
      .from('bot_settings')
      .select('owner_ids')
      .eq('bot_id', botId)
      .single()

    const ownerId = settings?.owner_ids?.[0]
    if (!ownerId) return json({ error: 'Nenhum owner/master configurado neste bot' }, 400)

    const effectId = EFFECT_MAP[effect]
    const reaction = REACTION_MAP[effect]

    const text =
      `🧪 <b>Teste de Efeito Visual</b>\n\n` +
      `<pre>EFEITO    => ${effect.toUpperCase()}\n` +
      `EFFECT_ID => ${effectId ?? '(nenhum)'}\n` +
      `DISPARO   => Painel Admin\n` +
      `STATUS    => OK ✅</pre>\n\n` +
      `<i>Esta mensagem é apenas um teste — nenhum pagamento foi processado.</i>`

    const body: Record<string, unknown> = {
      chat_id: ownerId,
      text,
      parse_mode: 'HTML',
    }
    if (effectId) body.message_effect_id = effectId

    let res = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    let data = await res.json()

    // Fallback sem efeito caso o Telegram rejeite
    if (!data.ok && effectId) {
      delete body.message_effect_id
      res = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      data = await res.json()
    }

    if (!data.ok) {
      return json({ error: 'Telegram recusou a mensagem', details: data }, 502)
    }

    // Bot dá a curtida correspondente
    if (reaction) {
      await fetch(`https://api.telegram.org/bot${bot.token}/setMessageReaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ownerId,
          message_id: data.result.message_id,
          reaction: [{ type: 'emoji', emoji: reaction }],
          is_big: true,
        }),
      }).catch(() => {})
    }

    return json({ ok: true, sent_to: ownerId, effect, effect_id: effectId ?? null })
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500)
  }
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
