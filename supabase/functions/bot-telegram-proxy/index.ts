// Proxy seguro pra Telegram Bot API. Substitui chamadas diretas a api.telegram.org no frontend.
// Valida JWT do usuário, confirma ownership do bot (ou admin), busca token no banco com service role
// e encaminha a chamada. NUNCA devolve o token ao client.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Ações permitidas (whitelist) — bloqueia qualquer outra coisa do API Telegram.
const ALLOWED_ACTIONS = new Set([
  "sendMessage",
  "sendPhoto",
  "sendAudio",
  "sendAnimation",
  "sendDocument",
  "deleteWebhook",
  "setWebhook",
  "getMe",
  "getWebhookInfo",
]);

async function authorizeOwner(req: Request, botId: string): Promise<{ ok: boolean; status?: number; reason?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, reason: "missing_auth" };
  }
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (claimsErr || !claims?.claims?.sub) {
    return { ok: false, status: 401, reason: "invalid_token" };
  }
  const userId = claims.claims.sub as string;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: bot, error: botErr } = await admin
    .from("telegram_bots")
    .select("user_id")
    .eq("id", botId)
    .maybeSingle();
  if (botErr || !bot) return { ok: false, status: 404, reason: "bot_not_found" };

  if (bot.user_id === userId) return { ok: true };

  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (isAdmin) return { ok: true };

  return { ok: false, status: 403, reason: "not_owner" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json().catch(() => null) as
      | { botId?: string; action?: string; body?: Record<string, unknown>; mediaBase64?: string; mediaName?: string; mediaField?: string }
      | null;

    if (!payload?.botId || !payload?.action) {
      return new Response(JSON.stringify({ ok: false, error: "botId e action obrigatorios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_ACTIONS.has(payload.action)) {
      return new Response(JSON.stringify({ ok: false, error: "action_not_allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = await authorizeOwner(req, payload.botId);
    if (!auth.ok) {
      return new Response(JSON.stringify({ ok: false, error: auth.reason }), {
        status: auth.status ?? 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: bot } = await admin
      .from("telegram_bots")
      .select("token")
      .eq("id", payload.botId)
      .maybeSingle();

    if (!bot?.token) {
      return new Response(JSON.stringify({ ok: false, error: "bot_sem_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tgUrl = `https://api.telegram.org/bot${bot.token}/${payload.action}`;
    let tgRes: Response;

    if (payload.mediaBase64 && payload.mediaField) {
      // Reconstrói multipart pra envio de arquivo
      const bin = atob(payload.mediaBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const fd = new FormData();
      for (const [k, v] of Object.entries(payload.body ?? {})) {
        if (v == null) continue;
        fd.append(k, typeof v === "string" ? v : JSON.stringify(v));
      }
      fd.append(payload.mediaField, new Blob([bytes]), payload.mediaName ?? "media");
      tgRes = await fetch(tgUrl, { method: "POST", body: fd });
    } else {
      tgRes = await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.body ?? {}),
      });
    }

    const tgJson = await tgRes.json().catch(() => ({ ok: false, description: "telegram_invalid_json" }));
    return new Response(JSON.stringify(tgJson), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
