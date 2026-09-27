// Ponte de leitura (read-only) para o Supabase do TelePainel (projeto kagejpghnwdfymddwxuf).
// Existe porque o Cockpit CentralDark (Instinto Superior) e o TelePainel são dois projetos
// Supabase separados; esta ponte é temporária, até uma decisão de migração definitiva.
// Nunca usar para escrita — só leitura de tabelas já expostas por RLS pública/autenticada.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BRIDGE_URL = import.meta.env["VITE_TELEPAINEL_SUPABASE_URL"] as string | undefined;
const BRIDGE_KEY = import.meta.env["VITE_TELEPAINEL_SUPABASE_PUBLISHABLE_KEY"] as
  string | undefined;

export const telepainelBridgeDisponivel = Boolean(BRIDGE_URL && BRIDGE_KEY);

let _client: SupabaseClient | null = null;

/** Retorna null (nunca lança) quando a ponte não está configurada — trate como AUTH_REQUIRED. */
export function obterClienteTelePainel(): SupabaseClient | null {
  if (!telepainelBridgeDisponivel) return null;
  if (!_client) {
    _client = createClient(BRIDGE_URL!, BRIDGE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
