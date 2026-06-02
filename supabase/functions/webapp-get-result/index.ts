// Edge function: valida initData do Telegram Mini App e retorna o resultado salvo
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Validação oficial do initData (HMAC-SHA256 com chave derivada do bot_token)
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
async function validateTelegramInitData(
  initData: string,
  botToken: string,
): Promise<{ valid: boolean; userId?: number; user?: any; authDate?: number }> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { valid: false };
    params.delete("hash");

    // ordena os campos alfabeticamente
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const encoder = new TextEncoder();
    // chave = HMAC_SHA256("WebAppData", bot_token)
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const derivedKey = await crypto.subtle.sign(
      "HMAC",
      secretKey,
      encoder.encode(botToken),
    );

    const finalKey = await crypto.subtle.importKey(
      "raw",
      derivedKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      finalKey,
      encoder.encode(dataCheckString),
    );

    const computedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedHash !== hash) return { valid: false };

    const userRaw = params.get("user");
    const authDate = parseInt(params.get("auth_date") || "0", 10);
    const user = userRaw ? JSON.parse(userRaw) : null;

    // Janela máxima de 24h para segurança
    if (Date.now() / 1000 - authDate > 86400) {
      return { valid: false };
    }

    return { valid: true, userId: user?.id, user, authDate };
  } catch (err) {
    console.error("[webapp-get-result] erro ao validar initData:", err);
    return { valid: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { path_token, secret_token, init_data } = await req.json();

    if (!path_token || !secret_token) {
      return new Response(
        JSON.stringify({ error: "tokens_ausentes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Busca o registro pelo path_token
    const { data: record, error } = await supabase
      .from("webapp_results")
      .select("*")
      .eq("path_token", path_token)
      .maybeSingle();

    if (error || !record) {
      return new Response(
        JSON.stringify({ error: "nao_encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Confere secret_token
    if (record.secret_token !== secret_token) {
      return new Response(
        JSON.stringify({ error: "token_invalido" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Confere expiração
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({ error: "expirado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Busca token e identidade do bot (coluna correta é "name", não "bot_name")
    const { data: botRow, error: botErr } = await supabase
      .from("telegram_bots")
      .select("token, bot_username, name")
      .eq("id", record.bot_id)
      .maybeSingle();
    const botToken = botRow?.token;
    if (!botToken) {
      console.error("[webapp-get-result] bot não encontrado", {
        bot_id: record.bot_id,
        path_token,
        botErr: botErr?.message,
        botRow_keys: botRow ? Object.keys(botRow) : null,
      });
      return new Response(
        JSON.stringify({ error: "bot_nao_encontrado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!init_data || typeof init_data !== "string") {
      return new Response(
        JSON.stringify({ error: "abra_pelo_telegram" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const validation = await validateTelegramInitData(init_data, botToken);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: "assinatura_invalida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Confere se o usuário do Telegram é o mesmo que solicitou a consulta
    if (validation.userId !== Number(record.telegram_user_id)) {
      return new Response(
        JSON.stringify({ error: "consulta_de_outro_usuario" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Incrementa view_count
    await supabase
      .from("webapp_results")
      .update({ view_count: (record.view_count || 0) + 1 })
      .eq("id", record.id);

    return new Response(
      JSON.stringify({
        ok: true,
        query_type: record.query_type,
        query_input: record.query_input,
        result_data: record.result_data,
        created_at: record.created_at,
        user: validation.user,
        bot_username: botRow?.bot_username,
        bot_name: botRow?.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[webapp-get-result] erro:", err);
    return new Response(
      JSON.stringify({ error: "erro_interno", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
