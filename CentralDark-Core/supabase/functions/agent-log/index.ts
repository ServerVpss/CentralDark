// Edge function: agent-log
// Recebe eventos dos agentes (VPS, MCP, bots) e grava em public.agent_events.
// Autenticação via header X-Agent-Secret (evita spam externo).
// Uso:
//   curl -X POST https://<proj>.supabase.co/functions/v1/agent-log \
//        -H "X-Agent-Secret: $AGENT_LOG_SECRET" \
//        -H "Content-Type: application/json" \
//        -d '{"agent":"MCP","area":"VPS","acao":"editou config","alvo":"nginx.conf","status":"sucesso"}'

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { normalizeTelemetryBatch } from "../_shared/evidence-envelope.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agent-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STATUS_VALIDOS = new Set(["info", "sucesso", "erro", "aviso", "protegido"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "método não suportado" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const segredo = Deno.env.get("AGENT_LOG_SECRET");
  if (!segredo) {
    return new Response(JSON.stringify({ error: "AGENT_LOG_SECRET não configurado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const enviado = req.headers.get("x-agent-secret");
  if (enviado !== segredo) {
    return new Response(JSON.stringify({ error: "não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let corpo: any;
  try {
    corpo = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const agent = String(corpo.agent ?? "").trim().slice(0, 60);
  const area = String(corpo.area ?? "").trim().slice(0, 60);
  const acao = String(corpo.acao ?? "").trim().slice(0, 500);
  const alvo = corpo.alvo ? String(corpo.alvo).slice(0, 500) : null;
  const status = STATUS_VALIDOS.has(corpo.status) ? corpo.status : "info";
  const metadata = corpo.metadata && typeof corpo.metadata === "object" ? corpo.metadata : {};

  if (!agent || !area || !acao) {
    return new Response(JSON.stringify({ error: "agent, area e acao são obrigatórios" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(
    Deno.env.get("HUB_SUPABASE_URL")!,
    Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const telemetryInput = Array.isArray(corpo.events)
    ? corpo.events
    : [{
        event: corpo.event ?? acao,
        producer: corpo.producer ?? agent,
        target: corpo.target ?? alvo ?? area,
        mission_id: corpo.mission_id ?? metadata.mission_id,
        writer_scope: corpo.writer_scope ?? metadata.writer_scope,
        sha: corpo.sha ?? metadata.sha,
        event_id: corpo.event_id ?? metadata.event_id,
        causation_id: corpo.causation_id ?? metadata.causation_id,
        surface_id: corpo.surface_id ?? metadata.surface_id,
        attempt_id: corpo.attempt_id ?? metadata.attempt_id,
        trace_id: corpo.trace_id ?? metadata.trace_id,
        timestamp: corpo.timestamp ?? new Date().toISOString(),
        result: corpo.result ?? status,
        latency_ms: corpo.latency_ms,
        tokens: corpo.tokens,
        cost: corpo.cost,
        context: metadata,
      }];
  const envelope = await normalizeTelemetryBatch(telemetryInput);
  const rows = envelope.events.map((event) => ({
    agent,
    area,
    acao: event.event,
    alvo: event.target || alvo,
    status: STATUS_VALIDOS.has(String(event.result).toLowerCase()) ? String(event.result).toLowerCase() : status,
    metadata: { ...metadata, evidence_envelope: event },
  }));
  const { data, error } = await supa
    .from("agent_events")
    .insert(rows)
    .select("id, ts");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, ...envelope, rows: data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
