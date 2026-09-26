# COMANDO - plans.functions.ts
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\lib\plans.functions.ts
**SHA:** f918cddb860f0170
**Timestamp:** 2026-08-26T19:41:34.689471
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- current_period_start: new Date().toISOString(),
- current_period_start: new Date().toISOString(),

### Ouro Bruto (primeiros 5000 chars)
```
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
        cam
```