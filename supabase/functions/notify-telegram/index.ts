// Edge function central de notificação universal
// Fluxo:
//   1. valida X-Notify-Key
//   2. grava em notifications_log com dedupe (60s)
//   3. roteia para um ou mais bots/chats com base em notification_routes (por tipo)
//   4. se não houver rota cadastrada pro tipo, cai no fallback: bot principal (srver1bot) → admin
//
// Padrão: Deno.serve + jsr:@supabase/supabase-js@2

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-notify-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Chat do admin (fallback final)
const DEFAULT_ADMIN_CHAT_ID = 1901426549;
// Bot preferido pro fallback (regra do projeto)
const PREFERRED_BOT_USERNAME = "srver1bot";

const DEDUPE_WINDOW_SECONDS = 60;

const TIPO_EMOJI: Record<string, string> = {
  info: "ℹ️",
  sucesso: "✅",
  aviso: "⚠️",
  erro: "❌",
  critico: "🚨",
  venda: "💰",
  pagamento: "💳",
  sistema: "⚙️",
};

type NotifyTipo = keyof typeof TIPO_EMOJI;

interface NotifyPayload {
  origem: string;
  tipo: NotifyTipo;
  titulo: string;
  mensagem: string;
  metadata?: Record<string, unknown>;
  chat_id?: number;
}

interface RouteRow {
  bot_id: string;
  chat_id: number;
  prioridade: number;
}

function sanitizeStr(s: unknown, max = 2000): string {
  if (typeof s !== "string") return "";
  return s.slice(0, max).trim();
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatTelegramMessage(p: NotifyPayload): string {
  const emoji = TIPO_EMOJI[p.tipo] ?? "•";
  const origem = escapeHtml(p.origem.toUpperCase());
  const titulo = escapeHtml(p.titulo);
  const mensagem = escapeHtml(p.mensagem);
  const ts = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  return [
    `${emoji} <b>${titulo}</b>`,
    `<i>origem:</i> <code>${origem}</code>`,
    "",
    mensagem,
    "",
    `<i>${ts}</i>`,
  ].join("\n");
}

async function sendToTelegram(
  token: string,
  chatId: number,
  text: string,
): Promise<{ ok: boolean; message_id: number | null; error: string | null }> {
  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const json = (await resp.json()) as {
      ok: boolean;
      result?: { message_id: number };
      description?: string;
    };
    if (!resp.ok || !json.ok) {
      return { ok: false, message_id: null, error: json.description ?? `http_${resp.status}` };
    }
    return { ok: true, message_id: json.result?.message_id ?? null, error: null };
  } catch (e) {
    return { ok: false, message_id: null, error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const expectedKey = Deno.env.get("NOTIFY_API_KEY");
  const providedKey = req.headers.get("x-notify-key");
  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = raw as Partial<NotifyPayload>;
  const origem = sanitizeStr(body.origem, 64);
  const tipo = (sanitizeStr(body.tipo, 16) as NotifyTipo) || "info";
  const titulo = sanitizeStr(body.titulo, 200);
  const mensagem = sanitizeStr(body.mensagem, 3500);

  if (!origem || !titulo || !mensagem) {
    return new Response(
      JSON.stringify({ ok: false, error: "invalid_input", detail: "origem, titulo e mensagem são obrigatórios" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!Object.keys(TIPO_EMOJI).includes(tipo)) {
    return new Response(
      JSON.stringify({ ok: false, error: "invalid_tipo", detail: `tipo deve ser um de: ${Object.keys(TIPO_EMOJI).join(", ")}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Anti-spam
  const dedupeHash = await sha256(`${origem}|${tipo}|${titulo}|${mensagem}`);
  const sinceIso = new Date(Date.now() - DEDUPE_WINDOW_SECONDS * 1000).toISOString();
  const { data: recent } = await supabase
    .from("notifications_log")
    .select("id, metadata")
    .eq("dedupe_hash", dedupeHash)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    const prevMeta = (recent.metadata as Record<string, unknown>) || {};
    const repeated = ((prevMeta.repeated as number) || 1) + 1;
    await supabase
      .from("notifications_log")
      .update({ metadata: { ...prevMeta, repeated, last_repeat_at: new Date().toISOString() } })
      .eq("id", recent.id);
    return new Response(
      JSON.stringify({ ok: true, deduped: true, id: recent.id, repeated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Insere log
  const { data: inserted, error: insertError } = await supabase
    .from("notifications_log")
    .insert({ origem, tipo, titulo, mensagem, metadata, dedupe_hash: dedupeHash, sent_ok: false })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[notify-telegram] insert error", insertError);
    return new Response(JSON.stringify({ ok: false, error: "db_insert_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Resolve destinos: prioriza notification_routes; senão usa fallback
  const text = formatTelegramMessage({ origem, tipo, titulo, mensagem, metadata });
  const overrideChat = Number(body.chat_id) || null;

  type Destino = { bot_id: string; token: string; chat_id: number; bot_username: string | null };
  const destinos: Destino[] = [];

  if (overrideChat) {
    // Override explícito do chamador → usa bot preferido
    const { data: bot } = await supabase
      .from("telegram_bots")
      .select("id, token, bot_username")
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    const preferred = bot?.find((b) => b.bot_username === PREFERRED_BOT_USERNAME) ?? bot?.[0];
    if (preferred?.token) {
      destinos.push({ bot_id: preferred.id, token: preferred.token, chat_id: overrideChat, bot_username: preferred.bot_username });
    }
  } else {
    // Busca rotas cadastradas pro tipo
    const { data: routes } = await supabase
      .from("notification_routes")
      .select("bot_id, chat_id, prioridade")
      .eq("tipo", tipo)
      .eq("ativo", true)
      .order("prioridade", { ascending: true })
      .returns<RouteRow[]>();

    if (routes && routes.length > 0) {
      const botIds = [...new Set(routes.map((r) => r.bot_id))];
      const { data: bots } = await supabase
        .from("telegram_bots")
        .select("id, token, bot_username")
        .in("id", botIds);
      const botMap = new Map(bots?.map((b) => [b.id, b]) ?? []);
      for (const r of routes) {
        const b = botMap.get(r.bot_id);
        if (b?.token) destinos.push({ bot_id: b.id, token: b.token, chat_id: Number(r.chat_id), bot_username: b.bot_username });
      }
    }

    // Fallback: nenhuma rota → usa srver1bot pro admin
    if (destinos.length === 0) {
      const { data: bots } = await supabase
        .from("telegram_bots")
        .select("id, token, bot_username")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      const preferred = bots?.find((b) => b.bot_username === PREFERRED_BOT_USERNAME) ?? bots?.[0];
      if (preferred?.token) {
        destinos.push({ bot_id: preferred.id, token: preferred.token, chat_id: DEFAULT_ADMIN_CHAT_ID, bot_username: preferred.bot_username });
      }
    }
  }

  // Envia em paralelo
  const resultados = await Promise.all(
    destinos.map((d) => sendToTelegram(d.token, d.chat_id, text).then((r) => ({ ...d, ...r }))),
  );

  const okCount = resultados.filter((r) => r.ok).length;
  const firstOk = resultados.find((r) => r.ok);
  const firstErr = resultados.find((r) => !r.ok);

  await supabase
    .from("notifications_log")
    .update({
      telegram_message_id: firstOk?.message_id ?? null,
      telegram_chat_id: firstOk?.chat_id ?? null,
      sent_ok: okCount > 0,
      send_error: okCount === 0 ? (firstErr?.error ?? "sem_destinos") : null,
      metadata: {
        ...metadata,
        destinos: resultados.map((r) => ({
          bot: r.bot_username,
          chat_id: r.chat_id,
          ok: r.ok,
          error: r.error,
        })),
      },
    })
    .eq("id", inserted.id);

  return new Response(
    JSON.stringify({
      ok: true,
      id: inserted.id,
      enviados: okCount,
      total_destinos: destinos.length,
      resultados: resultados.map((r) => ({ bot: r.bot_username, chat_id: r.chat_id, ok: r.ok, error: r.error })),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
