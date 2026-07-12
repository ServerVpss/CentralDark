// Edge: hub-status (HUB Supabase / lyoigsqluyktoclwdaft)
// Status REAL e vivo do HUB — testa cada componente na hora (não cacheia, não confia
// em documentação), devolve JSON pra qualquer painel/CLI consumir.
// Sem auth (leitura de saúde é pública por natureza — nenhum dado sensível aqui).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

async function checarSchemaHub(url: string, anon: string) {
  const tabelas = ['contacts', 'messages', 'tickets', 'ticket_messages', 'whatsapp_connections', 'workspaces'];
  const cliente = createClient(url, anon);
  const resultados: Record<string, { ok: boolean; detalhe?: string }> = {};
  await Promise.all(tabelas.map(async (t) => {
    try {
      const { error } = await cliente.schema('api').from(t).select('*', { count: 'exact', head: true });
      resultados[t] = error ? { ok: false, detalhe: error.message.slice(0, 150) } : { ok: true };
    } catch (e) {
      resultados[t] = { ok: false, detalhe: String(e).slice(0, 150) };
    }
  }));
  return resultados;
}

async function checarAbacus() {
  const chave = Deno.env.get('ABACUS_API_KEY') || '';
  if (!chave) return { ok: false, detalhe: 'ABACUS_API_KEY ausente no ambiente da function' };
  try {
    const r = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chave}` },
      body: JSON.stringify({ model: 'gemini-3-flash-preview', messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) return { ok: true, http: r.status };
    const texto = await r.text();
    const semCredito = texto.includes('remaining credits');
    return { ok: false, http: r.status, detalhe: semCredito ? 'sem créditos' : texto.slice(0, 150) };
  } catch (e) {
    return { ok: false, detalhe: String(e).slice(0, 150) };
  }
}

async function checarArsenalAdapter() {
  try {
    const r = await fetch('https://api.centralldark.com/v1/models', { signal: AbortSignal.timeout(5000) });
    return { ok: r.ok, http: r.status };
  } catch (e) {
    return { ok: false, detalhe: String(e).slice(0, 150) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const URL_ = Deno.env.get('SUPABASE_URL')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

  const [schemaHub, abacus, arsenalAdapter] = await Promise.all([
    checarSchemaHub(URL_, ANON).catch(() => ({} as Record<string, unknown>)),
    checarAbacus(),
    checarArsenalAdapter(),
  ]);

  const componentes = {
    schema_hub_tabelas: schemaHub,
    abacus_routellm: abacus,
    arsenal_adapter: arsenalAdapter,
  };

  const todosOk = Object.values(schemaHub).every((v: any) => v?.ok !== false) && abacus.ok && arsenalAdapter.ok;

  return new Response(JSON.stringify({
    status: todosOk ? 'ok' : 'degraded',
    ts: new Date().toISOString(),
    componentes,
  }, null, 2), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
