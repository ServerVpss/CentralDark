// Server functions para gerenciamento de usuários por workspace.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";
import { enforceRateLimit } from "@/lib/rate-limit.server";

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

async function assertAdmin(supabase: any, userId: string, workspaceId: string) {
  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!data || data.role !== "admin") {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }
}

// Segurança: garante que o usuário-alvo é membro do workspace do admin que está agindo.
// Sem isso, admin do workspace A pode alterar profile / resetar senha de usuários de outros workspaces.
async function assertTargetIsMember(targetUserId: string, workspaceId: string) {
  const { data } = await supabaseAdmin
    .from("workspace_members")
    .select("user_id")
    .eq("user_id", targetUserId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!data) {
    throw new Error("Este usuário não pertence ao seu workspace.");
  }
}

export type WorkspaceUserRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  ddi: string | null;
  document: string | null;
  document_type: string | null;
  birth_date: string | null;
  country: string | null;
  cep: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  is_active: boolean;
  role: string;
  access_group_id: string | null;
  access_group_name: string | null;
  sector_ids: string[];
  channel_ids: string[];
  business_hours_enabled: boolean;
  created_at: string;
};

export const listWorkspaceUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WorkspaceUserRow[]> => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);

    const { data: members, error } = await supabase
      .from("workspace_members")
      .select("user_id, role, is_active, access_group_id, sector_ids, channel_ids, business_hours_enabled, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const userIds = (members ?? []).map((m: any) => m.user_id);
    if (userIds.length === 0) return [];

    const [{ data: profiles }, { data: groups }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").in("id", userIds),
      supabase.from("access_groups").select("id, name").eq("workspace_id", workspaceId),
    ]);

    const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const gMap = new Map((groups ?? []).map((g: any) => [g.id, g.name]));

    return (members ?? []).map((m: any) => {
      const p: any = pMap.get(m.user_id) ?? {};
      return {
        user_id: m.user_id,
        email: p.email ?? "",
        full_name: p.full_name ?? null,
        last_name: p.last_name ?? null,
        avatar_url: p.avatar_url ?? null,
        phone: p.phone ?? null,
        ddi: p.ddi ?? "+55",
        document: p.document ?? null,
        document_type: p.document_type ?? null,
        birth_date: p.birth_date ?? null,
        country: p.country ?? null,
        cep: p.cep ?? null,
        state: p.state ?? null,
        city: p.city ?? null,
        address: p.address ?? null,
        address_complement: p.address_complement ?? null,
        neighborhood: p.neighborhood ?? null,
        is_active: m.is_active,
        role: m.role,
        access_group_id: m.access_group_id,
        access_group_name: m.access_group_id ? (gMap.get(m.access_group_id) ?? null) : null,
        sector_ids: m.sector_ids ?? [],
        channel_ids: m.channel_ids ?? [],
        business_hours_enabled: m.business_hours_enabled,
        created_at: m.created_at,
      };
    });
  });


export const createWorkspaceUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    email: z.string().email(),
    password: z.string().min(8),
    full_name: z.string().min(1).max(120),
    phone: z.string().max(40).optional().nullable(),
    document: z.string().max(40).optional().nullable(),
    access_group_id: z.string().uuid().optional().nullable(),
    is_active: z.boolean().default(true),
    role: z.enum(["admin", "agent"]).default("agent"),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertAdmin(supabase, userId, workspaceId);
    // FAIL-CLOSED: criação de usuário é sensível — se a checagem falhar, bloqueia.
    await enforceRateLimit({ action: "user.create", actorUserId: userId, workspaceId, useIp: true, failClosed: true });



    // cria auth user
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Falha ao criar usuário");
    const newUserId = created.user.id;

    // garante profile
    await supabaseAdmin.from("profiles").upsert({
      id: newUserId,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone ?? null,
      document: data.document ?? null,
    });

    // adiciona como membro
    const { error: mErr } = await supabaseAdmin.from("workspace_members").insert({
      workspace_id: workspaceId,
      user_id: newUserId,
      role: data.role,
      is_active: data.is_active,
      access_group_id: data.access_group_id ?? null,
      origin: "manual",
    });
    if (mErr) throw new Error(mErr.message);

    await logAction({
      category: "user",
      actorUserId: userId,
      workspaceId,
      action: "user.create",
      entity: "workspace_member",
      entityId: newUserId,
      payload: { email: data.email, role: data.role },
    });

    return { ok: true, user_id: newUserId };
  });

export const updateWorkspaceUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    user_id: z.string().uuid(),
    full_name: z.string().min(1).max(120).optional(),
    last_name: z.string().max(120).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    ddi: z.string().max(10).nullable().optional(),
    document: z.string().max(40).nullable().optional(),
    document_type: z.string().max(40).nullable().optional(),
    birth_date: z.string().nullable().optional(),
    country: z.string().max(80).nullable().optional(),
    cep: z.string().max(20).nullable().optional(),
    state: z.string().max(80).nullable().optional(),
    city: z.string().max(120).nullable().optional(),
    address: z.string().max(200).nullable().optional(),
    address_complement: z.string().max(120).nullable().optional(),
    neighborhood: z.string().max(120).nullable().optional(),
    avatar_url: z.string().url().nullable().optional(),
    is_active: z.boolean().optional(),
    access_group_id: z.string().uuid().nullable().optional(),
    sector_ids: z.array(z.string().uuid()).optional(),
    channel_ids: z.array(z.string().uuid()).optional(),
    role: z.enum(["admin", "agent"]).optional(),
    new_password: z.string().min(8).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertAdmin(supabase, userId, workspaceId);
    await assertTargetIsMember(data.user_id, workspaceId);
    // Update comum: fail-open. Se inclui mudança de role, usa bucket fail-closed dedicado.
    const isRoleChange = data.role !== undefined;
    await enforceRateLimit({ action: "user.update", actorUserId: userId, workspaceId });
    if (isRoleChange) {
      await enforceRateLimit({ action: "user.update.role", actorUserId: userId, workspaceId, useIp: true, failClosed: true });
    }


    // Bloqueia auto-alteração de role (admin não pode mexer no próprio papel).
    // Exceção: super_admin do sistema pode alterar qualquer papel, inclusive o próprio.
    if (data.role !== undefined && data.user_id === userId) {
      const { data: sa } = await supabaseAdmin
        .from("user_roles").select("user_id")
        .eq("user_id", userId).eq("role", "super_admin").maybeSingle();
      if (!sa) {
        throw new Error("Você não pode alterar o seu próprio papel.");
      }
    }

    // Bloqueia rebaixar o último admin do workspace (quebraria gestão).
    if (data.role !== undefined && data.role !== "admin") {
      const { data: target } = await supabaseAdmin
        .from("workspace_members").select("role")
        .eq("user_id", data.user_id).eq("workspace_id", workspaceId).maybeSingle();
      if (target?.role === "admin") {
        const { count } = await supabaseAdmin
          .from("workspace_members")
          .select("user_id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId).eq("role", "admin");
        if ((count ?? 0) <= 1) {
          throw new Error("Não é possível rebaixar o último administrador do workspace.");
        }
      }
    }

    const profileKeys = [
      "full_name", "last_name", "phone", "ddi", "document", "document_type",
      "birth_date", "country", "cep", "state", "city", "address",
      "address_complement", "neighborhood", "avatar_url",
    ] as const;
    const profileUpdates: any = {};
    for (const k of profileKeys) {
      if ((data as any)[k] !== undefined) profileUpdates[k] = (data as any)[k];
    }


    if (Object.keys(profileUpdates).length) {
      const { error } = await supabaseAdmin.from("profiles").update(profileUpdates).eq("id", data.user_id);
      if (error) throw new Error(error.message);
    }

    const memberUpdates: any = {};
    if (data.is_active !== undefined) memberUpdates.is_active = data.is_active;
    if (data.access_group_id !== undefined) memberUpdates.access_group_id = data.access_group_id;
    if (data.sector_ids !== undefined) memberUpdates.sector_ids = data.sector_ids;
    if (data.channel_ids !== undefined) memberUpdates.channel_ids = data.channel_ids;
    if (data.role !== undefined) memberUpdates.role = data.role;
    if (Object.keys(memberUpdates).length) {
      const { error } = await supabaseAdmin.from("workspace_members")
        .update(memberUpdates)
        .eq("user_id", data.user_id)
        .eq("workspace_id", workspaceId);
      if (error) throw new Error(error.message);
    }


    if (data.new_password) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password: data.new_password });
      if (error) throw new Error(error.message);
    }

    await logAction({
      category: "user",
      actorUserId: userId,
      workspaceId,
      action: "user.update",
      entity: "workspace_member",
      entityId: data.user_id,
      payload: { fields: Object.keys({ ...profileUpdates, ...memberUpdates }), password_changed: !!data.new_password },
    });

    return { ok: true };
  });

export const removeWorkspaceUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertAdmin(supabase, userId, workspaceId);
    if (data.user_id === userId) throw new Error("Você não pode remover a si mesmo.");
    // FAIL-CLOSED: remoção de usuário é irreversível — bloqueia se a checagem falhar.
    await enforceRateLimit({ action: "user.remove", actorUserId: userId, workspaceId, useIp: true, failClosed: true });


    // alvo precisa pertencer ao MESMO workspace do admin que está agindo
    await assertTargetIsMember(data.user_id, workspaceId);

    // não permitir remover o último admin do workspace (quebraria gestão)
    const { data: target } = await supabaseAdmin
      .from("workspace_members").select("role")
      .eq("user_id", data.user_id).eq("workspace_id", workspaceId).maybeSingle();
    if (target?.role === "admin") {
      const { count } = await supabaseAdmin
        .from("workspace_members")
        .select("user_id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId).eq("role", "admin");
      if ((count ?? 0) <= 1) {
        throw new Error("Não é possível remover o último administrador do workspace.");
      }
    }

    const { error } = await supabaseAdmin.from("workspace_members")
      .delete().eq("user_id", data.user_id).eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);

    await logAction({
      category: "user",
      actorUserId: userId,
      workspaceId,
      action: "user.remove",
      entity: "workspace_member",
      entityId: data.user_id,
    });
    return { ok: true };
  });

export type BusinessHourRow = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export const getMemberBusinessHours = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ enabled: boolean; hours: BusinessHourRow[] }> => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);

    const { data: member } = await supabase
      .from("workspace_members")
      .select("business_hours_enabled")
      .eq("user_id", data.user_id)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const { data: hours, error } = await supabase
      .from("member_business_hours")
      .select("id, day_of_week, start_time, end_time")
      .eq("user_id", data.user_id)
      .eq("workspace_id", workspaceId)
      .order("day_of_week");
    if (error) throw new Error(error.message);

    return {
      enabled: member?.business_hours_enabled ?? false,
      hours: (hours ?? []) as BusinessHourRow[],
    };
  });

export const saveMemberBusinessHours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    user_id: z.string().uuid(),
    enabled: z.boolean(),
    hours: z.array(z.object({
      day_of_week: z.number().int().min(0).max(6),
      start_time: z.string().regex(/^\d{2}:\d{2}$/),
      end_time: z.string().regex(/^\d{2}:\d{2}$/),
    })).max(50),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertAdmin(supabase, userId, workspaceId);

    const { error: uErr } = await supabaseAdmin.from("workspace_members")
      .update({ business_hours_enabled: data.enabled })
      .eq("user_id", data.user_id).eq("workspace_id", workspaceId);
    if (uErr) throw new Error(uErr.message);

    await supabaseAdmin.from("member_business_hours")
      .delete().eq("user_id", data.user_id).eq("workspace_id", workspaceId);

    if (data.hours.length) {
      const rows = data.hours.map((h) => ({
        workspace_id: workspaceId,
        user_id: data.user_id,
        day_of_week: h.day_of_week,
        start_time: h.start_time,
        end_time: h.end_time,
      }));
      const { error: iErr } = await supabaseAdmin.from("member_business_hours").insert(rows);
      if (iErr) throw new Error(iErr.message);
    }

    await logAction({
      category: "user",
      actorUserId: userId,
      workspaceId,
      action: "user.business_hours",
      entity: "workspace_member",
      entityId: data.user_id,
      payload: { enabled: data.enabled, days: data.hours.length },
    });

    return { ok: true };
  });
