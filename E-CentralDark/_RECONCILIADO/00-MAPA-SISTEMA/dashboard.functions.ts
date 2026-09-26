import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type HomePayload = {
  counts: {
    users: { used: number; total: number };
    channels: { used: number; total: number };
    contacts: { used: number; total: number };
    active_conversations: number;
    schedules: { used: number; total: number };
    chatbots_active: { used: number; total: number };
    contact_groups: number;
    templates: number;
    labels: number;
  };
  conversations_monthly: Array<{ month: string; ativas: number; encerradas: number }>;
  contacts_monthly: Array<{ month: string; total: number }>;
  weekly_attendance: Array<{ day: string; realizados: number; media: number }>;
  channels_status: { connected: number; disconnected: number };
  sectors_distribution: Array<{ name: string; value: number; color?: string | null }>;
  metrics: {
    avg_response_seconds: number;
    avg_resolution_seconds: number;
    total_attendances: number;
    productivity_pct: number;
  };
  app_links: { ios: string | null; android: string | null };
  brand_name: string;
  whatsapp_status: {
    connected_count: number;
    pending_count: number;
    messages_24h: number;
    last_event_at: string | null;
    last_event_type: string | null;
    last_signature_invalid: boolean;
    health: "ok" | "waiting_first_message" | "no_connection" | "pending_validation" | "warning";
  };
};

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildMonthBuckets() {
  const out: Array<{ key: string; label: string; year: number; month: number }> = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_SHORT[d.getMonth()]}. de ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return out;
}

function buildWeekBuckets() {
  const out: Array<{ key: string; label: string; date: Date }> = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({
      key: d.toISOString().slice(0, 10),
      label: WEEK_SHORT[d.getDay()],
      date: d,
    });
  }
  return out;
}

async function loadAppLinks() {
  // master_settings can be extended later. For now, no-op (no app store URLs yet).
  return { ios: null as string | null, android: null as string | null };
}

async function buildPayload(opts: { workspaceId?: string | null }): Promise<HomePayload> {
  const ws = opts.workspaceId ?? null;
  const eq = <T extends { eq: any }>(q: T) => (ws ? q.eq("workspace_id", ws) : q);

  let brand_name = "MultiZap";
  if (ws) {
    const { data: b } = await supabaseAdmin
      .from("workspace_branding").select("brand_name").eq("workspace_id", ws).maybeSingle();
    if (b?.brand_name && b.brand_name.trim()) brand_name = b.brand_name.trim();
  }

  const monthBuckets = buildMonthBuckets();
  const weekBuckets = buildWeekBuckets();
  const sinceMonth = new Date(monthBuckets[0].year, monthBuckets[0].month, 1).toISOString();
  const sinceWeek = weekBuckets[0].date.toISOString();

  const [
    membersQ, contactsQ, channelsQ, agentsQ,
    activeTicketsQ, allTicketsQ, ticketsRecentQ, contactsRecentQ, sectorsQ,
  ] = await Promise.all([
    eq(supabaseAdmin.from("workspace_members").select("*", { count: "exact", head: true })),
    eq(supabaseAdmin.from("contacts").select("*", { count: "exact", head: true })),
    eq(supabaseAdmin.from("whatsapp_connections").select("id,status,last_webhook_at")),
    eq(supabaseAdmin.from("ai_agent_configs").select("id,active")),
    eq(supabaseAdmin.from("tickets").select("*", { count: "exact", head: true })).in("status", ["open", "in_progress", "waiting_client", "critical"]),
    eq(supabaseAdmin.from("tickets").select("*", { count: "exact", head: true })),
    eq(supabaseAdmin.from("tickets").select("id,status,created_at,sector_id")).gte("created_at", sinceMonth),
    eq(supabaseAdmin.from("contacts").select("created_at")).gte("created_at", sinceMonth),
    eq(supabaseAdmin.from("sectors").select("id,name,color")),
  ]);

  const channels = (channelsQ.data ?? []) as Array<{ id: string; status: string; last_webhook_at: string | null }>;
  const connected = channels.filter((c) => c.status === "connected").length;
  const pendingChannels = channels.filter((c) => c.status !== "connected").length;

  // WhatsApp health: msgs 24h + último evento webhook
  const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [msgs24Q, lastEvtQ] = ws ? await Promise.all([
    supabaseAdmin.from("whatsapp_message_log")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", ws).gte("created_at", since24h),
    supabaseAdmin.from("whatsapp_webhook_events")
      .select("event_type,created_at,signature_valid")
      .eq("workspace_id", ws).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]) : [{ count: 0 } as any, { data: null } as any];

  const lastEvt = (lastEvtQ as any)?.data ?? null;
  let health: "ok" | "waiting_first_message" | "no_connection" | "pending_validation" | "warning" = "no_connection";
  if (channels.length === 0) health = "no_connection";
  else if (pendingChannels > 0 && connected === 0) health = "pending_validation";
  else if (lastEvt?.signature_valid === false) health = "warning";
  else if (connected > 0 && (msgs24Q.count ?? 0) === 0 && !lastEvt) health = "waiting_first_message";
  else if (connected > 0) health = "ok";
  const agents = (agentsQ.data ?? []) as Array<{ id: string; active: boolean }>;
  const activeAgents = agents.filter((a) => a.active).length;

  // Monthly conversation series
  const convMap = new Map(monthBuckets.map((b) => [b.key, { month: b.label, ativas: 0, encerradas: 0 }]));
  for (const t of ticketsRecentQ.data ?? []) {
    const d = new Date(t.created_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = convMap.get(key);
    if (!bucket) continue;
    if (t.status === "resolved" || t.status === "closed") bucket.encerradas++;
    else bucket.ativas++;
  }

  // Monthly contact growth
  const contactsMap = new Map(monthBuckets.map((b) => [b.key, { month: b.label, total: 0 }]));
  for (const c of contactsRecentQ.data ?? []) {
    const d = new Date(c.created_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = contactsMap.get(key);
    if (bucket) bucket.total++;
  }

  // Weekly attendance — count tickets created per day in last 7 days
  const weekMap = new Map(weekBuckets.map((b) => [b.key, { day: b.label, realizados: 0, media: 0 }]));
  let weekTotal = 0;
  for (const t of ticketsRecentQ.data ?? []) {
    const d = new Date(t.created_at as string);
    if (d < weekBuckets[0].date) continue;
    const key = d.toISOString().slice(0, 10);
    const b = weekMap.get(key);
    if (b) { b.realizados++; weekTotal++; }
  }
  const media = Math.round(weekTotal / 7);
  weekMap.forEach((v) => { v.media = media; });

  // Sectors distribution (only for tickets in last 12 months)
  const sectors = (sectorsQ.data ?? []) as Array<{ id: string; name: string; color: string | null }>;
  const sectorCount = new Map<string, number>();
  for (const t of ticketsRecentQ.data ?? []) {
    if (!t.sector_id) continue;
    sectorCount.set(t.sector_id as string, (sectorCount.get(t.sector_id as string) ?? 0) + 1);
  }
  const sectors_distribution = sectors.map((s) => ({
    name: s.name,
    value: sectorCount.get(s.id) ?? 0,
    color: s.color,
  })).filter((s) => s.value > 0);

  // Plan totals — placeholder until plan/quota wiring
  const planTotals = { users: 7, channels: 1, contacts: 5000, schedules: 100, chatbots: 2 };

  return {
    counts: {
      users: { used: membersQ.count ?? 0, total: planTotals.users },
      channels: { used: channels.length, total: planTotals.channels },
      contacts: { used: contactsQ.count ?? 0, total: planTotals.contacts },
      active_conversations: activeTicketsQ.count ?? 0,
      schedules: { used: 0, total: planTotals.schedules },
      chatbots_active: { used: activeAgents, total: planTotals.chatbots },
      contact_groups: 0,
      templates: 0,
      labels: 0,
    },
    conversations_monthly: Array.from(convMap.values()),
    contacts_monthly: Array.from(contactsMap.values()),
    weekly_attendance: Array.from(weekMap.values()),
    channels_status: { connected, disconnected: channels.length - connected },
    sectors_distribution,
    metrics: {
      avg_response_seconds: 0,
      avg_resolution_seconds: 0,
      total_attendances: allTicketsQ.count ?? 0,
      productivity_pct: 0,
    },
    app_links: await loadAppLinks(),
    brand_name,
    whatsapp_status: {
      connected_count: connected,
      pending_count: pendingChannels,
      messages_24h: msgs24Q.count ?? 0,
      last_event_at: lastEvt?.created_at ?? null,
      last_event_type: lastEvt?.event_type ?? null,
      last_signature_invalid: lastEvt?.signature_valid === false,
      health,
    },
  };
}

export const getWorkspaceHome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // RLS-scoped check: ensure caller is in this workspace
    const { data: member } = await supabaseAdmin
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", data.workspaceId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!member) {
      const { data: sa } = await supabaseAdmin
        .from("user_roles").select("role")
        .eq("user_id", context.userId).eq("role", "super_admin").maybeSingle();
      if (!sa) throw new Error("Acesso negado a este workspace.");
    }
    return buildPayload({ workspaceId: data.workspaceId });
  });

export const getAdminHome = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: sa } = await supabaseAdmin
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "super_admin").maybeSingle();
    if (!sa) throw new Error("Acesso restrito ao Super Admin.");
    return buildPayload({ workspaceId: null });
  });
