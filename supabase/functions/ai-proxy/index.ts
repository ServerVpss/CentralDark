// ai-proxy — cérebro compartilhado da CentralDark
//
// TODAS as rotas exigem WEBUI_LOVABLE_KEY (via Authorization: Bearer <key>
// ou header X-Arsenal-Key). O repasse pro Lovable AI Gateway usa
// LOVABLE_API_KEY (secret interna, nunca sai daqui).
//
// Rotas:
//   GET  /v1/models
//   POST /v1/chat/completions   (SSE quando stream:true)
//   POST /v1/audio/speech
//   POST /v1/audio/transcriptions
//   GET  /v1/audio/voices
//   POST /                       (legado darkai CLI + Arsenal)
//   GET  /config                 (status + limites vigentes, exige auth)
//
// Rate limit: janela deslizante em memória por chave (IP quando anônimo,
// impossível chegar aqui sem chave — anônimo cai no 401 antes).
// Configurável via env: AI_PROXY_RATE_PER_MIN (default 60),
// AI_PROXY_RATE_PER_HOUR (default 1000). Zero desativa o limite.

const GATEWAY_BASE = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

// Catálogo completo do Lovable AI Gateway (chat/text).
const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-flash-lite",
  "google/gemini-3.5-flash",
  "google/gemini-3.1-pro-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
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

// Aliases curtos (darkai/CLI) -> id oficial do gateway.
// Assim `darkai --model gpt-5` funciona igual `--model openai/gpt-5`.
const MODEL_ALIASES: Record<string, string> = {
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-5-nano": "openai/gpt-5-nano",
  "gpt-5.2": "openai/gpt-5.2",
  "gpt-5.4": "openai/gpt-5.4",
  "gpt-5.4-mini": "openai/gpt-5.4-mini",
  "gpt-5.4-nano": "openai/gpt-5.4-nano",
  "gpt-5.4-pro": "openai/gpt-5.4-pro",
  "gpt-5.5": "openai/gpt-5.5",
  "gpt-5.5-pro": "openai/gpt-5.5-pro",
  "gemini-3-flash-preview": "google/gemini-3-flash-preview",
  "gemini-3.1-flash-lite": "google/gemini-3.1-flash-lite",
  "gemini-3.5-flash": "google/gemini-3.5-flash",
  "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
  "gemini-2.5-pro": "google/gemini-2.5-pro",
  "gemini-2.5-flash": "google/gemini-2.5-flash",
  "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite",
  // atalhos ainda mais curtos
  "flash": "google/gemini-3-flash-preview",
  "pro": "google/gemini-3.1-pro-preview",
  "gpt": "openai/gpt-5",
};

function normalizeModel(input: unknown): string {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return DEFAULT_MODEL;
  if (raw.includes("/")) return raw; // já vem no formato vendor/model
  return MODEL_ALIASES[raw] ?? raw; // se não bater, deixa passar pro gateway responder o erro real
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-arsenal-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// -------------------- Rate limit (memória) --------------------

const RATE_PER_MIN = parseIntEnv("AI_PROXY_RATE_PER_MIN", 60);
const RATE_PER_HOUR = parseIntEnv("AI_PROXY_RATE_PER_HOUR", 1000);

// bucketId -> timestamps (ms). Poda automática na hora de contar.
const hits = new Map<string, number[]>();

function parseIntEnv(name: string, fallback: number): number {
  const raw = Deno.env.get(name);
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function bucketKeyOf(req: Request, apiKey: string): string {
  // Hash simples da chave pra não guardar o valor cru na memória.
  let h = 0;
  for (let i = 0; i < apiKey.length; i++) h = ((h << 5) - h + apiKey.charCodeAt(i)) | 0;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return `${h}:${ip}`;
}

function checkRateLimit(bucket: string): { ok: true } | { ok: false; retryAfter: number; scope: string } {
  const now = Date.now();
  const arr = hits.get(bucket) ?? [];
  // Poda tudo mais velho que 1h
  const cutoffHour = now - 3600_000;
  const kept = arr.filter((t) => t >= cutoffHour);
  const cutoffMin = now - 60_000;
  const lastMin = kept.filter((t) => t >= cutoffMin).length;

  if (RATE_PER_MIN > 0 && lastMin >= RATE_PER_MIN) {
    const oldest = kept.find((t) => t >= cutoffMin) ?? now;
    const retryAfter = Math.max(1, Math.ceil((oldest + 60_000 - now) / 1000));
    hits.set(bucket, kept);
    return { ok: false, retryAfter, scope: "minuto" };
  }
  if (RATE_PER_HOUR > 0 && kept.length >= RATE_PER_HOUR) {
    const oldest = kept[0] ?? now;
    const retryAfter = Math.max(1, Math.ceil((oldest + 3600_000 - now) / 1000));
    hits.set(bucket, kept);
    return { ok: false, retryAfter, scope: "hora" };
  }

  kept.push(now);
  hits.set(bucket, kept);
  return { ok: true };
}

// -------------------- Server --------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) {
    return json({ error: "LOVABLE_API_KEY não configurada" }, 500);
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/ai-proxy/, "") || "/";

  // Auth obrigatória em TODAS as rotas (menos OPTIONS, já tratado).
  const authed = authorize(req);
  if (!authed.ok) return unauthorized(authed.reason);

  // Rate limit por chave.
  const bucket = bucketKeyOf(req, authed.key);
  const rl = checkRateLimit(bucket);
  if (!rl.ok) {
    return json(
      { error: "rate_limited", scope: rl.scope, retry_after: rl.retryAfter },
      429,
      { "Retry-After": String(rl.retryAfter) },
    );
  }

  try {
    if (req.method === "GET" && path === "/config") {
      return json({
        ok: true,
        rate_limit: {
          per_minute: RATE_PER_MIN,
          per_hour: RATE_PER_HOUR,
          enabled: RATE_PER_MIN > 0 || RATE_PER_HOUR > 0,
        },
        models: MODELS,
        default_model: DEFAULT_MODEL,
      });
    }

    if (req.method === "GET" && path === "/v1/models") {
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

    if (req.method === "POST" && path === "/v1/chat/completions") {
      return await proxyChatCompletions(req, lovableKey);
    }

    if (req.method === "POST" && path === "/v1/audio/speech") {
      return await proxyAudioSpeech(req, lovableKey);
    }

    if (req.method === "POST" && path === "/v1/audio/transcriptions") {
      return await proxyAudioTranscriptions(req, lovableKey);
    }

    if (req.method === "GET" && path === "/v1/audio/voices") {
      return json({
        voices: [
          { id: "alloy", name: "Alloy (neutra)" },
          { id: "echo", name: "Echo (masculina)" },
          { id: "fable", name: "Fable (britânica)" },
          { id: "onyx", name: "Onyx (grave)" },
          { id: "nova", name: "Nova (jovem)" },
          { id: "shimmer", name: "Shimmer (suave)" },
        ],
      });
    }

    if (req.method === "POST" && (path === "/" || path === "")) {
      return await legacyDarkai(req, lovableKey);
    }

    return json({ error: "not_found", path }, 404);
  } catch (e) {
    return json({ error: "internal", detail: String((e as Error)?.message ?? e) }, 500);
  }
});

// -------------------- Auth --------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authorize(req: Request): { ok: true; key: string } | { ok: false; reason: string } {
  const expected = Deno.env.get("WEBUI_LOVABLE_KEY");
  if (!expected) return { ok: false, reason: "servidor_sem_chave" };

  const auth = req.headers.get("Authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const arsenal = req.headers.get("X-Arsenal-Key") ?? "";
  const provided = bearer || arsenal;
  if (!provided) return { ok: false, reason: "sem_credencial" };
  if (!timingSafeEqual(provided, expected)) return { ok: false, reason: "chave_invalida" };
  return { ok: true, key: provided };
}

function unauthorized(reason = "invalid_api_key") {
  return json({ error: { message: reason, type: "auth" } }, 401);
}

// -------------------- OpenAI-compatible chat --------------------

async function proxyChatCompletions(req: Request, lovableKey: string) {
  const body = await req.json().catch(() => ({}));
  const model = normalizeModel(body?.model);
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

// -------------------- Áudio (TTS + STT) --------------------

async function proxyAudioSpeech(req: Request, lovableKey: string) {
  const body = await req.json().catch(() => ({}));
  const model = typeof body?.model === "string" && body.model ? body.model : "openai/gpt-4o-mini-tts";
  const voice = typeof body?.voice === "string" && body.voice ? body.voice : "alloy";
  const input = typeof body?.input === "string" ? body.input : "";
  if (!input.trim()) return json({ error: "campo 'input' obrigatório" }, 400);

  const upstream = await fetch(`${GATEWAY_BASE}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lovableKey}`,
    },
    body: JSON.stringify({ ...body, model, voice, input }),
  });

  if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
  if (upstream.status === 402) return json({ error: "sem_creditos" }, 402);
  if (!upstream.ok) {
    const t = await upstream.text();
    return json({ error: "gateway_error", status: upstream.status, detail: t.slice(0, 500) }, 502);
  }

  const contentType = upstream.headers.get("Content-Type") ?? "audio/mpeg";
  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
    },
  });
}

async function proxyAudioTranscriptions(req: Request, lovableKey: string) {
  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: "esperado multipart/form-data" }, 400);

  const forward = new FormData();
  for (const [k, v] of form.entries()) forward.append(k, v as any);
  if (!forward.has("model")) forward.append("model", "openai/gpt-4o-mini-transcribe");

  const upstream = await fetch(`${GATEWAY_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${lovableKey}` },
    body: forward,
  });

  if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
  if (upstream.status === 402) return json({ error: "sem_creditos" }, 402);
  if (!upstream.ok) {
    const t = await upstream.text();
    return json({ error: "gateway_error", status: upstream.status, detail: t.slice(0, 500) }, 502);
  }

  const data = await upstream.json().catch(() => ({}));
  return json(data);
}

// -------------------- helpers --------------------

function json(obj: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}
