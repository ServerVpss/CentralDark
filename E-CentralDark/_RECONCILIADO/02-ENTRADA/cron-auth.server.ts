import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Guarda compartilhada pros endpoints /api/public/cron/*.
 * Exige header `x-cron-secret` igual ao valor armazenado em `master_settings.cron_secret`
 * (mesma fonte que o pg_cron usa). Suporta fallback pro env `CRON_SECRET` se existir.
 *
 * Retorna `null` se autorizado, ou uma `Response` 401/503 pra devolver direto.
 */

let _cachedSecret: string | null = null;
let _cachedAt = 0;
const CACHE_MS = 60_000;

async function loadSecret(): Promise<string | null> {
  const now = Date.now();
  if (_cachedSecret && now - _cachedAt < CACHE_MS) return _cachedSecret;

  // 1. fonte primária: banco (mesma do pg_cron)
  try {
    const { data, error } = await supabaseAdmin
      .from("master_settings")
      .select("cron_secret")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data?.cron_secret && data.cron_secret.length >= 16) {
      _cachedSecret = data.cron_secret as string;
      _cachedAt = now;
      return _cachedSecret;
    }
  } catch {
    // segue pro fallback de env
  }

  // 2. fallback: env CRON_SECRET (se o usuário cadastrou manualmente)
  const env = process.env.CRON_SECRET;
  if (env && env.length >= 16) {
    _cachedSecret = env;
    _cachedAt = now;
    return env;
  }
  return null;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function requireCronSecret(request: Request): Promise<void> {
  const expected = await loadSecret();
  if (!expected) {
    throw new Response("CRON_SECRET não configurado", { status: 503 });
  }
  // Aceita tanto x-cron-secret quanto Authorization: Bearer <secret>
  const headerVal = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const incoming = headerVal ?? bearer ?? "";
  if (!constantTimeEqual(incoming, expected)) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
