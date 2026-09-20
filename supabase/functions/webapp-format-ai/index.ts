// Edge function: formata o resultado da consulta usando Lovable AI
// Reusa a mesma validação de initData do webapp-get-result. Cacheia em formatted_data.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Validação oficial do initData (HMAC-SHA256 derivado do bot_token)
async function validateTelegramInitData(
  initData: string,
  botToken: string,
): Promise<{ valid: boolean; userId?: number }> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { valid: false };
    params.delete("hash");
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw", encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const derivedKey = await crypto.subtle.sign("HMAC", secretKey, encoder.encode(botToken));
    const finalKey = await crypto.subtle.importKey(
      "raw", derivedKey,
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", finalKey, encoder.encode(dataCheckString));
    const computedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0")).join("");
    if (computedHash !== hash) return { valid: false };
    const userRaw = params.get("user");
    const authDate = parseInt(params.get("auth_date") || "0", 10);
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (Date.now() / 1000 - authDate > 86400) return { valid: false };
    return { valid: true, userId: user?.id };
  } catch (err) {
    console.error("[webapp-format-ai] erro initData:", err);
    return { valid: false };
  }
}

// Remove campos administrativos/sensíveis ANTES de mandar pra IA
const STRIP_KEYS = new Set([
  "saldo", "protocolo", "usuario", "consumo_hoje", "consumo", "total_diario",
  "reset_em", "inicio_uso", "vencimento", "tempo_restante", "duration_ms",
  "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais",
  "fromcache", "cache_ttl_hours", "fotobase64", "base64", "conta",
  "tempo_segundos", "temposegundos", "cache", "cached_at", "expiracao",
  "limites", "plano", "requests_used", "requests_remaining", "daily_limit",
  "fallback_provider", "apikey", "api_key", "prioridade", "raw", "meta",
  "request_id", "status_code", "statuscode",
]);

function sanitize(obj: any, depth = 0): any {
  if (depth > 12) return null;
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((x) => sanitize(x, depth + 1));
  if (typeof obj === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const nk = k.toLowerCase().replace(/[\s-]/g, "_");
      if (STRIP_KEYS.has(nk)) continue;
      if (nk.endsWith("_consultada") || nk.endsWith("_consultado")) continue;
      // trunca strings muito longas (base64 etc) que sobraram
      if (typeof v === "string" && v.length > 4000) {
        out[k] = v.slice(0, 4000) + "…(truncado)";
      } else {
        out[k] = sanitize(v, depth + 1);
      }
    }
    return out;
  }
  return obj;
}

const SYSTEM_PROMPT = `Você é um formatador de dados de consultas brasileiras (CPF, CNPJ, telefone, placa, score, etc.).
Receberá um JSON bruto + o tipo da consulta. Devolva SOMENTE JSON válido no formato:

{
  "sections": [
    {
      "title": "TÍTULO EM CAIXA ALTA",
      "kind": "rows" | "table" | "text" | "empty",
      "rows": [{"label":"CAMPO","value":"VALOR FORMATADO"}],
      "headers": ["COL1","COL2"],
      "data": [["v1","v2"], ...],
      "text": "..."
    }
  ],
  "plain_text": "Texto plano completo formatado pra copiar"
}

Regras de formatação:
- CPF: 000.000.000-00 | CNPJ: 00.000.000/0000-00 | Telefone: (00) 00000-0000
- Datas: dd/mm/aaaa (sem hora salvo se for relevante) — converta "2022-06-23T00:00:00.000Z" pra "23/06/2022"
- Dinheiro: R$ 1.234,56
- Booleano: "SIM" / "NÃO"
- Vazio / null / "-" / "Não Informado" → omita a linha inteira
- Agrupe campos relacionados em seções lógicas (DADOS PESSOAIS, ENDEREÇOS, TELEFONES, EMAILS, VEÍCULOS, etc.)
- Use "table" quando houver lista de objetos com mesmas chaves (ex: vacinas, empregos, imóveis)
- Use "rows" pra pares chave/valor
- Use "text" só pra blocos longos de texto corrido
- Mantenha TODOS os dados úteis. Não invente. Não resuma.
- plain_text: replique tudo em texto monoespaçado com "CAMPO: valor" e separadores ━━━ entre seções.
- Retorne APENAS o JSON, sem markdown, sem comentário.`;

async function callAI(rawData: any, queryType: string, queryInput: string): Promise<any | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    console.error("[webapp-format-ai] LOVABLE_API_KEY ausente");
    return null;
  }
  const userPayload = {
    tipo_consulta: queryType,
    entrada: queryInput,
    dados_brutos: rawData,
  };
  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    response_format: { type: "json_object" },
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("[webapp-format-ai] AI gateway erro", resp.status, txt.slice(0, 400));
      return null;
    }
    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return null;
    try {
      return JSON.parse(content);
    } catch {
      // tenta extrair bloco json
      const m = String(content).match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : null;
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error("[webapp-format-ai] exceção AI:", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { path_token, secret_token, init_data, force } = await req.json();
    if (!path_token || !secret_token) {
      return new Response(JSON.stringify({ error: "tokens_ausentes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("HUB_SUPABASE_URL")!,
      Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: record, error } = await supabase
      .from("webapp_results")
      .select("*")
      .eq("path_token", path_token)
      .maybeSingle();
    if (error || !record) {
      return new Response(JSON.stringify({ error: "nao_encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (record.secret_token !== secret_token) {
      return new Response(JSON.stringify({ error: "token_invalido" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "expirado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Valida initData do Telegram
    const { data: botRow } = await supabase
      .from("telegram_bots")
      .select("token")
      .eq("id", record.bot_id)
      .maybeSingle();
    const botToken = botRow?.token;
    if (!botToken) {
      return new Response(JSON.stringify({ error: "bot_nao_encontrado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!init_data || typeof init_data !== "string") {
      return new Response(JSON.stringify({ error: "abra_pelo_telegram" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const validation = await validateTelegramInitData(init_data, botToken);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: "assinatura_invalida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (validation.userId !== Number(record.telegram_user_id)) {
      return new Response(JSON.stringify({ error: "consulta_de_outro_usuario" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Cache: se já tem formatted_data e não foi pedido recálculo, devolve direto
    if (!force && record.formatted_data) {
      return new Response(JSON.stringify({ ok: true, formatted: record.formatted_data, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const clean = sanitize(record.result_data);
    const formatted = await callAI(clean, record.query_type, record.query_input || "");
    if (!formatted || !Array.isArray(formatted.sections)) {
      return new Response(JSON.stringify({ ok: false, error: "ai_indisponivel" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Salva cache
    await supabase
      .from("webapp_results")
      .update({ formatted_data: formatted })
      .eq("id", record.id);

    return new Response(JSON.stringify({ ok: true, formatted, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[webapp-format-ai] erro:", err);
    return new Response(JSON.stringify({ error: "erro_interno", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
