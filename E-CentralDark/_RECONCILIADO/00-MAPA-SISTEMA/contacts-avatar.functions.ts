import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { refreshContactAvatarFromQr, refreshGroupAvatarFromQr } from "./contacts-avatar.server";

// Refaz a foto de um único contato (botão "atualizar foto" no chat).
export const refreshOneContactAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ contactId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: c, error } = await supabase
      .from("contacts")
      .select("id,workspace_id,phone")
      .eq("id", data.contactId)
      .maybeSingle();
    if (error || !c || !c.phone) return { ok: false, reason: "contact_not_found" };
    return refreshContactAvatarFromQr({
      workspaceId: c.workspace_id,
      phone: c.phone,
      contactId: c.id,
      force: true,
    });
  });

// Master/admin: ressincroniza fotos do workspace em lote (até 200 por chamada).
// Pega contatos QR sem foto OU com foto > 24h, prioriza os mais recentes.
export const resyncWorkspaceAvatars = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid(),
      limit: z.number().int().min(1).max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // Permissão: super_admin OU admin do workspace.
    const { data: isMaster } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    if (!isMaster) {
      const { data: isAdmin } = await supabaseAdmin.rpc("is_workspace_admin", {
        _workspace_id: data.workspaceId,
        _user_id: userId,
      });
      if (!isAdmin) return { ok: false, reason: "forbidden" };
    }

    const limit = data.limit ?? 60; // lote menor pra caber no timeout
    const concurrency = 5;          // paralelismo controlado pra não estourar a WuzAPI
    const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: contacts } = await supabaseAdmin
      .from("contacts")
      .select("id,phone,avatar_synced_at,avatar_url")
      .eq("workspace_id", data.workspaceId)
      .not("phone", "is", null)
      .or(`avatar_url.is.null,avatar_synced_at.lt.${staleCutoff}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!contacts || contacts.length === 0) {
      return { ok: true, processed: 0, updated: 0 };
    }
    const items = contacts;

    let updated = 0, skipped = 0, failed = 0;
    let cursor = 0;
    async function worker() {
      while (cursor < items.length) {
        const c = items[cursor++];
        if (!c?.phone) continue;
        const r = await refreshContactAvatarFromQr({
          workspaceId: data.workspaceId,
          phone: c.phone,
          contactId: c.id,
          force: true,
        });
        if ("updated" in r && r.updated) updated++;
        else if (r.ok) skipped++;
        else failed++;
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    await supabaseAdmin.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: userId,
      action: "admin:contacts_avatar_resync",
      payload: { processed: contacts.length, updated, skipped, failed, limit },
    });

    return { ok: true, processed: contacts.length, updated, skipped, failed };
  });

// Backfill de fotos de grupos do workspace (até 100 por chamada).
export const resyncWorkspaceGroupAvatars = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid(),
      limit: z.number().int().min(1).max(200).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: isMaster } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    if (!isMaster) {
      const { data: isAdmin } = await supabaseAdmin.rpc("is_workspace_admin", {
        _workspace_id: data.workspaceId,
        _user_id: userId,
      });
      if (!isAdmin) return { ok: false, reason: "forbidden" };
    }

    const limit = data.limit ?? 60; // lote menor pra caber no timeout
    const concurrency = 5;          // paralelismo controlado pra não estourar a WuzAPI
    const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: groups } = await supabaseAdmin
      .from("whatsapp_groups")
      .select("id,jid,connection_id,picture_url,picture_synced_at")
      .eq("workspace_id", data.workspaceId)
      .not("jid", "is", null)
      .or(`picture_url.is.null,picture_synced_at.is.null,picture_synced_at.lt.${staleCutoff}`)
      .limit(limit);

    if (!groups || groups.length === 0) {
      return { ok: true, processed: 0, updated: 0, skipped: 0, failed: 0 };
    }
    const items = groups.filter((g): g is typeof g & { jid: string } => !!g.jid);

    let updated = 0, skipped = 0, failed = 0;
    let cursor = 0;
    async function worker() {
      while (cursor < items.length) {
        const g = items[cursor++];
        if (!g) continue;
        const r = await refreshGroupAvatarFromQr({
          workspaceId: data.workspaceId,
          connectionId: g.connection_id,
          groupJid: g.jid,
          force: true,
        });
        if ("updated" in r && r.updated) updated++;
        else if (r.ok) skipped++;
        else failed++;
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    await supabaseAdmin.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: userId,
      action: "admin:groups_avatar_resync",
      payload: { processed: items.length, updated, skipped, failed, limit },
    });

    return { ok: true, processed: items.length, updated, skipped, failed };
  });

// Auto-refresh leve, chamado pelo /app/chat ao abrir conversa.
// Usa `force:false` — o server pula sozinho se a foto está fresca (<24h)
// ou se foi marcada como "sem foto" recentemente (<6h).
export const ensureContactAvatarFresh = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ contactId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // RLS garante que o usuário só lê contatos do próprio workspace.
    const { data: c } = await supabase
      .from("contacts")
      .select("id,workspace_id,phone")
      .eq("id", data.contactId)
      .maybeSingle();
    if (!c?.phone) return { ok: true, skipped: "no_contact_or_phone" } as const;
    const r = await refreshContactAvatarFromQr({
      workspaceId: c.workspace_id,
      phone: c.phone,
      contactId: c.id,
      force: false,
    });
    return r;
  });

export const ensureGroupAvatarFresh = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ groupId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: g } = await supabase
      .from("whatsapp_groups")
      .select("id,workspace_id,jid,connection_id")
      .eq("id", data.groupId)
      .maybeSingle();
    if (!g?.jid) return { ok: true, skipped: "no_group_or_jid" } as const;
    const r = await refreshGroupAvatarFromQr({
      workspaceId: g.workspace_id,
      connectionId: g.connection_id,
      groupJid: g.jid,
      force: false,
    });
    return r;
  });

