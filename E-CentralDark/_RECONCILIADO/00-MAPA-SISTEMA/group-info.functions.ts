// Server functions para integração CRM ↔ Gateway /group-info.
// - refreshGroupInfo: 1 grupo (super_admin OU membro do workspace dono).
// - backfillMissingGroupNames: super_admin only, lote controlado 1/seg.
//   Definida mas NÃO executada em lote nesta fase — aguarda autorização.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { updateGroupFromGateway, type UpdateGroupResult } from "./group-info.server";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function isSuperAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  return data === true;
}

async function isWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.rpc("is_workspace_member", {
    _workspace_id: workspaceId,
    _user_id: userId,
  });
  return data === true;
}

export const refreshGroupInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ groupId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<UpdateGroupResult> => {
    const { userId } = context;

    const { data: group, error } = await supabaseAdmin
      .from("whatsapp_groups")
      .select("id, workspace_id")
      .eq("id", data.groupId)
      .maybeSingle();

    if (error) {
      console.warn(`[refreshGroupInfo] select erro: ${error.message}`);
      return { ok: false, reason: "db_select_failed" };
    }
    if (!group) return { ok: false, reason: "group_not_found_local" };

    const allowed =
      (await isSuperAdmin(userId)) ||
      (await isWorkspaceMember(group.workspace_id, userId));
    if (!allowed) {
      return { ok: false, reason: "forbidden" };
    }

    return updateGroupFromGateway(data.groupId);
  });

export type BackfillResult = {
  ok: boolean;
  reason?: string;
  processed: number;
  updated: number;
  failed: Array<{ groupId: string; reason: string }>;
};

export const backfillMissingGroupNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ limit: z.number().int().min(1).max(50).default(5) })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<BackfillResult> => {
    const { userId } = context;

    if (!(await isSuperAdmin(userId))) {
      return { ok: false, reason: "forbidden", processed: 0, updated: 0, failed: [] };
    }

    const { data: rows, error } = await supabaseAdmin
      .from("whatsapp_groups")
      .select("id, jid, name")
      .like("jid", "%@g.us")
      .order("created_at", { ascending: true })
      .limit(data.limit);

    if (error) {
      console.warn(`[backfillMissingGroupNames] select erro: ${error.message}`);
      return {
        ok: false,
        reason: "db_select_failed",
        processed: 0,
        updated: 0,
        failed: [],
      };
    }

    // Filtra os "sem nome real" no app pra evitar OR complexo no PostgREST.
    const targets = (rows ?? []).filter((g) => {
      const n = (g.name ?? "").trim();
      return n === "" || n === g.jid;
    });

    const failed: BackfillResult["failed"] = [];
    let updated = 0;

    for (let i = 0; i < targets.length; i++) {
      const g = targets[i];
      try {
        const res = await updateGroupFromGateway(g.id);
        if (res.ok) {
          if (res.changed && Object.keys(res.changed).length > 0) updated += 1;
        } else {
          failed.push({ groupId: g.id, reason: res.reason ?? "unknown" });
        }
      } catch (err) {
        failed.push({
          groupId: g.id,
          reason: err instanceof Error ? err.message : "exception",
        });
      }
      // Rate limit: 1 req/seg
      if (i < targets.length - 1) await sleep(1100);
    }

    const result: BackfillResult = {
      ok: true,
      processed: targets.length,
      updated,
      failed,
    };

    // Auditoria: super_admin action
    try {
      await supabaseAdmin.from("audit_log").insert({
        actor_user_id: userId,
        action: "admin:backfill_groups",
        category: "admin",
        entity: "whatsapp_groups",
        payload: {
          limit: data.limit,
          processed: result.processed,
          updated: result.updated,
          failed_count: result.failed.length,
          failed: result.failed.slice(0, 20),
        },
      });
    } catch (err) {
      console.warn(
        `[backfillMissingGroupNames] audit_log insert falhou: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return result;
  });
