# CONTRATO - gateway-console.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\gateway-console.functions.ts
**SHA:** 8e35af38077c0c75
**Timestamp:** 2026-08-26T19:33:44.834017
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pathPattern: RegExp;
- { id: "gw_diag",         label: "GET /__diag/wuzapi",                       method: "GET",  pathPattern: /^\/__diag\/wuzapi$/ },
- { id: "gw_list",         label: "GET /connections",                          method: "GET",  pathPattern: /^\/connections$/ },
- { id: "conn_status",     label: "GET /connections/:id/status",               method: "GET",  pathPattern: /^\/connections\/[a-f0-9-]+\/status$/ },
- { id: "conn_profile",    label: "POST /connections/:id/profile-picture",     method: "POST", pathPattern: /^\/connections\/[a-f0-9-]+\/profile-picture$/, needsBody: true },
- { id: "conn_group_info", label: "POST /connections/:id/group-info",          method: "POST", pathPattern: /^\/connections\/[a-f0-9-]+\/group-info$/,      needsBody: true },

### Ouro Bruto (primeiros 5000 chars)
```
// Console de diagnóstico WuzAPI/Gateway — somente super_admin.
// Permite disparar chamadas no Gateway com whitelist e ver a resposta crua
// (status HTTP + JSON), além de listar eventos recentes recebidos via webhook.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCallRaw, type GatewayRawResult } from "./multizap-gateway.server";

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

// --- whitelist de paths permitidos no console -------------------------------
// Cada entrada define método + regex do path. Mantém o console seguro: nenhuma
// rota destrutiva (delete, logout, restart) é aceita aqui — pra essas existem
// os endpoints específicos com confirmação.
type ConsoleEndpoint = {
  id: string;
  label: string;
  method: "GET" | "POST";
  pathPattern: RegExp;
  needsBody?: boolean;
};

const ALLOWED: ConsoleEndpoint[] = [
  { id: "gw_diag",         label: "GET /__diag/wuzapi",                       method: "GET",  pathPattern: /^\/__diag\/wuzapi$/ },
  { id: "gw_list",         label: "GET /connections",                          method: "GET",  pathPattern: /^\/connections$/ },
  { id: "conn_status",     label: "GET /connections/:id/status",               method: "GET",  pathPattern: /^\/connections\/[a-f0-9-]+\/status$/ },
  { id: "conn_profile",    label: "POST /connections/:id/profile-picture",     method: "POST", pathPattern: /^\/connections\/[a-f0-9-]+\/profile-picture$/, needsBody: true },
  { id: "conn_group_info", label: "POST /connections/:id/group-info",          method: "POST", pathPattern: /^\/connections\/[a-f0-9-]+\/group-info$/,      needsBody: true },
];

function findEndpoint(method: string, path: string) {
  return ALLOWED.find((e) => e.method === method && e.pathPattern.test(path));
}

// --- chamada raw ------------------------------------------------------------
const RawCallSchema = z.object({
  method: z.enum(["GET", "POST"]),
  path: z.string().min(2).max(300),
  body: z.unknown().optional(),
});

export const adminGatewayRawCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RawCallSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const endpoint = findEndpoint(data.method, data.path);
    if (!endpoint) {
      throw new Error(`Path não permitido no console: ${data.method} ${data.path}`);
    }
    const init: RequestInit = { method: data.method };
    if (data.method === "POST") {
      init.body = JSON.stringify(data.body ?? {});
    }
    const res: GatewayRawResult = await gatewayCallRaw(data.path, init, { timeoutMs: 15000 });
    // parsed_json é `unknown` (não serializável). Cliente parseia raw_text.
    return {
      endpoint_id: endpoint.id,
      endpoint_label: endpoint.label,
      method: data.method,
      path: data.path,
      http_status: res.http_status,
      latency_ms: res.latency_ms,
      ok: res.ok,
      raw_text: res.raw_text,
      parse_ok: res.parse_ok,
      network_error: res.network_error,
      called_at: new Date().toISOString(),
    };
  });


// --- listagem de endpoints disponíveis no console ---------------------------
export const adminListConsoleEndpoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    return ALLOWED.map((e) => ({
      id: e.id,
      label: e.label,
      method: e.method,
      needs_body: !!e.needsBody,
    }));
  });

// --- conexões QR (pra picker no console) ------------------------------------
export const adminListQrConnectionsForConsole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id, name, phone, status, workspace_id, session_data")
      .eq("provider", "wuzapi_gateway")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    // session_data pode conter o connection_id real do Gateway
    return (data || []).map((c) => {
      const sd = (c.session_data || {}) as Record<string, unknown>;
      const gwConnId = (sd.gateway_connection_id as string | undefined)
        || (sd.connection_id as string | undefined)
        || c.id;
      return {
        id: c.id,
        gateway_connection_id: gwConnId,
        name: c.name,
        phone: c.phone,
        status: c.status,
        workspace_id: c.workspace_id,
 
```