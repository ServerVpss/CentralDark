import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertMaster(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin");
}

// ============ Catálogo global ============
export const listGatewayCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMaster(context.userId);
    const { data, error } = await supabaseAdmin
      .from("payment_gateway_catalog")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

const updateCatalogSchema = z.object({
  provider_key: z.string().min(1).max(50),
  global_status: z.enum(["ativo", "desativado", "em_breve", "manutencao", "bloqueado", "pendente_adapter"]).optional(),
  enabled_globally: z.boolean().optional(),
  notes: z.string().max(1000).nullable().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

export const updateGatewayCatalogEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => updateCatalogSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertMaster(context.userId);
    const { provider_key, ...patch } = data;

    // Bloqueio anti-fingir: só ativa se tiver adapter
    if (patch.global_status === "ativo") {
      const { data: row } = await supabaseAdmin
        .from("payment_gateway_catalog")
        .select("is_implemented")
        .eq("provider_key", provider_key)
        .single();
      if (!row?.is_implemented) {
        throw new Error("Este gateway ainda não tem adapter implementado — não pode ser marcado como ativo.");
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from("payment_gateway_catalog")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("provider_key", provider_key)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_user_id: context.userId,
      action: "admin:gateway_catalog_update",
      category: "admin",
      entity: "payment_gateway_catalog",
      entity_id: provider_key,
      payload: patch,
    });

    return { gateway: updated };
  });

// ============ Configurações globais de pagamento ============
const PAYMENT_FIELDS = [
  "payments_module_enabled",
  "payments_pix_commands_enabled",
  "payments_auto_collection_enabled",
  "payments_cash_flow_enabled",
  "payments_manual_confirmation_enabled",
  "payments_reminders_enabled",
  "payments_customer_self_pix_enabled",
  "payments_default_min_amount",
  "payments_default_max_amount",
  "payments_default_pix_expiration_minutes",
  "payments_default_max_reminders_per_payment",
  "payments_default_max_reminders_per_day",
  "payments_default_min_interval_minutes",
  "payments_default_business_hours_start",
  "payments_default_business_hours_end",
  "payments_allow_outside_business_hours",
  "payments_allow_workspace_override_limits",
  "payments_require_admin_for_expired_regen",
  "payments_pause_on_customer_reply",
  "payments_pause_on_agent_takeover",
  "payments_allow_resend_after_expiration",
  "payments_manual_confirm_admin_only",
  "payments_manual_confirm_require_reason",
  "payments_manual_confirm_require_proof",
  "payments_allow_workspace_custom_templates",
  "payments_tpl_pix_generated",
  "payments_tpl_reminder",
  "payments_tpl_last_warning",
  "payments_tpl_pix_expired",
  "payments_tpl_payment_confirmed",
  "payments_tpl_payment_not_found",
  "payments_tpl_collection_paused",
] as const;

export const getGlobalPaymentSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMaster(context.userId);
    const { data, error } = await supabaseAdmin
      .from("master_settings")
      .select(PAYMENT_FIELDS.join(","))
      .eq("id", 1)
      .single();
    if (error) throw new Error(error.message);
    return { settings: data };
  });

const updateSettingsSchema = z.record(z.string(), z.any());

export const updateGlobalPaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => updateSettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertMaster(context.userId);
    const patch: Record<string, unknown> = {};
    for (const k of PAYMENT_FIELDS) {
      if (k in data) patch[k] = data[k];
    }
    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabaseAdmin
      .from("master_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_user_id: context.userId,
      action: "admin:global_payment_settings_update",
      category: "admin",
      entity: "master_settings",
      payload: { fields: Object.keys(patch) },
    });
    return { ok: true };
  });
