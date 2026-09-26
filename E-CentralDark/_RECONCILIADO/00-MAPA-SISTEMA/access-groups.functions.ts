// Server functions de Grupos de Acesso (RBAC por workspace).
// Segurança: requireSupabaseAuth + RLS. Workspace ativo resolvido no servidor.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logAction } from "@/lib/audit.server";
import { ALL_PERMISSION_KEYS } from "@/lib/access-permissions";

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

export type AccessGroupRow = {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  permission_count: number;
};

export const listAccessGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);

    const { data: groups, error } = await supabase
      .from("access_groups")
      .select("id, name, description, is_system, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const ids = (groups ?? []).map((g: any) => g.id);
    let counts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: perms } = await supabase
        .from("access_group_permissions")
        .select("group_id")
        .in("group_id", ids);
      for (const p of perms ?? []) {
        counts[p.group_id] = (counts[p.group_id] ?? 0) + 1;
      }
    }
    return (groups ?? []).map((g: any) => ({
      ...g,
      permission_count: counts[g.id] ?? 0,
    })) as AccessGroupRow[];
  });

export const createAccessGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(500).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    const { data: row, error } = await supabase
      .from("access_groups")
      .insert({
        workspace_id: workspaceId,
        name: data.name,
        description: data.description ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAction({ category: "user", action: "access_group_created", actorUserId: userId, workspaceId, entity: "access_groups", entityId: row.id, payload: { name: data.name } });
    return { id: row.id as string };
  });

export const updateAccessGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(500).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("access_groups")
      .update({
        name: data.name,
        description: data.description ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({ category: "user", action: "access_group_updated", actorUserId: userId, entity: "access_groups", entityId: data.id });
    return { ok: true };
  });

export const deleteAccessGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("access_groups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({ category: "user", action: "access_group_deleted", actorUserId: userId, entity: "access_groups", entityId: data.id });
    return { ok: true };
  });

export const getAccessGroupPermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("access_group_permissions")
      .select("permission_key")
      .eq("group_id", data.id);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => r.permission_key as string);
  });

export const setAccessGroupPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      keys: z.array(z.string().min(1).max(80)).max(500),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Filtra apenas chaves do catálogo
    const allowed = new Set(ALL_PERMISSION_KEYS);
    const keys = Array.from(new Set(data.keys.filter((k) => allowed.has(k))));

    // Reseta e regrava
    const { error: delErr } = await supabase
      .from("access_group_permissions")
      .delete()
      .eq("group_id", data.id);
    if (delErr) throw new Error(delErr.message);

    if (keys.length > 0) {
      const rows = keys.map((permission_key) => ({ group_id: data.id, permission_key }));
      const { error: insErr } = await supabase.from("access_group_permissions").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    await logAction({
      category: "user",
      action: "access_group_permissions_set",
      actorUserId: userId,
      entity: "access_groups",
      entityId: data.id,
      payload: { count: keys.length },
    });
    return { ok: true, count: keys.length };
  });

// ============== Vínculo Grupo ↔ Conexões WhatsApp ==============

export const listWorkspaceConnectionsForGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    const { data, error } = await supabase
      .from("whatsapp_connections")
      .select("id,name,phone,display_phone_number,provider,status")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAccessGroupConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("access_group_connections")
      .select("connection_id")
      .eq("group_id", data.id);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => r.connection_id as string);
  });


export const setAccessGroupConnections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      connectionIds: z.array(z.string().uuid()).max(200),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // pega workspace do grupo
    const { data: grp, error: gerr } = await supabase
      .from("access_groups")
      .select("workspace_id")
      .eq("id", data.id)
      .single();
    if (gerr || !grp) throw new Error("Grupo não encontrado");
    const workspaceId = grp.workspace_id as string;

    // valida que as conexões pertencem ao mesmo workspace
    const ids = Array.from(new Set(data.connectionIds));
    if (ids.length > 0) {
      const { data: conns, error: cerr } = await supabase
        .from("whatsapp_connections")
        .select("id, workspace_id")
        .in("id", ids);
      if (cerr) throw new Error(cerr.message);
      const invalid = (conns ?? []).find((c: any) => c.workspace_id !== workspaceId);
      if (invalid) throw new Error("Conexão fora do workspace");
      if ((conns?.length ?? 0) !== ids.length) throw new Error("Conexão inválida");
    }

    // Reseta e regrava
    const { error: delErr } = await supabase
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
      const { error: insErr } = await supabase
        .from("access_group_connections")
        .insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    await logAction({
      category: "user",
      action: "access_group_connections_set",
      actorUserId: userId,
      workspaceId,
      entity: "access_groups",
      entityId: data.id,
      payload: { count: ids.length },
    });
    return { ok: true, count: ids.length };
  });

