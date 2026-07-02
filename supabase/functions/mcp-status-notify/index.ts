// Edge function: notifica no Telegram quando o MCP transiciona OFFLINE -> ONLINE
// Chamada pelo McpCard do hub sempre que detecta recuperação de estado.
// deno-lint-ignore-file no-explicit-any

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const CHAT_ID_ADMIN = 1901426549; // @segredounlocker

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const previousState = String(body.previousState ?? "");
    const currentState = String(body.currentState ?? "");
    const version = body.version ? String(body.version) : "—";
    const tools = body.tools ? String(body.tools) : "—";
    const latency = body.latency_ms ? `${body.latency_ms}ms` : "—";

    // Só notifica na transição de fora do ar → dentro do ar
    if (previousState !== "fail" || currentState !== "ok") {
      return new Response(JSON.stringify({ ok: true, skipped: "sem transição" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const telegramKey = Deno.env.get("TELEGRAM_API_KEY");
    if (!lovableKey || !telegramKey) {
      return new Response(JSON.stringify({ error: "Credenciais Telegram ausentes" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text =
      `<b>🟢 MCP CentralDark voltou ao ar</b>\n\n` +
      `Detectado pelo hub logo após ajuste na VPS.\n\n` +
      `<b>Versão:</b> <code>${version}</code>\n` +
      `<b>Tools:</b> ${tools}\n` +
      `<b>Latência:</b> ${latency}\n` +
      `<b>Hora:</b> ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`;

    const tg = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": telegramKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: CHAT_ID_ADMIN, parse_mode: "HTML", text }),
    });

    const tgData = await tg.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: tg.ok, telegram: tgData }), {
      status: tg.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
