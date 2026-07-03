// Edge function: arsenal-proxy
// Proxy OpenAI-compat que roteia pra Lovable AI Gateway usando LOVABLE_API_KEY.
// Consumido pelo adapter Arsenal (VPS) — assim a key nunca sai do Cloud.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Mapeia nomes lógicos → modelos reais do Lovable AI Gateway
const MAP: Record<string, string> = {
  'gemini-3-flash-preview': 'google/gemini-2.5-flash',
  'gemini-3.1-flash-lite':  'google/gemini-2.5-flash-lite',
  'gemini-3.5-flash':       'google/gemini-2.5-flash',
  'gemini-3.1-pro-preview': 'google/gemini-2.5-pro',
  'gemini-2.5-pro':         'google/gemini-2.5-pro',
  'gemini-2.5-flash':       'google/gemini-2.5-flash',
  'gpt-5':                  'openai/gpt-5',
  'gpt-5-mini':             'openai/gpt-5-mini',
  'gpt-5-nano':             'openai/gpt-5-nano',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Auth simples: header X-Arsenal-Key deve bater com o valor esperado
  const providedKey = req.headers.get('x-arsenal-key') || '';
  const expectedKey = Deno.env.get('ARSENAL_PROXY_KEY') || 'arsenal-key-local-2026';
  if (providedKey !== expectedKey) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const LOVABLE_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_KEY) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY não configurada' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const modeloLogico = body.model || 'gemini-3-flash-preview';
    const modeloReal = MAP[modeloLogico] || modeloLogico;

    const r = await fetch(GATEWAY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_KEY}`,
      },
      body: JSON.stringify({
        model: modeloReal,
        messages: body.messages || [],
        stream: false,
      }),
    });

    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
