// ai-proxy — cérebro compartilhado da CentralDark
//
// Duas caras, mesma edge function:
//
// 1) Legado (darkai CLI + Arsenal):
//    POST /ai-proxy       { prompt, system?, model? } -> { text }
//    Auth: header X-Arsenal-Key (compat antiga) OU sem auth (chamada interna)
//
// 2) OpenAI-compatible (Open WebUI, Cursor, qualquer cliente que fale OpenAI):
//    GET  /ai-proxy/v1/models
//    POST /ai-proxy/v1/chat/completions   (com streaming SSE)
//    Auth: Authorization: Bearer <WEBUI_LOVABLE_KEY>
//
// Em ambos os casos, o repasse pro Lovable AI Gateway usa LOVABLE_API_KEY (secret interna).

const GATEWAY_BASE = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

// Catálogo exposto no /v1/models (mantido curto e curado; adiciona quando quiser).
const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-pro-preview",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-arsenal-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) {
    return json({ error: "LOVABLE_API_KEY não configurada" }, 500);
  }

  const url = new URL(req.url);
  // path relativo à edge function (Supabase entrega tipo /ai-proxy/v1/models)
  const path = url.pathname.replace(/^.*\/ai-proxy/, "") || "/";

  try {
    // === Rota OpenAI-compatible: /v1/models ===
    if (req.method === "GET" && path === "/v1/models") {
      if (!authorizeOpenAI(req)) return unauthorized();
      return json({
        object: "list",
        data: MODELS.map((id) => ({
          id,
          object: "model",
          created: Math.floor(Date.now() / 1000),
          owned_by: "lovable",
        })),
      });
    }

    // === Rota OpenAI-compatible: /v1/chat/completions ===
    if (req.method === "POST" && path === "/v1/chat/completions") {
      if (!authorizeOpenAI(req)) return unauthorized();
      return await proxyChatCompletions(req, lovableKey);
    }

    // === Legado darkai (POST no root) ===
    if (req.method === "POST" && (path === "/" || path === "")) {
      return await legacyDarkai(req, lovableKey);
    }

    return json({ error: "not_found", path }, 404);
  } catch (e) {
    return json({ error: "internal", detail: String((e as Error)?.message ?? e) }, 500);
  }
});

// -------------------- Auth --------------------

function authorizeOpenAI(req: Request): boolean {
  const expected = Deno.env.get("WEBUI_LOVABLE_KEY");
  if (!expected) return false;
  const auth = req.headers.get("Authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  // aceita também X-Arsenal-Key pra compat interna
  const arsenal = req.headers.get("X-Arsenal-Key") ?? "";
  return bearer === expected || arsenal === expected;
}

function unauthorized() {
  return json({ error: { message: "invalid_api_key", type: "auth" } }, 401);
}

// -------------------- OpenAI-compatible chat --------------------

async function proxyChatCompletions(req: Request, lovableKey: string) {
  const body = await req.json().catch(() => ({}));
  const model = typeof body?.model === "string" && body.model ? body.model : DEFAULT_MODEL;
  const stream = body?.stream === true;

  const upstream = await fetch(`${GATEWAY_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lovableKey}`,
    },
    body: JSON.stringify({ ...body, model }),
  });

  if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
  if (upstream.status === 402) return json({ error: "sem_creditos" }, 402);
  if (!upstream.ok) {
    const t = await upstream.text();
    return json({ error: "gateway_error", status: upstream.status, detail: t.slice(0, 500) }, 502);
  }

  // Streaming: repassa SSE cru + headers corretos.
  if (stream && upstream.body) {
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  // Não-streaming: passthrough JSON.
  const data = await upstream.json();
  return json(data);
}

// -------------------- Legado darkai --------------------

async function legacyDarkai(req: Request, lovableKey: string) {
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const system = typeof body?.system === "string" ? body.system : undefined;
  const model = typeof body?.model === "string" && body.model ? body.model : DEFAULT_MODEL;
  if (!prompt) return json({ error: "campo 'prompt' obrigatório" }, 400);

  const messages: Array<{ role: string; content: string }> = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const upstream = await fetch(`${GATEWAY_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lovableKey}`,
    },
    body: JSON.stringify({ model, messages }),
  });

  if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
  if (upstream.status === 402) return json({ error: "sem_creditos" }, 402);
  if (!upstream.ok) {
    const t = await upstream.text();
    return json({ error: "gateway_error", status: upstream.status, detail: t.slice(0, 500) }, 502);
  }

  const data = await upstream.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return json({ text, model });
}

// -------------------- helpers --------------------

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
