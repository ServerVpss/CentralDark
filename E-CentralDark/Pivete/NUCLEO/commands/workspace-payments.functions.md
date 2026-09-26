# COMANDO - workspace-payments.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\workspace-payments.functions.ts
**SHA:** f04ff39aff350ba1
**Timestamp:** 2026-08-26T19:33:49.122565
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- business_hours_start: z.string().optional(),

### Ouro Bruto (primeiros 5000 chars)
```
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertWorkspaceAdmin(userId: string, workspaceId: string) {
  const { data: master } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (master) return;
  const { data: m } = await supabaseAdmin
    .from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", userId).maybeSingle();
  if (!m || m.role !== "admin") throw new Error("Acesso negado: apenas admin do workspace");
}

export const listAvailableGateways = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("payment_gateway_catalog")
      .select("provider_key,name,description,logo,logo_url,global_status,enabled_globally,is_implemented,supports_pix,supports_webhook,supports_refund,docs_url,sort_order")
      .order("sort_order").order("name");
    if (error) throw new Error(error.message);
    const items = (data ?? []).filter((g) => g.global_status !== "bloqueado" && g.global_status !== "desativado");
    return { items };
  });

export const listWorkspaceGateways = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspace_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspace_id);
    const { data: rows, error } = await supabaseAdmin
      .from("workspace_payment_gateways")
      .select("id,provider_key,display_name,is_enabled,is_default,environment,status,webhook_url,last_health_check_at,last_error,public_config,created_at,updated_at")
      .eq("workspace_id", data.workspace_id);
    if (error) throw new Error(error.message);
    return { items: rows ?? [] };
  });

const saveWorkspaceGatewaySchema = z.object({
  workspace_id: z.string().uuid(),
  provider_key: z.string().min(1),
  display_name: z.string().max(120).optional(),
  is_enabled: z.boolean().default(true),
  is_default: z.boolean().default(false),
  environment: z.enum(["production", "sandbox"]).default("production"),
  webhook_url: z.string().max(500).optional().nullable(),
  credentials: z.record(z.string(), z.string()).optional(),
  webhook_secret: z.string().max(500).optional().nullable(),
});

export const saveWorkspaceGateway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => saveWorkspaceGatewaySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspace_id);

    const { data: cat } = await supabaseAdmin
      .from("payment_gateway_catalog").select("global_status,is_implemented,name")
      .eq("provider_key", data.provider_key).single();
    if (!cat) throw new Error("Gateway desconhecido");
    if (cat.global_status === "bloqueado" || cat.global_status === "desativado")
      throw new Error("Gateway indisponível no momento");
    if (data.is_enabled && cat.global_status !== "ativo")
      throw new Error("Este gateway ainda não está liberado pelo Painel Master");

    const patch: Record<string, unknown> = {
      workspace_id: data.workspace_id,
      provider_key: data.provider_key,
      display_name: data.display_name ?? cat.name,
      is_enabled: data.is_enabled,
      is_default: data.is_default,
      environment: data.environment,
      webhook_url: data.webhook_url ?? null,
      status: data.is_enabled ? "active" : "disabled",
    };
    if (data.credentials) patch.credentials = data.credentials;
    if (data.webhook_secret) patch.webhook_secret = data.webhook_secret;

    if (data.is_default) {
      await supabaseAdmin.from("workspace_payment_gateways")
        .update({ is_default: false } as never)
        .eq("workspace_id", data.workspace_id);
    }

    const { data: row, error } = await supabaseAdmin
      .from("workspace_payment_gateways")
      .upsert(patch as never, { onConflict: "workspace_id,provider_key" })
      .select("id,provider_key,is_enabled,is_default,environment,webhook_url")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_log").insert({
      workspace_id: data.workspace_id,
      actor_user_id: context.userId,
      action: "workspace:gateway_save",
      category: "user",
      entity: "workspace_payment_gateways",
      entity_id: (row as { id: string }).id,
      payload: { provider_key: data.provider_key, is_enabled: data.is_enabled, is_default: data.is_default },
    } as never);

    return { gateway: row };
  });

export const getWorkspacePaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspace_id: z.str
```