// Server functions: convites por link para atendentes.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";
import { enforceRateLimit } from "@/lib/rate-limit.server";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken(): { token: string; hash: string; prefix: string } {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token), prefix: token.slice(0, 8) };
}

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
    throw new Error("Apenas administradores podem gerenciar convites.");
  }
}

async function checkPlanSeatLimit(workspaceId: string): Promise<{ ok: boolean; max: number | null; current: number }> {
  const { data: limits } = await supabaseAdmin.rpc("workspace_plan_limits", { _workspace_id: workspaceId });
  const max = limits && limits[0] ? limits[0].max_users : null;
  const { count: membersCount } = await supabaseAdmin
    .from("workspace_members")
    .select("user_id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("is_active", true);
  const { count: invitesCount } = await supabaseAdmin
    .from("workspace_invites")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");
  const current = (membersCount ?? 0) + (invitesCount ?? 0);
  return { ok: max == null || current < max, max, current };
}

// ---------- Tipos ----------
export type InviteRow = {
  id: string;
  token_prefix: string;
  email: string | null;
  phone: string | null;
  access_group_id: string | null;
  access_group_name: string | null;
  sector_ids: string[];
  sector_names: string[];
  max_uses: number;
  used_count: number;
  expires_at: string;
  status: "active" | "revoked" | "expired" | "used";
  created_at: string;
  invited_by_user_id: string | null;
  invited_by_name: string | null;
};

// ---------- Listar (admin/membro) ----------
export const listWorkspaceInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InviteRow[]> => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);

    // expira automaticamente convites vencidos
    await supabaseAdmin
      .from("workspace_invites")
      .update({ status: "expired" })
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString());

    const { data, error } = await supabase
      .from("workspace_invites")
      .select("id, token_prefix, email, phone, access_group_id, sector_ids, max_uses, used_count, expires_at, status, created_at, invited_by_user_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const groupIds = Array.from(new Set((data ?? []).map((r: any) => r.access_group_id).filter(Boolean)));
    const sectorIds = Array.from(new Set((data ?? []).flatMap((r: any) => r.sector_ids ?? [])));
    const userIds = Array.from(new Set((data ?? []).map((r: any) => r.invited_by_user_id).filter(Boolean)));

    const [{ data: groups }, { data: sectors }, { data: profiles }] = await Promise.all([
      groupIds.length ? supabaseAdmin.from("access_groups").select("id, name").in("id", groupIds) : Promise.resolve({ data: [] as any[] }),
      sectorIds.length ? supabaseAdmin.from("sectors").select("id, name").in("id", sectorIds) : Promise.resolve({ data: [] as any[] }),
      userIds.length ? supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const gMap = new Map((groups ?? []).map((g: any) => [g.id, g.name]));
    const sMap = new Map((sectors ?? []).map((s: any) => [s.id, s.name]));
    const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name ?? p.email]));

    return (data ?? []).map((r: any) => ({
      id: r.id,
      token_prefix: r.token_prefix,
      email: r.email,
      phone: r.phone,
      access_group_id: r.access_group_id,
      access_group_name: r.access_group_id ? (gMap.get(r.access_group_id) ?? null) : null,
      sector_ids: r.sector_ids ?? [],
      sector_names: (r.sector_ids ?? []).map((id: string) => sMap.get(id)).filter(Boolean) as string[],
      max_uses: r.max_uses,
      used_count: r.used_count,
      expires_at: r.expires_at,
      status: r.status,
      created_at: r.created_at,
      invited_by_user_id: r.invited_by_user_id,
      invited_by_name: r.invited_by_user_id ? (pMap.get(r.invited_by_user_id) ?? null) : null,
    }));
  });

// ---------- Criar convite ----------
export const createWorkspaceInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    access_group_id: z.string().uuid().nullable().optional(),
    sector_ids: z.array(z.string().uuid()).max(20).default([]),
    validity_hours: z.number().int().min(1).max(24 * 90),
    max_uses: z.number().int().min(1).max(1000).default(1),
    email: z.string().email().max(200).optional().nullable(),
    phone: z.string().max(40).optional().nullable(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertAdmin(supabase, userId, workspaceId);

    const plan = await checkPlanSeatLimit(workspaceId);
    if (!plan.ok) {
      throw new Error(`Seu plano atingiu o limite de ${plan.max} atendentes. Faça upgrade para adicionar mais usuários.`);
    }

    const { token, hash, prefix } = generateToken();
    const expiresAt = new Date(Date.now() + data.validity_hours * 3600 * 1000).toISOString();

    const { data: row, error } = await supabaseAdmin.from("workspace_invites").insert({
      workspace_id: workspaceId,
      invited_by_user_id: userId,
      token_hash: hash,
      token_prefix: prefix,
      email: data.email ?? null,
      phone: data.phone ?? null,
      access_group_id: data.access_group_id ?? null,
      sector_ids: data.sector_ids,
      max_uses: data.max_uses,
      expires_at: expiresAt,
    }).select("id").single();
    if (error) throw new Error(error.message);

    await logAction({
      category: "admin",
      action: "invite_created",
      workspaceId,
      actorUserId: userId,
      entity: "workspace_invite",
      entityId: row.id,
      payload: { max_uses: data.max_uses, expires_at: expiresAt, has_email: !!data.email },
    });

    return { ok: true, invite_id: row.id, token, prefix, expires_at: expiresAt };
  });

// ---------- Revogar ----------
export const revokeWorkspaceInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ invite_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertAdmin(supabase, userId, workspaceId);

    const { error } = await supabaseAdmin
      .from("workspace_invites")
      .update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_by: userId })
      .eq("id", data.invite_id)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);

    await logAction({
      category: "admin",
      action: "invite_revoked",
      workspaceId,
      actorUserId: userId,
      entity: "workspace_invite",
      entityId: data.invite_id,
    });
    return { ok: true };
  });

// ---------- Excluir ----------
export const deleteWorkspaceInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ invite_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    await assertAdmin(supabase, userId, workspaceId);
    const { error } = await supabaseAdmin
      .from("workspace_invites")
      .delete()
      .eq("id", data.invite_id)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin",
      action: "invite_deleted",
      workspaceId,
      actorUserId: userId,
      entity: "workspace_invite",
      entityId: data.invite_id,
    });
    return { ok: true };
  });

// ---------- Página pública: obter convite ----------
export type PublicInviteInfo =
  | { ok: true; workspace_name: string; workspace_logo: string | null; sector_names: string[]; access_group_name: string | null; expires_at: string; suggested_email: string | null; suggested_phone: string | null }
  | { ok: false; reason: "not_found" | "expired" | "revoked" | "used" };

export const getInviteByToken = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ token: z.string().min(20).max(200) }).parse(input))
  .handler(async ({ data }): Promise<PublicInviteInfo> => {
    const hash = hashToken(data.token);
    const { data: row } = await supabaseAdmin
      .from("workspace_invites")
      .select("id, workspace_id, status, expires_at, used_count, max_uses, sector_ids, access_group_id, email, phone")
      .eq("token_hash", hash)
      .maybeSingle();
    if (!row) return { ok: false, reason: "not_found" };

    if (row.status === "revoked") return { ok: false, reason: "revoked" };
    if (row.status === "used") return { ok: false, reason: "used" };
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from("workspace_invites").update({ status: "expired" }).eq("id", row.id);
      return { ok: false, reason: "expired" };
    }
    if (row.used_count >= row.max_uses) return { ok: false, reason: "used" };

    const [{ data: ws }, { data: branding }, { data: group }, { data: sectors }] = await Promise.all([
      supabaseAdmin.from("workspaces").select("name").eq("id", row.workspace_id).maybeSingle(),
      supabaseAdmin.from("workspace_branding").select("logo_url, brand_name").eq("workspace_id", row.workspace_id).maybeSingle(),
      row.access_group_id
        ? supabaseAdmin.from("access_groups").select("name").eq("id", row.access_group_id).maybeSingle()
        : Promise.resolve({ data: null as any }),
      (row.sector_ids ?? []).length
        ? supabaseAdmin.from("sectors").select("name").in("id", row.sector_ids)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    return {
      ok: true,
      workspace_name: branding?.brand_name ?? ws?.name ?? "Empresa",
      workspace_logo: branding?.logo_url ?? null,
      access_group_name: group?.name ?? null,
      sector_names: (sectors ?? []).map((s: any) => s.name),
      expires_at: row.expires_at,
      suggested_email: row.email,
      suggested_phone: row.phone,
    };
  });

// ---------- Aceitar convite (público) ----------
export const acceptInvite = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    token: z.string().min(20).max(200),
    full_name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).optional().nullable(),
    password: z.string().min(8).max(120),
  }).parse(input))
  .handler(async ({ data }) => {
    // FAIL-CLOSED: aceite de convite cria usuário + membership — bloqueia se a checagem falhar.
    await enforceRateLimit({ action: "invite.accept", useIp: true, failClosed: true });
    const hash = hashToken(data.token);

    const { data: invite, error: invErr } = await supabaseAdmin
      .from("workspace_invites")
      .select("*")
      .eq("token_hash", hash)
      .maybeSingle();
    if (invErr) throw new Error(invErr.message);
    if (!invite) throw new Error("Convite não encontrado.");
    if (invite.status === "revoked") throw new Error("Este convite foi revogado.");
    if (invite.status === "used") throw new Error("Este convite já foi totalmente utilizado.");
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from("workspace_invites").update({ status: "expired" }).eq("id", invite.id);
      throw new Error("Este convite expirou.");
    }
    if (invite.used_count >= invite.max_uses) throw new Error("Este convite atingiu o limite de usos.");

    // SEGURANÇA: convite sem grupo de acesso é inválido — nunca virar admin por fallback
    if (!invite.access_group_id) {
      throw new Error("Convite inválido: grupo de acesso não definido. Peça ao administrador para gerar um novo convite.");
    }

    // revalida limite do plano
    const plan = await checkPlanSeatLimit(invite.workspace_id);
    if (!plan.ok) {
      throw new Error(`A empresa atingiu o limite de ${plan.max} atendentes do plano atual.`);
    }

    // cria usuário no auth — flag `skip_default_workspace` evita o trigger
    // handle_new_user criar workspace próprio (com role=admin) para este usuário.
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        skip_default_workspace: true,
        invited_to_workspace_id: invite.workspace_id,
      },
    });
    if (cErr || !created.user) {
      const msg = cErr?.message ?? "Falha ao criar conta";
      throw new Error(msg.toLowerCase().includes("already") ? "Este e-mail já está cadastrado. Faça login normalmente." : msg);
    }
    const newUserId = created.user.id;

    await supabaseAdmin.from("profiles").upsert({
      id: newUserId,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone ?? null,
    });

    // SEGURANÇA: limpa qualquer resíduo caso versão antiga do trigger ainda esteja
    // rodando — remove membros admin e workspaces próprios que não sejam o do convite.
    await supabaseAdmin
      .from("workspace_members")
      .delete()
      .eq("user_id", newUserId)
      .neq("workspace_id", invite.workspace_id);
    await supabaseAdmin
      .from("workspaces")
      .delete()
      .eq("owner_id", newUserId)
      .neq("id", invite.workspace_id);

    // adiciona como atendente do workspace do convite — NUNCA admin
    const { error: mErr } = await supabaseAdmin.from("workspace_members").insert({
      workspace_id: invite.workspace_id,
      user_id: newUserId,
      role: "agent",
      is_active: true,
      access_group_id: invite.access_group_id,
      sector_ids: invite.sector_ids ?? [],
      origin: "invite",
    });
    if (mErr) {
      // limpa o auth user pra não deixar órfão
      await supabaseAdmin.auth.admin.deleteUser(newUserId).catch(() => {});
      throw new Error(mErr.message);
    }

    // atualiza contador
    const newUsed = invite.used_count + 1;
    const newStatus = newUsed >= invite.max_uses ? "used" : invite.status;
    await supabaseAdmin
      .from("workspace_invites")
      .update({ used_count: newUsed, status: newStatus })
      .eq("id", invite.id);

    await supabaseAdmin.from("invite_acceptances").insert({
      invite_id: invite.id,
      workspace_id: invite.workspace_id,
      user_id: newUserId,
      accepted_email: data.email,
      accepted_phone: data.phone ?? null,
      ip_address: null,
      user_agent: null,
    });

    await logAction({
      category: "admin",
      action: "invite_accepted",
      workspaceId: invite.workspace_id,
      actorUserId: newUserId,
      entity: "workspace_invite",
      entityId: invite.id,
      payload: { email: data.email, used_count: newUsed },
    });

    return { ok: true, email: data.email };
  });

// ---------- Master: listar todos os convites ----------
export type AdminInviteRow = InviteRow & { workspace_id: string; workspace_name: string };

export const adminListAllInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminInviteRow[]> => {
    const { userId } = context;
    const { data: isMaster } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    if (!isMaster) throw new Error("Acesso restrito.");

    const { data, error } = await supabaseAdmin
      .from("workspace_invites")
      .select("id, workspace_id, token_prefix, email, phone, access_group_id, sector_ids, max_uses, used_count, expires_at, status, created_at, invited_by_user_id")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const wsIds = Array.from(new Set((data ?? []).map((r: any) => r.workspace_id)));
    const { data: workspaces } = await supabaseAdmin.from("workspaces").select("id, name").in("id", wsIds);
    const wMap = new Map((workspaces ?? []).map((w: any) => [w.id, w.name]));

    return (data ?? []).map((r: any) => ({
      id: r.id,
      workspace_id: r.workspace_id,
      workspace_name: wMap.get(r.workspace_id) ?? "—",
      token_prefix: r.token_prefix,
      email: r.email,
      phone: r.phone,
      access_group_id: r.access_group_id,
      access_group_name: null,
      sector_ids: r.sector_ids ?? [],
      sector_names: [],
      max_uses: r.max_uses,
      used_count: r.used_count,
      expires_at: r.expires_at,
      status: r.status,
      created_at: r.created_at,
      invited_by_user_id: r.invited_by_user_id,
      invited_by_name: null,
    }));
  });

export const adminRevokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ invite_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: isMaster } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    if (!isMaster) throw new Error("Acesso restrito.");
    const { data: row } = await supabaseAdmin
      .from("workspace_invites")
      .select("workspace_id")
      .eq("id", data.invite_id)
      .maybeSingle();
    const { error } = await supabaseAdmin
      .from("workspace_invites")
      .update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_by: userId })
      .eq("id", data.invite_id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin",
      action: "invite_revoked_by_master",
      workspaceId: row?.workspace_id ?? null,
      actorUserId: userId,
      entity: "workspace_invite",
      entityId: data.invite_id,
    });
    return { ok: true };
  });
