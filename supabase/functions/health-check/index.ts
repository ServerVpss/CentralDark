import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface FunctionHealth {
  name: string;
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  error?: string;
  checkedAt: string;
}

// Lista de Edge Functions críticas para monitorar
const CRITICAL_FUNCTIONS = [
  'telegram-webhook',
  'telegram-bot',
  'telegram-format-result',
  'api-query',
  'efi-generate-pix',
  'efi-check-status',
  'efi-webhook',
  'efi-poll-pending',
  'telegram-payment-handler',
  'pix-payment',
];

async function checkFunction(baseUrl: string, functionName: string): Promise<FunctionHealth> {
  const startTime = Date.now();
  const checkedAt = new Date().toISOString();
  
  try {
    // Usar OPTIONS request para verificar se a função existe (não executa lógica)
    const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.status === 404) {
      return {
        name: functionName,
        status: 'offline',
        responseTime,
        error: 'Function not deployed (404)',
        checkedAt,
      };
    }
    
    // Status 200 ou 204 significa que a função existe
    if (response.ok || response.status === 204) {
      return {
        name: functionName,
        status: 'online',
        responseTime,
        checkedAt,
      };
    }
    
    // Outros status podem indicar erro
    return {
      name: functionName,
      status: 'error',
      responseTime,
      error: `Unexpected status: ${response.status}`,
      checkedAt,
    };
  } catch (error) {
    return {
      name: functionName,
      status: 'error',
      error: String(error),
      checkedAt,
    };
  }
}

// Função com retry para evitar falsos positivos durante deploys
async function checkFunctionWithRetry(
  baseUrl: string, 
  functionName: string
): Promise<FunctionHealth> {
  // Primeira verificação
  const firstCheck = await checkFunction(baseUrl, functionName);
  
  // Se online na primeira, retorna imediatamente
  if (firstCheck.status === 'online') {
    return firstCheck;
  }
  
  // Se offline/error, aguarda 10 segundos para retry
  console.log(`⏳ ${functionName} detectada offline, aguardando 10s para retry...`);
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Segunda verificação
  const retryCheck = await checkFunction(baseUrl, functionName);
  
  // Atualiza mensagem de erro para indicar que foi confirmado após retry
  if (retryCheck.status !== 'online') {
    retryCheck.error = `${retryCheck.error} (confirmado após retry)`;
  }
  
  return retryCheck;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Iniciando health check das Edge Functions...');
    
    // Verificar todas as funções em paralelo (com retry automático)
    const healthChecks = await Promise.all(
      CRITICAL_FUNCTIONS.map(fn => checkFunctionWithRetry(supabaseUrl, fn))
    );
    
    const onlineFunctions = healthChecks.filter(h => h.status === 'online');
    const offlineFunctions = healthChecks.filter(h => h.status === 'offline');
    const errorFunctions = healthChecks.filter(h => h.status === 'error');
    
    const summary = {
      timestamp: new Date().toISOString(),
      total: CRITICAL_FUNCTIONS.length,
      online: onlineFunctions.length,
      offline: offlineFunctions.length,
      errors: errorFunctions.length,
      allHealthy: offlineFunctions.length === 0 && errorFunctions.length === 0,
    };
    
    console.log('Health check summary:', JSON.stringify(summary));
    
    // Salvar resultado no banco de dados
    const { error: insertError } = await supabase
      .from('edge_function_health')
      .insert({
        checked_at: summary.timestamp,
        total_functions: summary.total,
        online_count: summary.online,
        offline_count: summary.offline,
        error_count: summary.errors,
        all_healthy: summary.allHealthy,
        details: healthChecks,
      });
    
    if (insertError) {
      console.error('Erro ao salvar health check:', insertError);
    }
    
    // Se houver funções offline, logar alerta
    if (offlineFunctions.length > 0) {
      console.error('⚠️ ALERTA: Funções offline detectadas:', 
        offlineFunctions.map(f => f.name).join(', '));
      
      // Notificar via Telegram se configurado
      await notifyOfflineFunctions(supabase, offlineFunctions);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        summary,
        functions: healthChecks,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erro no health check:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function notifyOfflineFunctions(
  supabase: ReturnType<typeof createClient>,
  offlineFunctions: FunctionHealth[]
) {
  try {
    // Buscar bots ativos para enviar alerta aos donos
    const { data: bots } = await supabase
      .from('telegram_bots')
      .select('token, user_id, bot_settings(owner_ids)')
      .eq('is_active', true)
      .limit(1);
    
    if (!bots || bots.length === 0) return;
    
    const bot = bots[0];
    const ownerIds = (bot.bot_settings as any)?.owner_ids || [];
    
    if (ownerIds.length === 0) return;
    
    const message = `⚠️ *ALERTA: Edge Functions Offline*\n\n` +
      `As seguintes funções estão indisponíveis:\n\n` +
      offlineFunctions.map(f => `❌ \`${f.name}\`\n   └ ${f.error || 'Não deployada'}`).join('\n\n') +
      `\n\n🔧 Acesse o painel para fazer o redeploy.`;
    
    // Notificar primeiro owner
    await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ownerIds[0],
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    
    console.log('Alerta enviado para owner:', ownerIds[0]);
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}
