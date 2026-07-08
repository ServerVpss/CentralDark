// Edge Function: abacus-router
// HUB Supabase (lyoigsqluyktoclwdaft) — proxy OpenAI-compatible pra Abacus RouteLLM
// Endpoints:
//   GET  /abacus-router/status               -> saúde + se a chave tá configurada
//   GET  /abacus-router/models               -> lista de modelos (via Abacus se tiver chave)
//   GET  /abacus-router/logs?limit=100       -> logs do usuário logado
//   POST /abacus-router/v1/chat/completions  -> proxy pro Abacus, grava log

import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ABACUS_KEY = Deno.env.get("ABACUS_API_KEY") ?? "";
const ABACUS_BASE = Deno.env.get("ABACUS_BASE_URL") ?? "https://routellm.abacus.ai/v1";
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SUPA_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPA_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function authedUser(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await supa.auth.getUser();
  return data.user;
}

async function pingEndpoint(name: string, url: string) {
  const t0 = performance.now();
  try {
    const r = await fetch(url, { method: "GET", signal: AbortSignal.timeout(8000) });
    return {
      name,
      url,
      status: r.status,
      latencyMs: Math.round(performance.now() - t0),
      ok: r.status < 500,
    };
  } catch (e) {
    return {
      name,
      url,
      status: 0,
      latencyMs: Math.round(performance.now() - t0),
      ok: false,
    };
  }
}

async function handleStatus() {
  const endpoints = await Promise.all([
    pingEndpoint("Abacus RouteLLM", `${ABACUS_BASE}/models`),
    pingEndpoint("Abacus ChatLLM", "https://chatllm.abacus.ai/"),
    pingEndpoint("Abacus API root", "https://api.abacus.ai/"),
  ]);

  let modelCount = 0;
  if (ABACUS_KEY) {
    try {
      const r = await fetch(`${ABACUS_BASE}/models`, {
        headers: { Authorization: `Bearer ${ABACUS_KEY}` },
      });
      if (r.ok) {
        const j = await r.json();
        modelCount = Array.isArray(j?.data) ? j.data.length : 0;
      }
    } catch { /* ignora */ }
  }

  return json({
    keyConfigured: Boolean(ABACUS_KEY),
    endpoints,
    modelCount,
  });
}

async function handleModels() {
  if (!ABACUS_KEY) return json({ models: [], reason: "no_key" });
  try {
    const r = await fetch(`${ABACUS_BASE}/models`, {
      headers: { Authorization: `Bearer ${ABACUS_KEY}` },
    });
    if (!r.ok) return json({ models: [], reason: `upstream_${r.status}` });
    const j = await r.json();
    const models = (j?.data ?? []).map((m: any) => ({
      id: m.id ?? m.name,
      name: m.id ?? m.name,
      active: true,
    }));
    return json({ models });
  } catch (e) {
    return json({ models: [], reason: String(e) });
  }
}

async function handleLogs(req: Request, userId: string) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 500);
  const svc = createClient(SUPA_URL, SUPA_SERVICE);
  const { data, error } = await svc
    .from("abacus_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return json({ logs: [], error: error.message }, 500);
  return json({ logs: data });
}

async function handleChat(req: Request, userId: string) {
  const body = await req.json().catch(() => ({}));
  const model = body?.model ?? "route-llm";
  const t0 = performance.now();

  if (!ABACUS_KEY) {
    return json({
      error: "ABACUS_API_KEY não configurada no cofre do HUB",
      hint: "Roda: supabase secrets set ABACUS_API_KEY=<chave> --project-ref lyoigsqluyktoclwdaft",
    }, 503);
  }

  let upstreamStatus = 0;
  let errorSnippet: string | null = null;
  let content = "";
  let tokensIn: number | null = null;
  let tokensOut: number | null = null;

  try {
    const r = await fetch(`${ABACUS_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ABACUS_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, stream: false }),
    });
    upstreamStatus = r.status;
    const raw = await r.text();
    if (r.ok) {
      try {
        const j = JSON.parse(raw);
        content = j?.choices?.[0]?.message?.content ?? raw;
        tokensIn = j?.usage?.prompt_tokens ?? null;
        tokensOut = j?.usage?.completion_tokens ?? null;
      } catch {
        content = raw;
      }
    } else {
      errorSnippet = raw.slice(0, 500);
    }

    const latencyMs = Math.round(performance.now() - t0);
    const svc = createClient(SUPA_URL, SUPA_SERVICE);
    await svc.from("abacus_logs").insert({
      user_id: userId,
      model,
      status: upstreamStatus,
      latency_ms: latencyMs,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      error_snippet: errorSnippet,
    });

    if (!r.ok) {
      return json({
        error: friendlyError(upstreamStatus),
        upstream: errorSnippet,
      }, upstreamStatus);
    }
    // Devolve no formato OpenAI-compat
    try {
      return json(JSON.parse(raw));
    } catch {
      return json({ choices: [{ message: { role: "assistant", content } }] });
    }
  } catch (e) {
    const latencyMs = Math.round(performance.now() - t0);
    const svc = createClient(SUPA_URL, SUPA_SERVICE);
    await svc.from("abacus_logs").insert({
      user_id: userId,
      model,
      status: 0,
      latency_ms: latencyMs,
      error_snippet: String(e).slice(0, 500),
    });
    return json({ error: "falha de rede", detail: String(e) }, 502);
  }
}

function friendlyError(status: number) {
  if (status === 401) return "Chave Abacus inválida ou expirada";
  if (status === 402) return "Créditos zerados no Abacus";
  if (status === 404) return "Endpoint do Abacus não encontrado (URL morta)";
  if (status === 429) return "Rate limit do Abacus";
  return `Erro upstream ${status}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = new URL(req.url);
  // remove prefixo /abacus-router se vier
  const path = url.pathname.replace(/^\/abacus-router/, "") || "/";

  try {
    // Status é público (não gasta chave nem crédito)
    if (path === "/status" && req.method === "GET") return await handleStatus();

    // Daqui pra frente exige auth
    const user = await authedUser(req);
    if (!user) return json({ error: "unauthorized" }, 401);

    if (path === "/models" && req.method === "GET") return await handleModels();
    if (path === "/logs" && req.method === "GET") return await handleLogs(req, user.id);
    if (path === "/v1/chat/completions" && req.method === "POST") return await handleChat(req, user.id);

    return json({ error: "not_found", path }, 404);
  } catch (e) {
    return json({ error: "internal", detail: String(e) }, 500);
  }
});
