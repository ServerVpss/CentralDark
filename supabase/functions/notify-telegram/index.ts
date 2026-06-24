// Edge function central de notificação universal
// Recebe POST de qualquer sistema (VPS, scripts, Lovable, bots) e:
//   1. valida a chave própria (X-Notify-Key) — não depende da Lovable
//   2. grava na tabela notifications_log
//   3. envia formatado para o Telegram do admin
//   4. faz anti-spam via dedupe_hash com janela de 60s
//
// Padrão usado: Deno.serve + jsr:@supabase/supabase-js@2 (regra do projeto)

import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS expandido (regra do projeto)
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-notify-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Chat ID padrão do admin (do memory do projeto: contacobra3467 / @segredounlocker)
const DEFAULT_ADMIN_CHAT_ID = 1901426549;

// Janela de anti-spam: notificação idêntica nos últimos N segundos é agrupada
const DEDUPE_WINDOW_SECONDS = 60;

// Tipos aceitos e seus emojis
const TIPO_EMOJI: Record<string, string> = {
  info: "ℹ️",
  sucesso: "✅",
  aviso: "⚠️",
  erro: "❌",
  critico: "🚨",
};

type NotifyTipo = keyof typeof TIPO_EMOJI;

interface NotifyPayload {
  origem: string;
  tipo: NotifyTipo;
  titulo: string;
  mensagem: string;
  metadata?: Record<string, unknown>;
  chat_id?: number; // override opcional
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

// Escapa HTML do Telegram (parse_mode=HTML)
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 1) Autenticação por chave própria
  const expectedKey = Deno.env.get("NOTIFY_API_KEY");
  const providedKey = req.headers.get("x-notify-key");
  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2) Parse e validação do body
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
      JSON.stringify({
        ok: false,
        error: "invalid_input",
        detail: "origem, titulo e mensagem são obrigatórios",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!Object.keys(TIPO_EMOJI).includes(tipo)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "invalid_tipo",
        detail: `tipo deve ser um de: ${Object.keys(TIPO_EMOJI).join(", ")}`,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const metadata =
    body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // 3) Anti-spam: hash da notificação + checa janela de 60s
  const dedupeHash = await sha256(`${origem}|${tipo}|${titulo}|${mensagem}`);
  const sinceIso = new Date(Date.now() - DEDUPE_WINDOW_SECONDS * 1000).toISOString();

  const { data: recent, error: lookupError } = await supabase
    .from("notifications_log")
    .select("id, metadata, telegram_message_id, telegram_chat_id")
    .eq("dedupe_hash", dedupeHash)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("[notify-telegram] lookup error", lookupError);
  }

  // Se já tem uma notificação idêntica recente, incrementa contador e sai (não reenvia)
  if (recent) {
    const prevMeta = (recent.metadata as Record<string, unknown>) || {};
    const repeated = ((prevMeta.repeated as number) || 1) + 1;
    await supabase
      .from("notifications_log")
      .update({
        metadata: { ...prevMeta, repeated, last_repeat_at: new Date().toISOString() },
      })
      .eq("id", recent.id);

    return new Response(
      JSON.stringify({
        ok: true,
        deduped: true,
        id: recent.id,
        repeated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // 4) Insere o log antes de tentar enviar (rastreabilidade)
  const { data: inserted, error: insertError } = await supabase
    .from("notifications_log")
    .insert({
      origem,
      tipo,
      titulo,
      mensagem,
      metadata,
      dedupe_hash: dedupeHash,
      sent_ok: false,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[notify-telegram] insert error", insertError);
    return new Response(
      JSON.stringify({ ok: false, error: "db_insert_failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // 5) Envia para o Telegram via bot token do telegram_bots ativo
  let telegramMessageId: number | null = null;
  let telegramChatId: number | null = null;
  let sendError: string | null = null;

  try {
    const { data: bot, error: botError } = await supabase
      .from("telegram_bots")
      .select("token")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (botError || !bot?.token) {
      throw new Error("nenhum bot ativo encontrado em telegram_bots");
    }

    const chatId = Number(body.chat_id) || DEFAULT_ADMIN_CHAT_ID;
    telegramChatId = chatId;
    const text = formatTelegramMessage({
      origem,
      tipo,
      titulo,
      mensagem,
      metadata,
    });

    const tgUrl = `https://api.telegram.org/bot${bot.token}/sendMessage`;
    const resp = await fetch(tgUrl, {
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
      throw new Error(
        json.description ?? `telegram_http_${resp.status}`,
      );
    }
    telegramMessageId = json.result?.message_id ?? null;
  } catch (e) {
    sendError = (e as Error).message;
    console.error("[notify-telegram] telegram send failed", sendError);
  }

  // 6) Atualiza o log com resultado do envio
  await supabase
    .from("notifications_log")
    .update({
      telegram_message_id: telegramMessageId,
      telegram_chat_id: telegramChatId,
      sent_ok: telegramMessageId !== null,
      send_error: sendError,
    })
    .eq("id", inserted.id);

  return new Response(
    JSON.stringify({
      ok: true,
      id: inserted.id,
      telegram_message_id: telegramMessageId,
      sent_ok: telegramMessageId !== null,
      send_error: sendError,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
