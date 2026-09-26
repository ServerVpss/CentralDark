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
  .inputValidator((d) => z.object({ workspace_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspace_id);
    const { data: row } = await supabaseAdmin
      .from("workspace_payment_settings").select("*")
      .eq("workspace_id", data.workspace_id).maybeSingle();
    const { data: master } = await supabaseAdmin
      .from("master_settings")
      .select("payments_module_enabled,payments_auto_collection_enabled,payments_pix_commands_enabled,payments_customer_self_pix_enabled,payments_allow_workspace_override_limits,payments_allow_workspace_custom_templates,payments_default_min_amount,payments_default_max_amount,payments_default_pix_expiration_minutes,payments_default_max_reminders_per_payment,payments_default_max_reminders_per_day,payments_default_business_hours_start,payments_default_business_hours_end,payments_tpl_pix_generated,payments_tpl_reminder,payments_tpl_last_warning,payments_tpl_pix_expired,payments_tpl_payment_confirmed,payments_tpl_collection_paused")
      .eq("id", 1).single();
    return { settings: row, master };
  });

const wsSettingsSchema = z.object({
  workspace_id: z.string().uuid(),
  pix_commands_enabled: z.boolean().optional(),
  customer_can_generate_pix: z.boolean().optional(),
  auto_collection_enabled: z.boolean().optional(),
  auto_regenerate_expired_pix: z.boolean().optional(),
  require_admin_approval_after_expired: z.boolean().optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional(),
  pix_expiration_minutes: z.number().int().min(5).max(1440).optional(),
  reminder_intervals_minutes: z.array(z.number().int().min(5)).max(10).optional(),
  max_reminders_per_payment: z.number().int().min(0).max(50).optional(),
  max_reminders_per_day: z.number().int().min(0).max(100).optional(),
  business_hours_only: z.boolean().optional(),
  business_hours_start: z.string().optional(),
  business_hours_end: z.string().optional(),
  stop_on_customer_reply: z.boolean().optional(),
  stop_on_agent_takeover: z.boolean().optional(),
  default_gateway_provider_key: z.string().optional().nullable(),
  msg_pix_template: z.string().max(2000).optional().nullable(),
  msg_reminder_template: z.string().max(2000).optional().nullable(),
  msg_expired_template: z.string().max(2000).optional().nullable(),
  msg_paid_template: z.string().max(2000).optional().nullable(),
  msg_paused_template: z.string().max(2000).optional().nullable(),
  msg_not_found_template: z.string().max(2000).optional().nullable(),
});

export const saveWorkspacePaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => wsSettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspace_id);

    const { data: master } = await supabaseAdmin
      .from("master_settings")
      .select("payments_allow_workspace_override_limits,payments_allow_workspace_custom_templates")
      .eq("id", 1).single();

    const { workspace_id, ...rest } = data;
    const patch: Record<string, unknown> = { workspace_id };

    const limitKeys = new Set(["min_amount", "max_amount", "pix_expiration_minutes", "max_reminders_per_payment", "max_reminders_per_day", "reminder_intervals_minutes", "business_hours_start", "business_hours_end", "business_hours_only"]);
    const tplKeys = new Set(["msg_pix_template", "msg_reminder_template", "msg_expired_template", "msg_paid_template", "msg_paused_template", "msg_not_found_template"]);

    for (const [k, v] of Object.entries(rest)) {
      if (v === undefined) continue;
      if (limitKeys.has(k) && !master?.payments_allow_workspace_override_limits) continue;
      if (tplKeys.has(k) && !master?.payments_allow_workspace_custom_templates) continue;
      patch[k] = v;
    }

    const { error } = await supabaseAdmin
      .from("workspace_payment_settings")
      .upsert(patch as never, { onConflict: "workspace_id" });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_log").insert({
      workspace_id,
      actor_user_id: context.userId,
      action: "workspace:payment_settings_save",
      category: "user",
      entity: "workspace_payment_settings",
      payload: { fields: Object.keys(patch).filter((k) => k !== "workspace_id") },
    } as never);
    return { ok: true };
  });
