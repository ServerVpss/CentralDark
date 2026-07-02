// ai-proxy — cérebro compartilhado do darkai
// Recebe { prompt, system?, model? } e devolve { text }
// Usa LOVABLE_API_KEY (secret no Lovable Cloud) pra falar com o Lovable AI Gateway.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return json({ error: "LOVABLE_API_KEY não configurada" }, 500);
    }

    if (req.method !== "POST") {
      return json({ error: "Use POST" }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const system = typeof body?.system === "string" ? body.system : undefined;
    const model = typeof body?.model === "string" && body.model ? body.model : DEFAULT_MODEL;

    if (!prompt) {
      return json({ error: "campo 'prompt' obrigatório (string não vazia)" }, 400);
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const upstream = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    if (upstream.status === 429) {
      return json({ error: "rate_limited", detail: "Muitas requisições, espera um pouco." }, 429);
    }
    if (upstream.status === 402) {
      return json({ error: "sem_creditos", detail: "Créditos do Lovable AI esgotados." }, 402);
    }
    if (!upstream.ok) {
      const t = await upstream.text();
      return json({ error: "gateway_error", status: upstream.status, detail: t.slice(0, 500) }, 502);
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return json({ text, model });
  } catch (e) {
    return json({ error: "internal", detail: String(e?.message ?? e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
