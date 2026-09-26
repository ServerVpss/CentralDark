import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function workspaceNameMap() {
  const { data } = await supabaseAdmin.from("workspaces").select("id,name");
  const map: Record<string, string> = {};
  (data ?? []).forEach((w: any) => { map[w.id] = w.name; });
  return map;
}

export const adminListTags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [{ data: tags = [] }, names] = await Promise.all([
      supabaseAdmin.from("tags").select("id,workspace_id,name,color,created_at").order("created_at", { ascending: false }),
      workspaceNameMap(),
    ]);
    return (tags ?? []).map((t: any) => ({ ...t, workspace_name: names[t.workspace_id] ?? "—" }));
  });

export const adminListQuickReplies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [{ data = [] }, names] = await Promise.all([
      supabaseAdmin.from("quick_replies").select("id,workspace_id,shortcut,body,sector_id,created_at").order("created_at", { ascending: false }),
      workspaceNameMap(),
    ]);
    return (data ?? []).map((r: any) => ({ ...r, workspace_name: names[r.workspace_id] ?? "—" }));
  });

export const adminListRandomGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [{ data: groups = [] }, { data: variants = [] }, names] = await Promise.all([
      supabaseAdmin.from("random_message_groups").select("id,workspace_id,name,active,created_at").order("created_at", { ascending: false }),
      supabaseAdmin.from("random_message_variants").select("group_id"),
      workspaceNameMap(),
    ]);
    const counts: Record<string, number> = {};
    (variants ?? []).forEach((v: any) => { counts[v.group_id] = (counts[v.group_id] ?? 0) + 1; });
    return (groups ?? []).map((g: any) => ({ ...g, workspace_name: names[g.workspace_id] ?? "—", variants_count: counts[g.id] ?? 0 }));
  });

export const adminListSchedules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [{ data = [] }, names] = await Promise.all([
      supabaseAdmin.from("schedules").select("id,workspace_id,title,status,scheduled_at,created_at").order("scheduled_at", { ascending: false }).limit(500),
      workspaceNameMap(),
    ]);
    return (data ?? []).map((s: any) => ({ ...s, workspace_name: names[s.workspace_id] ?? "—" }));
  });

export const adminListVoiceAi = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [{ data = [] }, names] = await Promise.all([
      supabaseAdmin.from("workspace_voice_ai_settings").select("workspace_id,provider,language,voice,transcribe_incoming,reply_with_voice,updated_at"),
      workspaceNameMap(),
    ]);
    return (data ?? []).map((s: any) => ({ ...s, workspace_name: names[s.workspace_id] ?? "—" }));
  });

export const adminListWebhooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [{ data: webhooks = [] }, { data: tokens = [] }, { data: deliveries = [] }, names] = await Promise.all([
      supabaseAdmin.from("workspace_webhooks").select("id,workspace_id,name,target_url,events,active,created_at").order("created_at", { ascending: false }),
      supabaseAdmin.from("workspace_api_tokens").select("id,workspace_id,name,token_prefix,scopes,revoked,last_used_at,created_at").order("created_at", { ascending: false }),
      supabaseAdmin.from("workspace_webhook_deliveries").select("id,workspace_id,webhook_id,event,status,http_status,latency_ms,created_at").order("created_at", { ascending: false }).limit(200),
      workspaceNameMap(),
    ]);
    return {
      webhooks: (webhooks ?? []).map((w: any) => ({ ...w, workspace_name: names[w.workspace_id] ?? "—" })),
      tokens: (tokens ?? []).map((t: any) => ({ ...t, workspace_name: names[t.workspace_id] ?? "—" })),
      deliveries: (deliveries ?? []).map((d: any) => ({ ...d, workspace_name: names[d.workspace_id] ?? "—" })),
    };
  });
