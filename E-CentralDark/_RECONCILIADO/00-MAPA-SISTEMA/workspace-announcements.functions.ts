import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ANNOUNCEMENT_TYPES } from "@/lib/announcements.functions";

// Resolve a workspace ativa do usuário (primeira da qual ele é membro)
async function getActiveWorkspaceId(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.workspace_id) throw new Error("Você ainda não tem uma empresa ativa.");
  return data.workspace_id as string;
}

async function assertIsAdmin(supabase: any, workspaceId: string, userId: string) {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.role !== "admin") {
    throw new Error("Só o dono ou administrador da empresa pode gerenciar avisos internos.");
  }
}

const baseInput = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(5000).optional().nullable(),
  type: z.enum(ANNOUNCEMENT_TYPES),
  icon: z.string().trim().max(8).optional().nullable(),
  active: z.boolean().default(true),
  pinned: z.boolean().default(false),
  link_url: z.string().trim().url().max(500).optional().nullable(),
});

/* ──────────── LISTAR avisos internos da empresa ──────────── */
export const listWorkspaceAnnouncements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      type: z.enum(ANNOUNCEMENT_TYPES).optional().nullable(),
      search: z.string().trim().max(120).optional().nullable(),
      includeInactive: z.boolean().default(false),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);

    let q = supabase
      .from("workspace_announcements")
      .select("id, title, body, type, icon, active, pinned, link_url, created_at, updated_at")
      .eq("workspace_id", workspaceId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    if (!data.includeInactive) q = q.eq("active", true);
    if (data.type) q = q.eq("type", data.type);
    if (data.search) q = q.ilike("title", `%${data.search}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [] };
  });

/* ──────────── CRIAR ──────────── */
export const createWorkspaceAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => baseInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertIsAdmin(supabase, workspaceId, userId);

    const { data: row, error } = await supabase
      .from("workspace_announcements")
      .insert({ ...data, workspace_id: workspaceId, created_by: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      workspace_id: workspaceId,
      actor_user_id: userId,
      action: "workspace:announcement_create",
      payload: { id: row.id, title: row.title, type: row.type },
    });
    return { item: row };
  });

/* ──────────── EDITAR ──────────── */
export const updateWorkspaceAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    baseInput.partial().extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertIsAdmin(supabase, workspaceId, userId);

    const { id, ...rest } = data;
    const { data: row, error } = await supabase
      .from("workspace_announcements")
      .update(rest)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      workspace_id: workspaceId,
      actor_user_id: userId,
      action: "workspace:announcement_update",
      payload: { id, changes: rest },
    });
    return { item: row };
  });

/* ──────────── APAGAR ──────────── */
export const deleteWorkspaceAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertIsAdmin(supabase, workspaceId, userId);

    const { error } = await supabase
      .from("workspace_announcements")
      .delete()
      .eq("id", data.id)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      workspace_id: workspaceId,
      actor_user_id: userId,
      action: "workspace:announcement_delete",
      payload: { id: data.id },
    });
    return { ok: true };
  });
