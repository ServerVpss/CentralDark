import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

// ---------- helpers ----------

async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const { data: sa } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (sa) return;
  const { data } = await supabaseAdmin
    .from("workspace_members").select("id")
    .eq("user_id", userId).eq("workspace_id", workspaceId).maybeSingle();
  if (!data) throw new Error("Acesso negado a este workspace.");
}

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

type PlanLimits = {
  plan_slug: string;
  plan_name: string;
  max_users: number;
  max_connections: number;
  max_messages_per_month: number;
  max_sectors: number;
  max_campaigns_per_month: number;
  allow_byok: boolean;
  allow_embedded_signup: boolean;
};

async function fetchPlanLimits(workspaceId: string): Promise<PlanLimits | null> {
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_id, status")
    .eq("workspace_id", workspaceId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!sub) return null;
  const { data: plan } = await supabaseAdmin
    .from("plans")
    .select("slug,name,max_users,max_connections,max_messages_per_month,max_sectors,max_campaigns_per_month,allow_byok,allow_embedded_signup")
    .eq("id", sub.plan_id)
    .single();
  if (!plan) return null;
  const p = plan as unknown as Omit<PlanLimits, "plan_slug" | "plan_name"> & { slug: string; name: string };
  return {
    plan_slug: p.slug,
    plan_name: p.name,
    max_users: p.max_users,
    max_connections: p.max_connections,
    max_messages_per_month: p.max_messages_per_month,
    max_sectors: p.max_sectors,
    max_campaigns_per_month: p.max_campaigns_per_month,
    allow_byok: p.allow_byok,
    allow_embedded_signup: p.allow_embedded_signup,
  };
}

async function getCurrentMonthUsage(workspaceId: string) {
  const today = new Date();
  const month = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const { data } = await supabaseAdmin
    .from("workspace_usage" as never)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("month", month)
    .maybeSingle();
  const row = data as { ai_responses_count?: number; campaigns_sent?: number; messages_sent?: number } | null;
  return {
    month,
    ai_responses_count: row?.ai_responses_count ?? 0,
    campaigns_sent: row?.campaigns_sent ?? 0,
    messages_sent: row?.messages_sent ?? 0,
  };
}

// ---------- public reads ----------

export const listAvailablePlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("plans")
      .select("id,slug,name,description,price_cents,currency,interval,max_users,max_connections,max_messages_per_month,max_sectors,max_campaigns_per_month,allow_byok,allow_embedded_signup,features,active,sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getWorkspacePlanAndUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const limits = await fetchPlanLimits(data.workspaceId);
    const usage = await getCurrentMonthUsage(data.workspaceId);
    const [{ count: usersCount }, { count: connsCount }, { count: sectorsCount }] = await Promise.all([
      supabaseAdmin.from("workspace_members").select("*", { count: "exact", head: true }).eq("workspace_id", data.workspaceId),
      supabaseAdmin.from("whatsapp_connections").select("*", { count: "exact", head: true }).eq("workspace_id", data.workspaceId),
      supabaseAdmin.from("sectors").select("*", { count: "exact", head: true }).eq("workspace_id", data.workspaceId),
    ]);
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id,status,current_period_end,gateway,amount_cents,plan_id")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      limits,
      subscription: sub,
      usage: {
        ai_responses: usage.ai_responses_count,
        campaigns: usage.campaigns_sent,
        messages: usage.messages_sent,
      },
      counts: {
        users: usersCount ?? 0,
        connections: connsCount ?? 0,
        sectors: sectorsCount ?? 0,
      },
    };
  });

// ---------- limit assertion (called by other server fns) ----------

export type LimitKind = "users" | "connections" | "sectors" | "campaigns" | "ai_responses" | "messages";

export async function assertPlanLimit(workspaceId: string, kind: LimitKind, increment = 1): Promise<void> {
  const limits = await fetchPlanLimits(workspaceId);
  if (!limits) throw new Error("Sua empresa ainda não tem um plano ativo. Escolha um em /app/planos/lista.");

  if (kind === "users") {
    const { count } = await supabaseAdmin.from("workspace_members").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId);
    if ((count ?? 0) + increment > limits.max_users) {
      throw new Error(`Limite do plano ${limits.plan_name}: máximo de ${limits.max_users} atendente(s). Faça upgrade pra adicionar mais.`);
    }
    return;
  }
  if (kind === "connections") {
    const { count } = await supabaseAdmin.from("whatsapp_connections").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId);
    if ((count ?? 0) + increment > limits.max_connections) {
      throw new Error(`Limite do plano ${limits.plan_name}: máximo de ${limits.max_connections} conexão(ões) WhatsApp. Faça upgrade pra adicionar mais.`);
    }
    return;
  }
  if (kind === "sectors") {
    const { count } = await supabaseAdmin.from("sectors").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId);
    if ((count ?? 0) + increment > limits.max_sectors) {
      throw new Error(`Limite do plano ${limits.plan_name}: máximo de ${limits.max_sectors} setor(es). Faça upgrade.`);
    }
    return;
  }
  const usage = await getCurrentMonthUsage(workspaceId);
  if (kind === "campaigns") {
    if (limits.max_campaigns_per_month <= 0) {
      throw new Error(`Campanhas em massa não estão disponíveis no plano ${limits.plan_name}. Faça upgrade pro Premium.`);
    }
    if (usage.campaigns_sent + increment > limits.max_campaigns_per_month) {
      throw new Error(`Limite mensal de campanhas atingido (${limits.max_campaigns_per_month}). Aguarde o próximo mês ou faça upgrade.`);
    }
    return;
  }
  if (kind === "ai_responses") {
    // BYOK bypass: se workspace tem chave própria ativa, libera
    const { data: ai } = await supabaseAdmin
      .from("workspace_ai_keys" as never)
      .select("active")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if ((ai as { active?: boolean } | null)?.active) return;
    if (usage.ai_responses_count + increment > limits.max_messages_per_month) {
      throw new Error(`Limite mensal de respostas de IA atingido (${limits.max_messages_per_month}). Use sua própria chave (Premium) ou faça upgrade.`);
    }
    return;
  }
  if (kind === "messages") {
    if (usage.messages_sent + increment > limits.max_messages_per_month * 5) {
      // nominal cap; not strict
      return;
    }
  }
}

export async function incrementUsage(workspaceId: string, kind: "ai_responses" | "campaigns" | "messages", by = 1) {
  const today = new Date();
  const month = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const column = kind === "ai_responses" ? "ai_responses_count" : kind === "campaigns" ? "campaigns_sent" : "messages_sent";
  // upsert
  const { data: existing } = await supabaseAdmin
    .from("workspace_usage" as never)
    .select("id, ai_responses_count, campaigns_sent, messages_sent")
    .eq("workspace_id", workspaceId)
    .eq("month", month)
    .maybeSingle();
  if (!existing) {
    const insertRow: Record<string, unknown> = { workspace_id: workspaceId, month };
    insertRow[column] = by;
    await supabaseAdmin.from("workspace_usage" as never).insert(insertRow as never);
  } else {
    const e = existing as Record<string, number>;
    const updateRow: Record<string, unknown> = {};
    updateRow[column] = (e[column] ?? 0) + by;
    await supabaseAdmin.from("workspace_usage" as never).update(updateRow as never).eq("id", e.id as unknown as string);
  }
}

// ---------- subscriptions / pix (skeleton) ----------

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid(),
    planId: z.string().uuid(),
    gateway: z.enum(["mercadopago", "efi", "manual"]).default("manual"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const { data: plan } = await supabaseAdmin
      .from("plans").select("price_cents,name,slug").eq("id", data.planId).single();
    if (!plan) throw new Error("Plano não encontrado.");

    // Skeleton: cria/atualiza subscription como "pending_payment"
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const { data: existing } = await supabaseAdmin
      .from("subscriptions").select("id").eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    const payload = {
      workspace_id: data.workspaceId,
      plan_id: data.planId,
      status: "pending_payment",
      gateway: data.gateway,
      amount_cents: plan.price_cents,
      pix_qr_code: null,
      pix_copy_paste: "PIX_PENDENTE_CONFIGURACAO_GATEWAY",
      pix_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      current_period_end: periodEnd.toISOString(),
    };

    if (existing) {
      await supabaseAdmin.from("subscriptions").update(payload).eq("id", existing.id);
    } else {
      await supabaseAdmin.from("subscriptions").insert(payload);
    }

    return {
      ok: true,
      gateway: data.gateway,
      pending: true,
      message: "Pagamento em manutenção — gateway PIX ainda não foi conectado pelo administrador. Entre em contato pra liberar manualmente.",
      amount_cents: plan.price_cents,
    };
  });

// ---------- master admin ----------

export const adminListSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("id,workspace_id,plan_id,status,gateway,current_period_end,amount_cents,created_at,updated_at")
      .order("created_at", { ascending: false }).limit(500);
    const wsIds = Array.from(new Set((subs ?? []).map((s) => s.workspace_id)));
    const planIds = Array.from(new Set((subs ?? []).map((s) => s.plan_id).filter(Boolean) as string[]));
    const [{ data: ws }, { data: plans }] = await Promise.all([
      wsIds.length ? supabaseAdmin.from("workspaces").select("id,name").in("id", wsIds) : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
      planIds.length ? supabaseAdmin.from("plans").select("id,name,slug").in("id", planIds) : Promise.resolve({ data: [] as Array<{ id: string; name: string; slug: string }> }),
    ]);
    const wsMap = new Map((ws ?? []).map((w) => [w.id, w.name]));
    const planMap = new Map((plans ?? []).map((p) => [p.id, p]));
    return (subs ?? []).map((s) => ({
      ...s,
      workspace_name: wsMap.get(s.workspace_id) ?? "—",
      plan: s.plan_id ? planMap.get(s.plan_id) : null,
    }));
  });

export const adminMarkSubscriptionPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    subscriptionId: z.string().uuid(),
    days: z.number().min(1).max(365).default(30),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + data.days);
    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .eq("id", data.subscriptionId)
      .select("workspace_id")
      .single();
    if (error) throw new Error(error.message);

    // libera workspace_controls
    await supabaseAdmin.from("workspace_controls" as never).upsert({
      workspace_id: sub.workspace_id,
      subscription_status: "active",
      is_paused: false,
    } as never);

    await logAction({
      category: "admin", action: "subscription_marked_paid",
      actorUserId: context.userId, workspaceId: sub.workspace_id,
      entity: "subscriptions", entityId: data.subscriptionId,
      after: { status: "active", days: data.days, period_end: periodEnd.toISOString() },
    });
    return { ok: true };
  });

export const adminUpdatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    planId: z.string().uuid(),
    name: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional(),
    price_cents: z.number().min(0).optional(),
    max_users: z.number().min(1).optional(),
    max_connections: z.number().min(1).optional(),
    max_messages_per_month: z.number().min(0).optional(),
    max_sectors: z.number().min(1).optional(),
    max_campaigns_per_month: z.number().min(0).optional(),
    allow_byok: z.boolean().optional(),
    active: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { planId, ...updates } = data;
    const { data: before } = await supabaseAdmin.from("plans").select("*").eq("id", planId).maybeSingle();
    const { error } = await supabaseAdmin.from("plans").update(updates).eq("id", planId);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin", action: "plan_updated",
      actorUserId: context.userId, entity: "plans", entityId: planId,
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), ...updates },
    });
    return { ok: true };
  });

export const adminAssignPlanToWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid(),
    planId: z.string().uuid(),
    days: z.number().min(1).max(365).default(30),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + data.days);
    const { data: existing } = await supabaseAdmin
      .from("subscriptions").select("id").eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      await supabaseAdmin.from("subscriptions").update({
        plan_id: data.planId, status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabaseAdmin.from("subscriptions").insert({
        workspace_id: data.workspaceId, plan_id: data.planId, status: "active",
        current_period_end: periodEnd.toISOString(),
      });
    }
    await logAction({
      category: "admin", action: "plan_assigned",
      actorUserId: context.userId, workspaceId: data.workspaceId,
      entity: "subscriptions", entityId: existing?.id ?? null,
      after: { plan_id: data.planId, days: data.days, period_end: periodEnd.toISOString() },
    });
    return { ok: true };
  });
