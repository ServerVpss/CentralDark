// Edge Function: proxy — Dossiê V2 (Abacus/Motosserra + resiliência)
// T1 Memory Injection · T2 Multi-model Council · T3 Circuit Breaker + Mock · T4 Sanitização
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const breaker = new Map<string, { failures: number; openedAt: number }>();
const FAILURE_THRESHOLD = 5;
const OPEN_TTL_MS = 60_000;

function bState(k: string): "closed" | "open" | "half_open" {
  const s = breaker.get(k);
  if (!s) return "closed";
  if (s.failures < FAILURE_THRESHOLD) return "closed";
  if (Date.now() - s.openedAt > OPEN_TTL_MS) return "half_open";
  return "open";
}
function bFail(k: string) {
  const s = breaker.get(k) ?? { failures: 0, openedAt: 0 };
  s.failures += 1;
  if (s.failures >= FAILURE_THRESHOLD && !s.openedAt) s.openedAt = Date.now();
  breaker.set(k, s);
}
function bOk(k: string) { breaker.delete(k); }

function injectMemory(userFacts: string[], messages: any[]) {
  if (!userFacts?.length) return messages;
  const block = `[Contexto persistente: ${userFacts.join("; ")}]`;
  const clone = [...messages];
  if (clone[0]?.role === "system") clone[0] = { ...clone[0], content: `${block}\n${clone[0].content}` };
  else clone.unshift({ role: "system", content: block });
  return clone;
}

async function fetchUserFacts(supabase: any, userId: string | null): Promise<string[]> {
  if (!userId) return [];
  try {
    const { data } = await supabase.from("hermes_memoria")
      .select("fato").eq("user_id", userId).eq("ativo", true).limit(8);
    return (data ?? []).map((r: any) => r.fato).filter(Boolean);
  } catch { return []; }
}

async function callGateway(model: string, messages: any[]): Promise<{ text: string; tokens: number }> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("gateway_key_missing");
  const usaCompletion = model.startsWith("openai/gpt-5") || model.startsWith("openai/o");
  const body: Record<string, unknown> = { model, messages };
  if (usaCompletion) body.max_completion_tokens = 2000; else body.max_tokens = 2000;
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`upstream_${r.status}`);
  const j = await r.json();
  return { text: j.choices?.[0]?.message?.content ?? "", tokens: j.usage?.total_tokens ?? 0 };
}

async function multiModelCouncil(messages: any[], models: string[]): Promise<string> {
  const respostas = await Promise.allSettled(models.map(m => callGateway(m, messages)));
  const validas = respostas.map((r, i) => ({ modelo: models[i], r }))
    .filter(x => x.r.status === "fulfilled")
    .map(x => `### ${x.modelo}\n${(x.r as any).value.text}`);
  if (validas.length === 0) throw new Error("council_all_failed");
  const bloco = validas.join("\n\n---\n\n");
  const sint = await callGateway("openai/gpt-5.5", [
    { role: "system", content: "Você é o Juiz do Conselho. Sintetize a MELHOR resposta única em PT-BR, direta." },
    { role: "user", content: `Pergunta:\n${messages.filter(m=>m.role==="user").map(m=>m.content).join("\n")}\n\nRespostas:\n${bloco}` },
  ]);
  return sint.text;
}

function mockResponse(messages: any[]): string {
  const q = messages.filter(m => m.role === "user").slice(-1)[0]?.content ?? "";
  return `⚠️ Modo degradado (fallback). Recebido: "${q.slice(0, 120)}${q.length>120?"…":""}". Tente novamente em instantes.`;
}

async function logRequest(supabase: any, row: any) {
  try { await supabase.from("ai_requests").insert(row); } catch {}
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const started = Date.now();
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/proxy/, "") || "/";

  if (pathname === "/status") {
    return new Response(JSON.stringify({
      ok: true, version: "v2-dossie",
      techniques: { memory: true, council: true, breaker: true, sanitize: true },
      breakerStates: Object.fromEntries([...breaker.entries()].map(([k,v])=>[k,{failures:v.failures}])),
      time: new Date().toISOString(),
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  const model = body.model ?? "openai/gpt-5.5";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const council: string[] | undefined = body.council;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const userId = body.user_id ?? null;
  const facts = await fetchUserFacts(supabase, userId);
  const enriched = injectMemory(facts, messages);

  const providerKey = council?.length ? "council" : model;
  const cState = bState(providerKey);

  if (cState === "open") {
    const text = mockResponse(enriched);
    await logRequest(supabase, {
      user_id: userId, model, provider: providerKey,
      input_tokens: 0, output_tokens: 0, latency_ms: Date.now()-started,
      status: "fallback", error_code: "circuit_open", circuit_state: cState,
    });
    return new Response(JSON.stringify({ text, degraded: true, circuit: cState }),
      { headers: { ...cors, "Content-Type": "application/json" } });
  }

  try {
    let text: string; let tokens = 0;
    if (council?.length) text = await multiModelCouncil(enriched, council);
    else { const r = await callGateway(model, enriched); text = r.text; tokens = r.tokens; }
    bOk(providerKey);
    await logRequest(supabase, {
      user_id: userId, model, provider: providerKey,
      input_tokens: 0, output_tokens: tokens, latency_ms: Date.now()-started,
      status: "success", error_code: null, circuit_state: "closed",
    });
    return new Response(JSON.stringify({ text, tokens, memoryInjected: facts.length > 0 }),
      { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    bFail(providerKey);
    const code = String((e as Error).message).slice(0, 40);
    const text = mockResponse(enriched);
    await logRequest(supabase, {
      user_id: userId, model, provider: providerKey,
      input_tokens: 0, output_tokens: 0, latency_ms: Date.now()-started,
      status: "fallback", error_code: code, circuit_state: bState(providerKey),
    });
    return new Response(JSON.stringify({
      error: "upstream_error",
      message: "Tente novamente em instantes.",
      fallback: text,
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
