import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

export type ForwardTarget = {
  id: string;
  name: string;
  phone_number_id: string | null;
  target_url: string;
  has_secret: boolean;
  active: boolean;
  forward_count: number;
  error_count: number;
  last_forward_at: string | null;
  last_error: string | null;
  last_error_at: string | null;
  created_at: string;
};

export const adminListForwardTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ForwardTarget[]> => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("webhook_forward_targets" as never)
      .select(
        "id,name,phone_number_id,target_url,secret,active,forward_count,error_count,last_forward_at,last_error,last_error_at,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Array<ForwardTarget & { secret: string | null }>).map((r) => ({
      id: r.id,
      name: r.name,
      phone_number_id: r.phone_number_id,
      target_url: r.target_url,
      has_secret: !!r.secret,
      active: r.active,
      forward_count: r.forward_count,
      error_count: r.error_count,
      last_forward_at: r.last_forward_at,
      last_error: r.last_error,
      last_error_at: r.last_error_at,
      created_at: r.created_at,
    }));
  });

export const adminUpsertForwardTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(120),
        target_url: z
          .string()
          .url()
          .refine((u) => u.startsWith("https://"), "Use https://"),
        phone_number_id: z.string().max(60).nullable().optional(),
        secret: z.string().max(500).optional(), // se vazio, não altera
        active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const payload: Record<string, unknown> = {
      name: data.name,
      target_url: data.target_url,
      phone_number_id: data.phone_number_id || null,
      active: data.active ?? true,
    };
    if (data.secret && data.secret.length > 0) payload.secret = data.secret;

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("webhook_forward_targets" as never)
        .update(payload as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      await logAction({
        category: "admin",
        action: "webhook_forward_target_updated",
        actorUserId: context.userId,
        entity: "webhook_forward_targets",
        entityId: data.id,
        payload: { name: data.name, target_url: data.target_url },
      });
      return { ok: true, id: data.id };
    }
    payload.created_by = context.userId;
    const { data: ins, error } = await supabaseAdmin
      .from("webhook_forward_targets" as never)
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const id = (ins as { id: string }).id;
    await logAction({
      category: "admin",
      action: "webhook_forward_target_created",
      actorUserId: context.userId,
      entity: "webhook_forward_targets",
      entityId: id,
      payload: { name: data.name, target_url: data.target_url },
    });
    return { ok: true, id };
  });

export const adminDeleteForwardTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("webhook_forward_targets" as never)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin",
      action: "webhook_forward_target_deleted",
      actorUserId: context.userId,
      entity: "webhook_forward_targets",
      entityId: data.id,
    });
    return { ok: true };
  });

export const adminTestForwardTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: t } = await supabaseAdmin
      .from("webhook_forward_targets" as never)
      .select("target_url,secret")
      .eq("id", data.id)
      .maybeSingle();
    const target = t as { target_url: string; secret: string | null } | null;
    if (!target) throw new Error("Destino não encontrado.");
    const body = JSON.stringify({
      test: true,
      from: "multizap",
      at: new Date().toISOString(),
    });
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-forwarded-from": "multizap-test",
    };
    if (target.secret) {
      const { createHmac } = await import("crypto");
      headers["x-forward-signature"] =
        "sha256=" + createHmac("sha256", target.secret).update(body).digest("hex");
    }
    try {
      const res = await fetch(target.target_url, { method: "POST", headers, body });
      const text = (await res.text().catch(() => "")).slice(0, 300);
      return { ok: res.ok, status: res.status, body: text };
    } catch (e) {
      return { ok: false, status: 0, body: String(e).slice(0, 300) };
    }
  });
