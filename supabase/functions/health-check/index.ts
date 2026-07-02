import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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

  const supabaseUrl = Deno.env.get('HUB_SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('HUB_SUPABASE_SERVICE_ROLE_KEY')!;
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
    
    // Busca estado anterior pra detectar transições (caiu/voltou)
    const { data: previous } = await supabase
      .from('edge_function_health')
      .select('details')
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevMap = new Map<string, string>();
    if (previous?.details && Array.isArray(previous.details)) {
      for (const f of previous.details as FunctionHealth[]) {
        prevMap.set(f.name, f.status);
      }
    }

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

    // Detecta transições e notifica APENAS na mudança de estado
    const caiu: FunctionHealth[] = [];
    const voltou: FunctionHealth[] = [];
    for (const f of healthChecks) {
      const prev = prevMap.get(f.name);
      if (!prev) continue; // primeira vez vista, não notifica
      if (prev === 'online' && f.status !== 'online') caiu.push(f);
      if (prev !== 'online' && f.status === 'online') voltou.push(f);
    }

    if (caiu.length > 0) {
      console.error('⚠️ Funções que caíram:', caiu.map(f => f.name).join(', '));
      await notifyViaCentral(supabase, 'erro', '🔴 Edge Function caiu', caiu);
    }
    if (voltou.length > 0) {
      console.log('✅ Funções que voltaram:', voltou.map(f => f.name).join(', '));
      await notifyViaCentral(supabase, 'sucesso', '🟢 Edge Function recuperada', voltou);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        transicoes: { caiu: caiu.map(f => f.name), voltou: voltou.map(f => f.name) },
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

// Dispara via notify-telegram (canal oficial). Não bate no Telegram direto.
async function notifyViaCentral(
  supabase: any,
  tipo: 'erro' | 'sucesso' | 'aviso' | 'critico' | 'info',
  titulo: string,
  funcs: FunctionHealth[]
) {
  try {
    const supabaseUrl = Deno.env.get('HUB_SUPABASE_URL')!;
    const notifyKey = Deno.env.get('NOTIFY_API_KEY');
    if (!notifyKey) {
      console.error('[health-check] NOTIFY_API_KEY ausente — alerta perdido');
      return;
    }

    const lista = funcs
      .map(f => `• ${f.name}${f.error ? ` — ${f.error}` : ''}`)
      .join('\n');
    const mensagem = `${funcs.length} função(ões) afetada(s):\n\n${lista}`;

    const resp = await fetch(`${supabaseUrl}/functions/v1/notify-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notify-key': notifyKey,
      },
      body: JSON.stringify({
        origem: 'health-check',
        tipo,
        titulo,
        mensagem,
        metadata: {
          funcoes: funcs.map(f => ({ name: f.name, status: f.status, error: f.error })),
        },
      }),
    });

    if (!resp.ok) {
      console.error('[health-check] notify-telegram falhou:', resp.status, await resp.text());
    }
  } catch (e) {
    console.error('[health-check] erro ao notificar:', e);
  }
}

