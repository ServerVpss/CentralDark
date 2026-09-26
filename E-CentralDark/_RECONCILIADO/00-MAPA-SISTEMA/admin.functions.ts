import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

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

export const checkSuperAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "super_admin")
      .maybeSingle();
    return { isSuperAdmin: !!data };
  });

// [SEGURANÇA — bootstrap de Super Admin]
// Esta função NÃO pode ser usada por qualquer usuário autenticado.
// Regras (todas precisam ser verdadeiras pra criar o primeiro super_admin):
//   1. NÃO pode existir nenhum super_admin no sistema.
//   2. O e-mail do usuário autenticado precisa estar na allowlist da env
//      BOOTSTRAP_SUPER_ADMIN_EMAILS (lista separada por vírgula).
//   3. A env precisa estar configurada — se não estiver, ninguém promove.
// Qualquer tentativa fora dessas regras é registrada em audit_log como
// `security:super_admin_claim_denied` e retorna erro 403.
export const claimSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Pega e-mail do usuário pra validar contra allowlist.
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", context.userId)
      .maybeSingle();
    const email = (profile?.email ?? "").toLowerCase().trim();

    // Allowlist via env (obrigatória). Sem env configurada, bootstrap fica
    // permanentemente desligado — não tem como "qualquer usuário se promover".
    const rawAllow = (process.env.BOOTSTRAP_SUPER_ADMIN_EMAILS ?? "").trim();
    const allowlist = rawAllow
      .split(",")
      .map((e) => e.toLowerCase().trim())
      .filter(Boolean);

    // Regra 1: já existe super admin?
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");
    const superAdminExists = (count ?? 0) > 0;

    // Regra 2+3: e-mail está na allowlist?
    const inAllowlist = allowlist.length > 0 && allowlist.includes(email);

    if (superAdminExists || !inAllowlist) {
      // Tentativa não autorizada: registra como evento de segurança.
      await logAction({
        category: "security",
        action: "super_admin_claim_denied",
        actorUserId: context.userId,
        entity: "user_roles",
        entityId: context.userId,
        after: {
          email,
          reason: superAdminExists
            ? "super_admin_already_exists"
            : allowlist.length === 0
              ? "bootstrap_allowlist_not_configured"
              : "email_not_in_allowlist",
        },
      });
      // Mensagem genérica — não revela qual regra falhou pra atacante.
      throw new Error("Acesso negado.");
    }

    // Tudo ok: cria o super_admin e registra a promoção.
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "super_admin" });
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin",
      action: "super_admin_claimed",
      actorUserId: context.userId,
      entity: "user_roles",
      entityId: context.userId,
      after: { user_id: context.userId, role: "super_admin", email },
    });
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [ws, users, tickets, msgs, contacts] = await Promise.all([
      supabaseAdmin.from("workspaces").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("ticket_messages").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("contacts").select("*", { count: "exact", head: true }),
    ]);
    const { data: openTickets } = await supabaseAdmin
      .from("tickets").select("*", { count: "exact", head: true }).eq("status", "open");
    return {
      workspaces: ws.count ?? 0,
      users: users.count ?? 0,
      tickets: tickets.count ?? 0,
      open_tickets: openTickets ? 0 : 0,
      messages: msgs.count ?? 0,
      contacts: contacts.count ?? 0,
    };
  });

export const listAllWorkspaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: workspaces, error } = await supabaseAdmin
      .from("workspaces")
      .select("id,name,slug,owner_id,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (workspaces ?? []).map((w) => w.id);
    const counts: Record<string, { tickets: number; members: number; contacts: number }> = {};
    for (const id of ids) counts[id] = { tickets: 0, members: 0, contacts: 0 };
    if (ids.length) {
      const [t, m, c] = await Promise.all([
        supabaseAdmin.from("tickets").select("workspace_id").in("workspace_id", ids),
        supabaseAdmin.from("workspace_members").select("workspace_id").in("workspace_id", ids),
        supabaseAdmin.from("contacts").select("workspace_id").in("workspace_id", ids),
      ]);
      (t.data ?? []).forEach((r) => counts[r.workspace_id].tickets++);
      (m.data ?? []).forEach((r) => counts[r.workspace_id].members++);
      (c.data ?? []).forEach((r) => counts[r.workspace_id].contacts++);
    }
    return (workspaces ?? []).map((w) => ({ ...w, ...counts[w.id] }));
  });

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id,email,full_name,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const ids = (data ?? []).map((u) => u.id);
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("user_id,role").in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const rolesByUser: Record<string, string[]> = {};
    (roles ?? []).forEach((r) => {
      rolesByUser[r.user_id] = [...(rolesByUser[r.user_id] ?? []), r.role];
    });
    return (data ?? []).map((u) => ({ ...u, roles: rolesByUser[u.id] ?? [] }));
  });

export const setUserSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), enable: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    if (data.enable) {
      const { error } = await supabaseAdmin
        .from("user_roles").insert({ user_id: data.userId, role: "super_admin" });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      if (data.userId === context.userId) throw new Error("Você não pode remover seu próprio acesso master.");
      const { error } = await supabaseAdmin
        .from("user_roles").delete().eq("user_id", data.userId).eq("role", "super_admin");
      if (error) throw new Error(error.message);
    }
    await logAction({
      category: "admin", action: data.enable ? "super_admin_granted" : "super_admin_revoked",
      actorUserId: context.userId, entity: "user_roles", entityId: data.userId,
      after: { user_id: data.userId, role: "super_admin", granted: data.enable },
    });
    return { ok: true };
  });

export const adminAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid().optional().nullable(),
    actorUserId: z.string().uuid().optional().nullable(),
    category: z.string().max(50).optional().nullable(),
    actionLike: z.string().max(100).optional().nullable(),
    entity: z.string().max(80).optional().nullable(),
    entityId: z.string().max(120).optional().nullable(),
    from: z.string().optional().nullable(),
    to: z.string().optional().nullable(),
    page: z.number().int().min(1).max(10000).optional(),
    pageSize: z.number().int().min(10).max(200).optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? 50;
    const fromIdx = (page - 1) * pageSize;
    const toIdx = fromIdx + pageSize - 1;

    // Lista colunas leves — evita transferir payloads gigantes na grade
    let q = supabaseAdmin.from("audit_log")
      .select("id,created_at,category,action,workspace_id,actor_user_id,entity,entity_id,payload,before,after,diff", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(fromIdx, toIdx);
    if (data.workspaceId) q = q.eq("workspace_id", data.workspaceId);
    if (data.actorUserId) q = q.eq("actor_user_id", data.actorUserId);
    if (data.category) q = q.eq("category", data.category);
    if (data.actionLike) q = q.ilike("action", `%${data.actionLike}%`);
    if (data.entity) q = q.eq("entity", data.entity);
    if (data.entityId) q = q.eq("entity_id", data.entityId);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);

    const wsIds = Array.from(new Set((rows ?? []).map((r) => r.workspace_id).filter(Boolean) as string[]));
    const actorIds = Array.from(new Set((rows ?? []).map((r) => r.actor_user_id).filter(Boolean) as string[]));
    const [wsRes, profRes] = await Promise.all([
      wsIds.length ? supabaseAdmin.from("workspaces").select("id,name").in("id", wsIds) : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
      actorIds.length ? supabaseAdmin.from("profiles").select("id,full_name,email").in("id", actorIds) : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; email: string | null }> }),
    ]);
    const wsMap: Record<string, string> = {};
    (wsRes.data ?? []).forEach((w) => { wsMap[w.id] = w.name; });
    const actorMap: Record<string, string> = {};
    (profRes.data ?? []).forEach((p) => { actorMap[p.id] = p.full_name || p.email || p.id.slice(0, 8); });
    const enriched = (rows ?? []).map((r) => ({
      ...r,
      workspace_name: r.workspace_id ? (wsMap[r.workspace_id] ?? "—") : "—",
      actor_name: r.actor_user_id ? (actorMap[r.actor_user_id] ?? r.actor_user_id.slice(0, 8)) : "sistema",
    }));
    const total = count ?? enriched.length;
    return {
      rows: enriched,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  });

export const adminAuditFilters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [wsRes, actorsRes, catRes, entRes] = await Promise.all([
      supabaseAdmin.from("workspaces").select("id,name").order("name").limit(500),
      supabaseAdmin.from("audit_log").select("actor_user_id").not("actor_user_id", "is", null).limit(2000),
      supabaseAdmin.from("audit_log").select("category").not("category", "is", null).limit(2000),
      supabaseAdmin.from("audit_log").select("entity").not("entity", "is", null).limit(2000),
    ]);
    const actorIds = Array.from(new Set((actorsRes.data ?? []).map((r) => r.actor_user_id as string)));
    const { data: profs } = actorIds.length
      ? await supabaseAdmin.from("profiles").select("id,full_name,email").in("id", actorIds)
      : { data: [] as Array<{ id: string; full_name: string | null; email: string | null }> };
    const categories = Array.from(new Set((catRes.data ?? []).map((r) => r.category as string))).sort();
    const entities = Array.from(new Set((entRes.data ?? []).map((r) => r.entity as string))).sort();
    return {
      workspaces: wsRes.data ?? [],
      actors: (profs ?? []).map((p) => ({ id: p.id, name: p.full_name || p.email || p.id.slice(0, 8) })),
      categories,
      entities,
    };
  });

export const adminAllTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("tickets")
      .select("id,workspace_id,status,priority,subject,last_message_preview,last_message_at,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ============================================================
// MASTER ADMIN — espelho do /app no /admin
// ============================================================

async function joinWorkspaceNames(rows: Array<{ workspace_id: string | null }>) {
  const ids = Array.from(new Set(rows.map((r) => r.workspace_id).filter(Boolean) as string[]));
  if (!ids.length) return {} as Record<string, string>;
  const { data } = await supabaseAdmin.from("workspaces").select("id,name").in("id", ids);
  const map: Record<string, string> = {};
  (data ?? []).forEach((w) => { map[w.id] = w.name; });
  return map;
}

export const adminListChatbots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("ai_agent_configs")
      .select("id,workspace_id,name,model,temperature,active,system_prompt,created_at,updated_at")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    const ws = await joinWorkspaceNames(data ?? []);
    return (data ?? []).map((r) => ({ ...r, workspace_name: ws[r.workspace_id] ?? "—" }));
  });

export const adminToggleChatbot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: before } = await supabaseAdmin
      .from("ai_agent_configs").select("workspace_id,name,active").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin.from("ai_agent_configs").update({ active: data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin", action: data.active ? "chatbot_resumed" : "chatbot_paused",
      actorUserId: context.userId, workspaceId: before?.workspace_id ?? null,
      entity: "ai_agent_configs", entityId: data.id,
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), active: data.active },
    });
    return { ok: true };
  });

export const adminListContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select(
        "id,workspace_id,name,last_name,nickname,phone,email,label,status,blocked,tags,assignee_id,avatar_url,last_message_at,created_at",
      )
      .order("created_at", { ascending: false }).limit(1000);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const ws = await joinWorkspaceNames(rows);

    // Junta nome dos atendentes
    const assigneeIds = Array.from(
      new Set(rows.map((r) => r.assignee_id).filter(Boolean) as string[]),
    );
    let assigneeMap = new Map<string, string>();
    if (assigneeIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles").select("id, full_name, email").in("id", assigneeIds);
      assigneeMap = new Map(
        (profs ?? []).map((p) => [p.id, p.full_name || p.email || "—"]),
      );
    }

    return rows.map((r) => ({
      ...r,
      workspace_name: ws[r.workspace_id] ?? "—",
      assignee_name: r.assignee_id ? assigneeMap.get(r.assignee_id) ?? null : null,
    }));
  });

export const adminToggleContactBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), blocked: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: before } = await supabaseAdmin
      .from("contacts").select("workspace_id,name,phone,blocked").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin.from("contacts").update({ blocked: data.blocked }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin", action: data.blocked ? "contact_blocked" : "contact_unblocked",
      actorUserId: context.userId, workspaceId: before?.workspace_id ?? null,
      entity: "contacts", entityId: data.id,
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), blocked: data.blocked },
    });
    return { ok: true };
  });

export const adminListSectors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("sectors")
      .select("id,workspace_id,name,color,created_at")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    const ws = await joinWorkspaceNames(data ?? []);
    return (data ?? []).map((r) => ({ ...r, workspace_name: ws[r.workspace_id] ?? "—" }));
  });

export const adminListWhatsApp = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,name,phone,phone_number_id,waba_id,status,quality_rating,messaging_tier,error_count,last_error,last_webhook_at,created_at")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    const ws = await joinWorkspaceNames(data ?? []);
    return (data ?? []).map((r) => ({ ...r, workspace_name: ws[r.workspace_id] ?? "—" }));
  });

export const adminGlobalReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const since24 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [msgs24, msgs7, waLogs24, openTickets, conns, agents] = await Promise.all([
      supabaseAdmin.from("ticket_messages").select("*", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("ticket_messages").select("*", { count: "exact", head: true }).gte("created_at", since7),
      supabaseAdmin.from("whatsapp_message_log").select("*", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabaseAdmin.from("whatsapp_connections").select("status"),
      supabaseAdmin.from("ai_agent_configs").select("active"),
    ]);
    const onlineWa = (conns.data ?? []).filter((c) => c.status === "connected").length;
    const activeAgents = (agents.data ?? []).filter((a) => a.active).length;
    return {
      messages_24h: msgs24.count ?? 0,
      messages_7d: msgs7.count ?? 0,
      whatsapp_sent_24h: waLogs24.count ?? 0,
      open_tickets: openTickets.count ?? 0,
      whatsapp_online: onlineWa,
      whatsapp_total: conns.data?.length ?? 0,
      ai_agents_active: activeAgents,
      ai_agents_total: agents.data?.length ?? 0,
    };
  });

export const adminPerWorkspaceMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: ws } = await supabaseAdmin.from("workspaces").select("id,name");
    const out: Array<{ id: string; name: string; tickets: number; messages: number; contacts: number; whatsapp: number; agents: number }> = [];
    for (const w of ws ?? []) {
      const [t, m, c, wa, a] = await Promise.all([
        supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).eq("workspace_id", w.id),
        supabaseAdmin.from("ticket_messages").select("*", { count: "exact", head: true }).eq("workspace_id", w.id),
        supabaseAdmin.from("contacts").select("*", { count: "exact", head: true }).eq("workspace_id", w.id),
        supabaseAdmin.from("whatsapp_connections").select("*", { count: "exact", head: true }).eq("workspace_id", w.id),
        supabaseAdmin.from("ai_agent_configs").select("*", { count: "exact", head: true }).eq("workspace_id", w.id),
      ]);
      out.push({
        id: w.id, name: w.name,
        tickets: t.count ?? 0, messages: m.count ?? 0, contacts: c.count ?? 0,
        whatsapp: wa.count ?? 0, agents: a.count ?? 0,
      });
    }
    return out;
  });

// === DIAGNÓSTICO WHATSAPP — rastreamento mensagem-a-mensagem ===
export const adminWhatsAppDiagnostico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid().optional().nullable(),
    connectionId: z.string().uuid().optional().nullable(),
    phone: z.string().max(40).optional().nullable(),
    direction: z.enum(["all", "inbound", "outbound"]).optional(),
    limit: z.number().int().min(10).max(500).optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const limit = data.limit ?? 100;

    // Conexões disponíveis (pra filtro/labels)
    const { data: conns } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,name,workspace_id,phone_number_id,display_phone_number,status,last_webhook_at");

    const connMap: Record<string, { name: string; phone_number_id: string | null; display: string | null; workspace_id: string }> = {};
    (conns ?? []).forEach((c) => { connMap[c.id] = { name: c.name, phone_number_id: c.phone_number_id, display: c.display_phone_number, workspace_id: c.workspace_id }; });

    // Mensagens (entrada+saída)
    let q = supabaseAdmin
      .from("whatsapp_message_log")
      .select("id,created_at,direction,connection_id,workspace_id,contact_phone,ticket_id,message_id,body,message_type,status,error_code,error_message,template_name,is_template")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data.workspaceId) q = q.eq("workspace_id", data.workspaceId);
    if (data.connectionId) q = q.eq("connection_id", data.connectionId);
    if (data.phone) q = q.ilike("contact_phone", `%${data.phone}%`);
    if (data.direction && data.direction !== "all") q = q.eq("direction", data.direction);
    const { data: msgs, error } = await q;
    if (error) throw new Error(error.message);

    // Eventos webhook recentes (verifica chegada bruta da Meta)
    let we = supabaseAdmin
      .from("whatsapp_webhook_events")
      .select("id,created_at,connection_id,workspace_id,phone_number_id,event_type,signature_valid,status_code,error,raw_payload")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.workspaceId) we = we.eq("workspace_id", data.workspaceId);
    if (data.connectionId) we = we.eq("connection_id", data.connectionId);
    const { data: events } = await we;

    // Workspaces (pra labels)
    const wsIds = Array.from(new Set([...(msgs ?? []).map((m) => m.workspace_id), ...(events ?? []).map((e) => e.workspace_id)].filter(Boolean) as string[]));
    const { data: wsRows } = wsIds.length
      ? await supabaseAdmin.from("workspaces").select("id,name").in("id", wsIds)
      : { data: [] as Array<{ id: string; name: string }> };
    const wsMap: Record<string, string> = {};
    (wsRows ?? []).forEach((w) => { wsMap[w.id] = w.name; });

    // Resumo
    const summary = {
      total_messages: msgs?.length ?? 0,
      inbound: (msgs ?? []).filter((m) => m.direction === "inbound").length,
      outbound: (msgs ?? []).filter((m) => m.direction === "outbound").length,
      failed: (msgs ?? []).filter((m) => m.status === "failed" || m.error_code).length,
      connections: conns?.length ?? 0,
      events_total: events?.length ?? 0,
      events_invalid_sig: (events ?? []).filter((e) => !e.signature_valid && e.event_type !== "verify_ok").length,
    };

    return {
      summary,
      connections: (conns ?? []).map((c) => ({ ...c, workspace_name: wsMap[c.workspace_id] ?? "—" })),
      messages: (msgs ?? []).map((m) => ({
        ...m,
        connection_name: m.connection_id ? (connMap[m.connection_id]?.name ?? "—") : "—",
        connection_display: m.connection_id ? (connMap[m.connection_id]?.display ?? null) : null,
        connection_phone_number_id: m.connection_id ? (connMap[m.connection_id]?.phone_number_id ?? null) : null,
        workspace_name: wsMap[m.workspace_id] ?? "—",
        body_preview: (m.body ?? "").slice(0, 140),
      })),
      events: (events ?? []).map((e) => ({
        ...e,
        connection_name: e.connection_id ? (connMap[e.connection_id]?.name ?? "—") : "—",
        workspace_name: wsMap[e.workspace_id] ?? "—",
        // Tira o payload pesado, deixa só metadados úteis
        payload_summary: (() => {
          const p = e.raw_payload as { entry?: Array<{ changes?: Array<{ value?: { messages?: unknown[]; statuses?: unknown[]; metadata?: { phone_number_id?: string }; contacts?: Array<{ wa_id?: string }> } }> }> } | null;
          const v = p?.entry?.[0]?.changes?.[0]?.value;
          return {
            phone_number_id_recv: v?.metadata?.phone_number_id ?? null,
            messages_count: v?.messages?.length ?? 0,
            statuses_count: v?.statuses?.length ?? 0,
            contacts: (v?.contacts ?? []).map((c) => c.wa_id).filter(Boolean),
          };
        })(),
      })),
    };
  });
