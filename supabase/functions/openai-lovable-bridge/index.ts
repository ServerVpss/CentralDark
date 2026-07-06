// Bridge OpenAI-compatível → Lovable AI Gateway
// Usado pelo Open WebUI (ui.centralldark.com) pra plugar os 19 modelos da Lovable
// com uma única chave gerenciada aqui. A VPS nunca vê a LOVABLE_API_KEY.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
const BRIDGE_SECRET = Deno.env.get("WEBUI_LOVABLE_KEY");

// Catálogo oficial — 19 modelos que o WebUI vai listar no dropdown
const MODELOS = [
  // Google Gemini
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-pro-preview",
  "google/gemini-3.1-flash-lite",
  "google/gemini-3.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  // OpenAI GPT-5 família
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-5.2",
  "openai/gpt-5.4",
  "openai/gpt-5.4-mini",
  "openai/gpt-5.4-nano",
  "openai/gpt-5.4-pro",
  "openai/gpt-5.5",
  "openai/gpt-5.5-pro",
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function autorizado(req: Request): boolean {
  if (!BRIDGE_SECRET) return false;
  const auth = req.headers.get("authorization") || "";
  const chave = auth.replace(/^Bearer\s+/i, "").trim();
  return chave === BRIDGE_SECRET;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  // O caminho vem tipo /openai-lovable-bridge/v1/models ou /openai-lovable-bridge/v1/chat/completions
  const path = url.pathname.replace(/^\/functions\/v1/, "").replace(/^\/openai-lovable-bridge/, "");

  if (!LOVABLE_KEY) return json({ error: "LOVABLE_API_KEY ausente no ambiente" }, 500);
  if (!BRIDGE_SECRET) return json({ error: "WEBUI_LOVABLE_KEY ausente no ambiente" }, 500);
  if (!autorizado(req)) return json({ error: "Chave inválida" }, 401);

  // GET /v1/models  — Open WebUI usa isso pra popular o dropdown
  if (req.method === "GET" && path.endsWith("/models")) {
    return json({
      object: "list",
      data: MODELOS.map((id) => ({
        id,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: id.split("/")[0],
      })),
    });
  }

  // POST /v1/chat/completions — proxy pro Lovable Gateway trocando o header
  if (req.method === "POST" && path.endsWith("/chat/completions")) {
    const body = await req.text();
    const upstream = await fetch(LOVABLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_KEY,
        "X-Lovable-AIG-SDK": "openai-webui-bridge",
      },
      body,
    });

    // Stream de volta preservando content-type (SSE quando stream:true)
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      },
    });
  }

  return json({ error: "Rota não encontrada", path }, 404);
});
