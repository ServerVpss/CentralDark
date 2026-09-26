// Server functions master para Grupos de Acesso.
// Permitem ao super_admin gerenciar grupos de QUALQUER workspace.
// Toda ação é registrada em audit_log com category='admin'.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";
import { ALL_PERMISSION_KEYS } from "@/lib/access-permissions";

export type AdminAccessGroupRow = {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  workspace_id: string;
  workspace_name: string | null;
  permission_count: number;
  connection_count: number;
  user_count: number;
};

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado — apenas super admin");
}

// =================== LISTAS ===================

export const adminListAccessGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);

    const { data: groups, error } = await supabaseAdmin
      .from("access_groups")
      .select("id, name, description, is_system, created_at, workspace_id, workspaces(name)")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);

    const ids = (groups ?? []).map((g: any) => g.id);
    const counts: Record<string, number> = {};
    const connCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    if (ids.length > 0) {
      const [{ data: perms }, { data: conns }, { data: users }] = await Promise.all([
        supabaseAdmin.from("access_group_permissions").select("group_id").in("group_id", ids),
        supabaseAdmin.from("access_group_connections").select("group_id").in("group_id", ids),
        supabaseAdmin.from("workspace_members").select("access_group_id").in("access_group_id", ids),
      ]);
      for (const p of perms ?? []) counts[p.group_id] = (counts[p.group_id] ?? 0) + 1;
      for (const c of conns ?? []) connCounts[c.group_id] = (connCounts[c.group_id] ?? 0) + 1;
      for (const u of users ?? []) {
        if (u.access_group_id) userCounts[u.access_group_id] = (userCounts[u.access_group_id] ?? 0) + 1;
      }
    }

    return (groups ?? []).map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      is_system: g.is_system,
      created_at: g.created_at,
      workspace_id: g.workspace_id,
      workspace_name: g.workspaces?.name ?? null,
      permission_count: counts[g.id] ?? 0,
      connection_count: connCounts[g.id] ?? 0,
      user_count: userCounts[g.id] ?? 0,
    })) as AdminAccessGroupRow[];
  });

export const adminListWorkspacesForGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .select("id, name, slug")
      .order("name", { ascending: true })
      .limit(2000);
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ id: string; name: string; slug: string }>;
  });

export const adminListWorkspaceConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspaceId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,name,phone,display_phone_number,provider,status")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// =================== CRUD ===================

export const adminCreateAccessGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid(),
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(500).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("access_groups")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        description: data.description ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin",
      action: "access_group_created",
      actorUserId: context.userId,
      workspaceId: data.workspaceId,
      entity: "access_groups",
      entityId: row.id,
      after: { name: data.name, description: data.description ?? null },
    });
    return { id: row.id as string };
  });

export const adminUpdateAccessGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(500).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: before } = await supabaseAdmin
      .from("access_groups")
      .select("workspace_id, name, description")
      .eq("id", data.id)
      .single();
    if (!before) throw new Error("Grupo não encontrado");

    const { error } = await supabaseAdmin
      .from("access_groups")
      .update({
        name: data.name,
        description: data.description ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAction({
      category: "admin",
      action: "access_group_updated",
      actorUserId: context.userId,
      workspaceId: before.workspace_id,
      entity: "access_groups",
      entityId: data.id,
      before: { name: before.name, description: before.description },
      after: { name: data.name, description: data.description ?? null },
    });
    return { ok: true };
  });

export const adminDeleteAccessGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: before } = await supabaseAdmin
      .from("access_groups")
      .select("workspace_id, name, is_system")
      .eq("id", data.id)
      .single();
    if (!before) throw new Error("Grupo não encontrado");
    if (before.is_system) throw new Error("Grupo de sistema não pode ser excluído");

    const { error } = await supabaseAdmin.from("access_groups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAction({
      category: "admin",
      action: "access_group_deleted",
      actorUserId: context.userId,
      workspaceId: before.workspace_id,
      entity: "access_groups",
      entityId: data.id,
      before: { name: before.name },
    });
    return { ok: true };
  });

// =================== PERMISSÕES ===================

export const adminGetAccessGroupPermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("access_group_permissions")
      .select("permission_key")
      .eq("group_id", data.id);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => r.permission_key as string);
  });

export const adminSetAccessGroupPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      keys: z.array(z.string().min(1).max(80)).max(500),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: grp } = await supabaseAdmin
      .from("access_groups")
      .select("workspace_id")
      .eq("id", data.id)
      .single();
    if (!grp) throw new Error("Grupo não encontrado");

    const allowed = new Set(ALL_PERMISSION_KEYS);
    const keys = Array.from(new Set(data.keys.filter((k) => allowed.has(k))));

    const { error: delErr } = await supabaseAdmin
      .from("access_group_permissions")
      .delete()
      .eq("group_id", data.id);
    if (delErr) throw new Error(delErr.message);

    if (keys.length > 0) {
      const rows = keys.map((permission_key) => ({ group_id: data.id, permission_key }));
      const { error: insErr } = await supabaseAdmin.from("access_group_permissions").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    await logAction({
      category: "admin",
      action: "access_group_permissions_set",
      actorUserId: context.userId,
      workspaceId: grp.workspace_id,
      entity: "access_groups",
      entityId: data.id,
      payload: { count: keys.length },
    });
    return { ok: true, count: keys.length };
  });

// =================== CONEXÕES WHATSAPP ===================

export const adminGetAccessGroupConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("access_group_connections")
      .select("connection_id")
      .eq("group_id", data.id);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => r.connection_id as string);
  });

export const adminSetAccessGroupConnections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      connectionIds: z.array(z.string().uuid()).max(200),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: grp } = await supabaseAdmin
      .from("access_groups")
      .select("workspace_id")
      .eq("id", data.id)
      .single();
    if (!grp) throw new Error("Grupo não encontrado");
    const workspaceId = grp.workspace_id as string;

    const ids = Array.from(new Set(data.connectionIds));
    if (ids.length > 0) {
      const { data: conns, error: cerr } = await supabaseAdmin
        .from("whatsapp_connections")
        .select("id, workspace_id")
        .in("id", ids);
      if (cerr) throw new Error(cerr.message);
      const invalid = (conns ?? []).find((c: any) => c.workspace_id !== workspaceId);
      if (invalid) throw new Error("Conexão fora do workspace do grupo");
      if ((conns?.length ?? 0) !== ids.length) throw new Error("Conexão inválida");
    }

    const { error: delErr } = await supabaseAdmin
      .from("access_group_connections")
      .delete()
      .eq("group_id", data.id);
    if (delErr) throw new Error(delErr.message);

    if (ids.length > 0) {
      const rows = ids.map((connection_id) => ({
        group_id: data.id,
        connection_id,
        workspace_id: workspaceId,
      }));
      const { error: insErr } = await supabaseAdmin
        .from("access_group_connections")
        .insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    await logAction({
      category: "admin",
      action: "access_group_connections_set",
      actorUserId: context.userId,
      workspaceId,
      entity: "access_groups",
      entityId: data.id,
      payload: { count: ids.length },
    });
    return { ok: true, count: ids.length };
  });

// =================== USUÁRIOS DO GRUPO ===================

export const adminListAccessGroupUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: members, error } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id, role, is_active, created_at")
      .eq("access_group_id", data.id);
    if (error) throw new Error(error.message);

    const userIds = (members ?? []).map((m: any) => m.user_id);
    if (userIds.length === 0) return [];

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (members ?? []).map((m: any) => {
      const p = byId.get(m.user_id);
      return {
        user_id: m.user_id,
        full_name: p?.full_name ?? null,
        email: p?.email ?? null,
        role: m.role,
        is_active: m.is_active,
        created_at: m.created_at,
      };
    });
  });
