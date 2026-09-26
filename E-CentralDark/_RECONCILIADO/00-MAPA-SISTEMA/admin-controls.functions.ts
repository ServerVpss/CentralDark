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

export const getWorkspaceControls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("workspace_controls")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) {
      const { data: created, error: e2 } = await supabaseAdmin
        .from("workspace_controls")
        .insert({ workspace_id: data.workspaceId })
        .select("*")
        .single();
      if (e2) throw new Error(e2.message);
      return created;
    }
    return row;
  });

const PatchSchema = z.object({
  workspaceId: z.string().uuid(),
  patch: z.object({
    is_paused: z.boolean().optional(),
    paused_reason: z.string().max(500).nullable().optional(),
    block_whatsapp_send: z.boolean().optional(),
    block_ai: z.boolean().optional(),
    block_campaigns: z.boolean().optional(),
    block_new_signups: z.boolean().optional(),
    banner_enabled: z.boolean().optional(),
    banner_text: z.string().max(500).nullable().optional(),
    banner_level: z.enum(["info", "warning", "danger"]).optional(),
    subscription_status: z.enum(["active", "past_due", "expired", "suspended", "trialing"]).optional(),
  }),
});

export const setWorkspaceControl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => PatchSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: before } = await supabaseAdmin
      .from("workspace_controls").select("*").eq("workspace_id", data.workspaceId).maybeSingle();
    if (!before) {
      const { error } = await supabaseAdmin
        .from("workspace_controls")
        .insert({ workspace_id: data.workspaceId, ...data.patch });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("workspace_controls")
        .update(data.patch)
        .eq("workspace_id", data.workspaceId);
      if (error) throw new Error(error.message);
    }
    await logAction({
      category: "admin", action: "workspace_control_updated",
      actorUserId: context.userId, workspaceId: data.workspaceId,
      entity: "workspace_controls", entityId: data.workspaceId,
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? { workspace_id: data.workspaceId }), ...data.patch },
    });
    return { ok: true };
  });

export const adminForceLogout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.signOut(data.userId, "global");
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin", action: "force_logout_user",
      actorUserId: context.userId, entity: "auth.users", entityId: data.userId,
      payload: { target_user_id: data.userId },
    });
    return { ok: true };
  });

export const adminForceLogoutWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: members, error } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", data.workspaceId);
    if (error) throw new Error(error.message);
    let count = 0;
    for (const m of members ?? []) {
      const { error: e2 } = await supabaseAdmin.auth.admin.signOut(m.user_id, "global");
      if (!e2) count++;
    }
    await logAction({
      category: "admin", action: "force_logout_workspace",
      actorUserId: context.userId, workspaceId: data.workspaceId,
      entity: "workspace_members", entityId: data.workspaceId,
      payload: { count },
    });
    return { ok: true, count };
  });

export const adminWorkspaceMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: members, error } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id, role, created_at")
      .eq("workspace_id", data.workspaceId);
    if (error) throw new Error(error.message);
    const ids = (members ?? []).map((m) => m.user_id);
    if (!ids.length) return [];
    const { data: profs } = await supabaseAdmin
      .from("profiles").select("id,email,full_name").in("id", ids);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    return (members ?? []).map((m) => ({
      user_id: m.user_id,
      role: m.role,
      created_at: m.created_at,
      email: map.get(m.user_id)?.email ?? "—",
      full_name: map.get(m.user_id)?.full_name ?? null,
    }));
  });

export const getWorkspaceControlHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("audit_log")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .like("action", "admin:%")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminListWorkspacesWithControls = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: ws, error } = await supabaseAdmin
      .from("workspaces")
      .select("id,name,slug,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (ws ?? []).map((w) => w.id);
    if (!ids.length) return [];
    const { data: ctrls } = await supabaseAdmin
      .from("workspace_controls")
      .select("*")
      .in("workspace_id", ids);
    const map = new Map((ctrls ?? []).map((c) => [c.workspace_id, c]));
    return (ws ?? []).map((w) => ({ ...w, controls: map.get(w.id) ?? null }));
  });
