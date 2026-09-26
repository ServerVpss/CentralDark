import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function getUserWorkspaceId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("workspace_members").select("workspace_id")
    .eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  return data?.workspace_id ?? null;
}

// Segurança: scope="admin" expõe dados de TODOS os workspaces. Só super admin pode usar.
async function assertSuperAdminIfGlobal(userId: string, scope: "workspace" | "admin") {
  if (scope !== "admin") return;
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

const RangeSchema = z.object({
  scope: z.enum(["workspace", "admin"]).default("workspace"),
  days: z.number().int().min(1).max(90).default(14),
});

export type DailyPoint = { day: string; value: number };
export type AgentPerf = { user_id: string; name: string; tickets: number; messages: number; avg_first_response_min: number };
export type SatisfactionSummary = {
  total: number;
  avg: number;
  promoters: number; passives: number; detractors: number;
  nps: number;
  recent: { rating: number; comment: string | null; created_at: string }[];
  daily: DailyPoint[];
};

// ---- ATENDIMENTOS: volume diário + por status + por setor + por atendente ----
export const reportTickets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RangeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdminIfGlobal(context.userId, data.scope);
    const ws = data.scope === "workspace" ? await getUserWorkspaceId(context.userId) : null;
    const since = new Date(Date.now() - data.days * 24 * 3600 * 1000).toISOString();

    let q = supabaseAdmin.from("tickets")
      .select("id, status, sector_id, assignee_id, opened_at, first_response_at, last_message_at, workspace_id")
      .gte("opened_at", since).limit(5000);
    if (ws) q = q.eq("workspace_id", ws);
    const { data: tickets = [], error } = await q;
    if (error) throw new Error(error.message);
    const list = tickets ?? [];

    // daily opened
    const dayMap = new Map<string, number>();
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      dayMap.set(d, 0);
    }
    list.forEach((t) => {
      const k = (t.opened_at as string).slice(0, 10);
      if (dayMap.has(k)) dayMap.set(k, (dayMap.get(k) ?? 0) + 1);
    });
    const daily: DailyPoint[] = Array.from(dayMap.entries()).map(([day, value]) => ({ day, value }));

    // by status
    const byStatus = list.reduce<Record<string, number>>((acc, t) => {
      const k = String(t.status);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    // by sector (lookup names)
    const sectorIds = Array.from(new Set(list.map((t) => t.sector_id).filter(Boolean))) as string[];
    const { data: sectors = [] } = sectorIds.length
      ? await supabaseAdmin.from("sectors").select("id, name").in("id", sectorIds)
      : { data: [] as { id: string; name: string }[] };
    const sectorName = new Map((sectors ?? []).map((s) => [s.id, s.name]));
    const bySector = list.reduce<Record<string, number>>((acc, t) => {
      const k = t.sector_id ? (sectorName.get(t.sector_id) ?? "—") : "Sem setor";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    // agents
    const agentIds = Array.from(new Set(list.map((t) => t.assignee_id).filter(Boolean))) as string[];
    const { data: profiles = [] } = agentIds.length
      ? await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", agentIds)
      : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
    const profMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.email || "—"]));

    const agentAgg = new Map<string, { tickets: number; sumResp: number; respN: number }>();
    list.forEach((t) => {
      if (!t.assignee_id) return;
      const a = agentAgg.get(t.assignee_id) ?? { tickets: 0, sumResp: 0, respN: 0 };
      a.tickets++;
      if (t.first_response_at && t.opened_at) {
        const ms = new Date(t.first_response_at).getTime() - new Date(t.opened_at as string).getTime();
        if (ms > 0) { a.sumResp += ms; a.respN++; }
      }
      agentAgg.set(t.assignee_id, a);
    });

    // messages per agent
    let mq = supabaseAdmin.from("ticket_messages")
      .select("author_user_id, workspace_id, created_at")
      .gte("created_at", since).eq("author", "agent" as never).limit(20000);
    if (ws) mq = mq.eq("workspace_id", ws);
    const { data: msgs = [] } = await mq;
    const msgPerAgent = new Map<string, number>();
    (msgs ?? []).forEach((m) => {
      if (!m.author_user_id) return;
      msgPerAgent.set(m.author_user_id, (msgPerAgent.get(m.author_user_id) ?? 0) + 1);
    });

    const agents: AgentPerf[] = Array.from(agentAgg.entries()).map(([uid, v]) => ({
      user_id: uid,
      name: profMap.get(uid) ?? "—",
      tickets: v.tickets,
      messages: msgPerAgent.get(uid) ?? 0,
      avg_first_response_min: v.respN ? Math.round(v.sumResp / v.respN / 60000) : 0,
    })).sort((a, b) => b.tickets - a.tickets);

    return {
      total: list.length,
      open: byStatus.open ?? 0,
      resolved: byStatus.resolved ?? 0,
      closed: byStatus.closed ?? 0,
      daily,
      bySector: Object.entries(bySector).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      agents,
    };
  });

// ---- SATISFAÇÃO: NPS / CSAT ----
export const reportSatisfaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RangeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdminIfGlobal(context.userId, data.scope);
    const ws = data.scope === "workspace" ? await getUserWorkspaceId(context.userId) : null;
    const since = new Date(Date.now() - data.days * 24 * 3600 * 1000).toISOString();
    let q = supabaseAdmin.from("satisfaction_ratings")
      .select("rating, comment, created_at, workspace_id")
      .gte("created_at", since).order("created_at", { ascending: false }).limit(2000);
    if (ws) q = q.eq("workspace_id", ws);
    const { data: rows = [], error } = await q;
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    const total = list.length;
    const avg = total ? +(list.reduce((a, r) => a + r.rating, 0) / total).toFixed(2) : 0;
    const promoters = list.filter((r) => r.rating >= 9).length;
    const detractors = list.filter((r) => r.rating <= 6).length;
    const passives = total - promoters - detractors;
    const nps = total ? Math.round(((promoters - detractors) / total) * 100) : 0;

    const dayMap = new Map<string, number[]>();
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      dayMap.set(d, []);
    }
    list.forEach((r) => {
      const k = (r.created_at as string).slice(0, 10);
      if (dayMap.has(k)) dayMap.get(k)!.push(r.rating);
    });
    const daily: DailyPoint[] = Array.from(dayMap.entries()).map(([day, arr]) => ({
      day,
      value: arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0,
    }));

    const recent = list.slice(0, 12).map((r) => ({
      rating: r.rating, comment: r.comment, created_at: r.created_at,
    }));

    const out: SatisfactionSummary = { total, avg, promoters, passives, detractors, nps, recent, daily };
    return out;
  });

// ---- HISTÓRICO: busca de conversas ----
export const searchTicketHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["workspace", "admin"]).default("workspace"),
    q: z.string().max(200).optional(),
    status: z.string().max(20).optional(),
    days: z.number().int().min(1).max(180).default(30),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdminIfGlobal(context.userId, data.scope);
    const ws = data.scope === "workspace" ? await getUserWorkspaceId(context.userId) : null;
    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    let q = supabaseAdmin.from("tickets")
      .select("id, subject, status, last_message_preview, last_message_at, opened_at, contact_id, assignee_id, workspace_id")
      .gte("opened_at", since).order("last_message_at", { ascending: false }).limit(200);
    if (ws) q = q.eq("workspace_id", ws);
    if (data.status) q = q.eq("status", data.status as never);
    if (data.q) q = q.ilike("last_message_preview", `%${data.q}%`);
    const { data: rows = [], error } = await q;
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    const ids = Array.from(new Set(list.map((t) => t.contact_id).filter(Boolean))) as string[];
    const { data: contacts = [] } = ids.length
      ? await supabaseAdmin.from("contacts").select("id, name, phone").in("id", ids)
      : { data: [] as { id: string; name: string | null; phone: string | null }[] };
    const cmap = new Map((contacts ?? []).map((c) => [c.id, c]));
    return list.map((t) => ({
      ...t,
      contact_name: cmap.get(t.contact_id!)?.name ?? null,
      contact_phone: cmap.get(t.contact_id!)?.phone ?? null,
    }));
  });
