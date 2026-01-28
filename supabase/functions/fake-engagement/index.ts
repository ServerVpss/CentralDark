import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Planos disponíveis para sortear (com variação de preço)
const PLANS = [
  { name: 'Diário', basePrice: 2.00, variation: 0.50 },
  { name: 'Semanal', basePrice: 15.00, variation: 2.00 },
  { name: 'Quinzenal', basePrice: 20.00, variation: 3.00 },
  { name: 'Mensal', basePrice: 30.00, variation: 5.00 },
  { name: 'Trimestral', basePrice: 75.00, variation: 10.00 },
  { name: 'Semestral', basePrice: 140.00, variation: 15.00 },
  { name: 'Anual', basePrice: 250.00, variation: 25.00 },
  { name: 'VIP Bronze', basePrice: 25.00, variation: 3.00 },
  { name: 'VIP Prata', basePrice: 45.00, variation: 5.00 },
  { name: 'VIP Ouro', basePrice: 80.00, variation: 8.00 },
  { name: 'VIP Diamante', basePrice: 150.00, variation: 15.00 },
]

// Nicks/apelidos para variar
const NICKS = [
  'brabo_022', 'rei_do_pix', 'magnata_sp', 'chefe_rj', 'boss_mg',
  'tubarao_df', 'monstro_ba', 'lenda_pr', 'crack_rs', 'fera_sc',
  'cria_ce', 'patrão_go', 'brabo_pe', 'sinistro_pa', 'gigante_am',
  'showman_mt', 'fenomeno_es', 'astro_rn', 'campeao_pb', 'mito_pi',
  'viking_013', 'samurai_021', 'ninja_011', 'guerreiro_031', 'titan_041',
  'phoenix_051', 'dragon_061', 'wolf_071', 'lion_081', 'eagle_091',
  'zl_brabo', 'zn_cria', 'zs_sinistro', 'zo_monstro', 'centro_top',
  'xd_games', 'pro_player', 'gamer_br', 'streamer_tv', 'youtuber_br',
  'trader_pix', 'investidor_br', 'crypto_king', 'nft_hunter', 'defi_master',
  'ceo_digital', 'empreendedor_', 'hustler_br', 'grinder_sp', 'closer_rj',
  'rei_vendas', 'top_afiliado', 'mkt_digital', 'growth_hacker', 'lead_hunter',
  'copywriter_', 'designer_br', 'dev_senior', 'tech_lead', 'data_scientist',
  'dark_mode', 'light_theme', 'code_master', 'bug_hunter', 'feature_king',
  'alfa_male', 'sigma_grind', 'beta_test', 'giga_chad', 'based_king',
  'real_og', 'true_boss', 'main_char', 'side_quest', 'final_boss',
]

// Primeiro nomes
const FIRST_NAMES = [
  // Masculinos
  'João', 'Pedro', 'Lucas', 'Rafael', 'Bruno', 'Gabriel', 'Thiago', 'Matheus',
  'Felipe', 'Gustavo', 'Leonardo', 'Carlos', 'André', 'Rodrigo', 'Fernando',
  'Vinícius', 'Diego', 'Marcelo', 'Ricardo', 'Alexandre', 'Henrique', 'Paulo',
  'Eduardo', 'Caio', 'Victor', 'Daniel', 'Leandro', 'Fábio', 'Roberto', 'Guilherme',
  'Renato', 'Sérgio', 'Anderson', 'Marcos', 'Adriano', 'Cristiano', 'Maurício',
  'Rogério', 'Luciano', 'Márcio', 'Wesley', 'Igor', 'Douglas', 'Jonathan',
  'Patrick', 'William', 'Bryan', 'Ryan', 'Kevin', 'Nathan', 'Enzo', 'Pietro',
  'Davi', 'Miguel', 'Arthur', 'Heitor', 'Bernardo', 'Samuel', 'Lorenzo',
  // Femininos
  'Maria', 'Ana', 'Juliana', 'Camila', 'Fernanda', 'Larissa', 'Beatriz', 'Amanda',
  'Letícia', 'Carolina', 'Gabriela', 'Isabela', 'Mariana', 'Bruna', 'Jéssica',
  'Aline', 'Vanessa', 'Patrícia', 'Tatiana', 'Priscila', 'Natália', 'Daniela',
  'Débora', 'Renata', 'Michele', 'Cristiane', 'Simone', 'Andréia', 'Luciana',
  'Cláudia', 'Sandra', 'Mônica', 'Rosana', 'Elaine', 'Adriana', 'Flávia',
  'Viviane', 'Carla', 'Roberta', 'Alessandra', 'Bianca', 'Thais', 'Mayara',
  'Sabrina', 'Rafaela', 'Lívia', 'Helena', 'Laura', 'Giovanna', 'Sophia',
  'Alice', 'Valentina', 'Cecília', 'Manuela', 'Lara', 'Lorena', 'Isadora',
]

// Sobrenomes variados
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
  'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado',
  'Mendes', 'Freitas', 'Cardoso', 'Ramos', 'Gonçalves', 'Santana', 'Teixeira',
  'Araújo', 'Pinto', 'Correia', 'Azevedo', 'Barros', 'Campos', 'Castro',
  'Melo', 'Moura', 'Monteiro', 'Cavalcanti', 'Cunha', 'Duarte', 'Farias',
  'Fonseca', 'Garcia', 'Guimarães', 'Leal', 'Miranda', 'Nogueira', 'Peixoto',
  'Reis', 'Sampaio', 'Siqueira', 'Tavares', 'Vasconcelos', 'Xavier', 'Brito',
  'Carneiro', 'Coelho', 'Cordeiro', 'Cruz', 'Dantas', 'Diniz', 'Domingues',
  'Esteves', 'Figueiredo', 'Franco', 'Galvão', 'Henriques', 'Jesus', 'Lacerda',
  'Leite', 'Macedo', 'Maciel', 'Maia', 'Mattos', 'Medeiros', 'Menezes',
  'Neto', 'Pacheco', 'Paiva', 'Passos', 'Prado', 'Queiroz', 'Resende',
  'Sales', 'Salles', 'Saraiva', 'Sena', 'Sousa', 'Toledo', 'Torres',
  'Trindade', 'Vargas', 'Vaz', 'Viana', 'Vianna', 'Vilela', 'Zanetti',
]

// Função para gerar nome aleatório
function generateRandomName(customNames?: string[]): string {
  // 70% chance de usar nome próprio, 30% de usar nick
  const useNick = Math.random() < 0.3
  
  if (useNick) {
    const nick = NICKS[Math.floor(Math.random() * NICKS.length)]
    // Adicionar número aleatório às vezes
    const addNumber = Math.random() < 0.5
    return addNumber ? `${nick}${Math.floor(Math.random() * 999)}` : nick
  }
  
  // Se tiver nomes customizados, usar 50% das vezes
  if (customNames && customNames.length > 0 && Math.random() < 0.5) {
    return customNames[Math.floor(Math.random() * customNames.length)]
  }
  
  // Gerar nome composto
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  
  // 30% chance de ter segundo sobrenome
  if (Math.random() < 0.3) {
    const secondLastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    return `${firstName} ${lastName} ${secondLastName}`
  }
  
  return `${firstName} ${lastName}`
}

// Função para gerar preço com variação
function generatePrice(plan: typeof PLANS[0]): number {
  const variation = (Math.random() - 0.5) * 2 * plan.variation
  return Math.max(plan.basePrice + variation, plan.basePrice * 0.8)
}

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

      // Sortear nome e plano com variação
      const customNames = setting.fake_engagement_names as string[] | undefined
      const randomName = generateRandomName(customNames)
      const randomPlan = PLANS[Math.floor(Math.random() * PLANS.length)]
      const randomPrice = generatePrice(randomPlan)

      // Montar mensagem
      const message = `🎉 *NOVA ASSINATURA!*\n\n` +
        `👤 *${randomName}* acabou de assinar!\n` +
        `📋 Plano: *${randomPlan.name}*\n` +
        `💰 Valor: *R$ ${randomPrice.toFixed(2)}*\n\n` +
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
