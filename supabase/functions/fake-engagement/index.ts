import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Interface para planos do banco
interface SubscriptionPlan {
  name: string;
  title: string;
  price: number;
}

// Interface para mensagens personalizadas
interface EngagementMessage {
  id: string;
  message_template: string;
  is_active: boolean;
  interval_minutes: number | null;
  last_sent_at: string | null;
}

// Mensagem padrão caso não tenha nenhuma cadastrada
const DEFAULT_MESSAGE_TEMPLATE = `🎉 *NOVA ASSINATURA!*

👤 *{nome}* acabou de assinar!
📋 Plano: *{plano}*
💰 Valor: *R$ {valor}*

🚀 Bem-vindo(a) à família! 🎊`

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


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parâmetros opcionais para controlar o comportamento
    let useDefaultMessage = false // Forçar uso da mensagem padrão de assinatura
    let specificMessageId: string | null = null // ID de uma mensagem específica para testar
    let onlyBotId: string | null = null // Limitar execução a um bot específico
    let forceSend = false // Ignorar intervalos e enviar imediatamente
    
    try {
      const body = await req.json()
      useDefaultMessage = body.useDefaultMessage === true
      specificMessageId = body.messageId || null
      onlyBotId = body.botId || null
      forceSend = body.forceSend === true
      console.log(`Parâmetros: useDefaultMessage=${useDefaultMessage}, specificMessageId=${specificMessageId}, botId=${onlyBotId}, forceSend=${forceSend}`)
    } catch {
      // Sem body ou body inválido - usar comportamento padrão
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar todos os bots com fake engagement habilitado
    let settingsQuery = supabase
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

    if (onlyBotId) {
      settingsQuery = settingsQuery.eq('bot_id', onlyBotId)
    }

    const { data: settings, error: settingsError } = await settingsQuery

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
      // Verificar intervalo global apenas se não usar mensagens individuais
      const globalIntervalMs = (setting.fake_engagement_interval_minutes || 30) * 60 * 1000
      const lastSent = setting.fake_engagement_last_sent 
        ? new Date(setting.fake_engagement_last_sent) 
        : new Date(0)

      // Buscar token do bot
      const { data: bot } = await supabase
        .from('telegram_bots')
        .select('token, bot_username, user_id')
        .eq('id', setting.bot_id)
        .single()

      if (!bot?.token) {
        console.log(`Bot ${setting.bot_id}: token não encontrado`)
        results.push({ bot_id: setting.bot_id, status: 'error', error: 'Token não encontrado' })
        continue
      }

      // Buscar planos REAIS do banco de dados
      const { data: realPlans } = await supabase
        .from('subscription_plans')
        .select('name, title, price')
        .eq('is_active', true)
        .eq('user_id', bot.user_id)
        .order('price')

      // Se não tiver planos do usuário, buscar planos sem user_id (globais)
      let plansToUse = realPlans
      if (!plansToUse || plansToUse.length === 0) {
        const { data: globalPlans } = await supabase
          .from('subscription_plans')
          .select('name, title, price')
          .eq('is_active', true)
          .is('user_id', null)
          .order('price')
        plansToUse = globalPlans
      }

      if (!plansToUse || plansToUse.length === 0) {
        console.log(`Bot ${setting.bot_id}: nenhum plano encontrado`)
        results.push({ bot_id: setting.bot_id, status: 'error', error: 'Nenhum plano cadastrado' })
        continue
      }

      // Sortear nome e plano REAL
      const customNames = setting.fake_engagement_names as string[] | undefined
      const randomName = generateRandomName(customNames)
      const randomPlan = plansToUse[Math.floor(Math.random() * plansToUse.length)]

      // Escolher mensagem baseado nos parâmetros
      let messageTemplate = DEFAULT_MESSAGE_TEMPLATE
      let selectedMessage: EngagementMessage | null = null
      
      // Se forçar mensagem padrão (do "Engajamento Automático"), usar sempre a padrão
      if (useDefaultMessage) {
        console.log(forceSend ? 'Usando mensagem padrão (forçado) - ignorando intervalo' : 'Usando mensagem padrão (forçado por parâmetro)')
        // Verificar intervalo global (a não ser que esteja forçado)
        if (!forceSend) {
          const timeSinceLastSent = now.getTime() - lastSent.getTime()
          if (timeSinceLastSent < globalIntervalMs) {
            console.log(`Bot ${setting.bot_id}: aguardando intervalo global (faltam ${Math.round((globalIntervalMs - timeSinceLastSent) / 60000)} min)`)
            results.push({ bot_id: setting.bot_id, status: 'waiting', minutes_left: Math.round((globalIntervalMs - timeSinceLastSent) / 60000) })
            continue
          }
        }
      } 
      // Se uma mensagem específica foi requisitada (teste individual)
      else if (specificMessageId) {
        const { data: specificMsg } = await supabase
          .from('engagement_messages')
          .select('id, message_template, is_active, interval_minutes, last_sent_at')
          .eq('id', specificMessageId)
          .single()
        
        if (specificMsg) {
          console.log(`Usando mensagem específica: ${specificMessageId}`)
          selectedMessage = specificMsg as EngagementMessage
          messageTemplate = specificMsg.message_template
        }
      }
      // Comportamento padrão do cron: processar AMBOS os sistemas independentemente
      else {
        // =====================================================
        // SISTEMA 1: Mensagens de Engajamento Personalizadas
        // Cada mensagem tem seu próprio intervalo e last_sent_at
        // =====================================================
        const { data: customMessages } = await supabase
          .from('engagement_messages')
          .select('id, message_template, is_active, interval_minutes, last_sent_at')
          .eq('bot_id', setting.bot_id)
          .eq('is_active', true)

        if (customMessages && customMessages.length > 0) {
          for (const msg of customMessages) {
            const msgInterval = (msg.interval_minutes || 30) * 60 * 1000
            const msgLastSent = msg.last_sent_at ? new Date(msg.last_sent_at) : new Date(0)
            const timeSinceMsgSent = now.getTime() - msgLastSent.getTime()
            
            console.log(`[Mensagem ${msg.id}] intervalo=${msg.interval_minutes}min, último envio=${msg.last_sent_at || 'nunca'}, tempo desde=${Math.round(timeSinceMsgSent/60000)}min`)
            
            if (timeSinceMsgSent >= msgInterval) {
              // Enviar esta mensagem personalizada
              const customMessage = msg.message_template
                .replace(/\{nome\}/g, randomName)
                .replace(/\{plano\}/g, randomPlan.title || randomPlan.name)
                .replace(/\{valor\}/g, Number(randomPlan.price).toFixed(2))

              const customButton = bot.bot_username ? {
                inline_keyboard: [[
                  { text: '💎 ADQUIRIR VIP', url: `https://t.me/${bot.bot_username}?start=planos` }
                ]]
              } : undefined

              const customResponse = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: setting.group_chat_id,
                  text: customMessage,
                  parse_mode: 'Markdown',
                  reply_markup: customButton
                })
              })

              const customResult = await customResponse.json()

              if (customResult.ok) {
                // Atualizar APENAS o last_sent_at desta mensagem específica
                await supabase
                  .from('engagement_messages')
                  .update({ last_sent_at: now.toISOString() })
                  .eq('id', msg.id)
                
                console.log(`[Mensagem Personalizada ${msg.id}] enviada com sucesso`)
                results.push({ 
                  bot_id: setting.bot_id, 
                  type: 'custom_message',
                  message_id: msg.id,
                  status: 'sent'
                })
              } else {
                console.error(`[Mensagem Personalizada ${msg.id}] erro:`, customResult)
                results.push({ 
                  bot_id: setting.bot_id, 
                  type: 'custom_message',
                  message_id: msg.id,
                  status: 'error', 
                  error: customResult.description 
                })
              }
            }
          }
        }

        // =====================================================
        // SISTEMA 2: Simulação de Assinatura (mensagem padrão)
        // Usa fake_engagement_interval_minutes e fake_engagement_last_sent
        // =====================================================
        const timeSinceLastSent = now.getTime() - lastSent.getTime()
        
        console.log(`[Simulação Assinatura] Bot ${setting.bot_id}: intervalo=${setting.fake_engagement_interval_minutes}min, último envio=${setting.fake_engagement_last_sent || 'nunca'}, tempo desde=${Math.round(timeSinceLastSent/60000)}min`)
        
        if (timeSinceLastSent < globalIntervalMs) {
          console.log(`[Simulação Assinatura] Bot ${setting.bot_id}: aguardando intervalo (faltam ${Math.round((globalIntervalMs - timeSinceLastSent) / 60000)} min)`)
          results.push({ 
            bot_id: setting.bot_id, 
            type: 'subscription_simulation',
            status: 'waiting', 
            minutes_left: Math.round((globalIntervalMs - timeSinceLastSent) / 60000) 
          })
          continue
        }
        
        console.log(`[Simulação Assinatura] Bot ${setting.bot_id}: enviando mensagem de simulação`)
        // messageTemplate já é DEFAULT_MESSAGE_TEMPLATE - continua o fluxo normal abaixo
      }

      // Substituir variáveis na mensagem
      const message = messageTemplate
        .replace(/\{nome\}/g, randomName)
        .replace(/\{plano\}/g, randomPlan.title || randomPlan.name)
        .replace(/\{valor\}/g, Number(randomPlan.price).toFixed(2))

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
        // Atualizar timestamp do último envio GLOBAL
        await supabase
          .from('bot_settings')
          .update({ fake_engagement_last_sent: now.toISOString() })
          .eq('id', setting.id)

        // Se foi uma mensagem personalizada, atualizar o last_sent_at INDIVIDUAL dela
        if (selectedMessage) {
          await supabase
            .from('engagement_messages')
            .update({ last_sent_at: now.toISOString() })
            .eq('id', selectedMessage.id)
          
          console.log(`Atualizado last_sent_at da mensagem ${selectedMessage.id}`)
        }

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
