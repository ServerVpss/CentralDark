import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

async function assertSuper(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado.");
}

export type SystemRouteRow = {
  id: string; path: string; label: string; area: string;
  category: string; subcategory: string | null;
  status: "ok" | "placeholder" | "broken" | "hidden" | "wip";
  permission: string | null; notes: string | null; last_checked_at: string | null;
};

export const adminListSystemRoutes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ routes: SystemRouteRow[] }> => {
    await assertSuper(context.userId);
    const { data, error } = await supabaseAdmin
      .from("system_routes" as never)
      .select("*")
      .order("area").order("sort_order");
    if (error) throw new Error(error.message);
    return { routes: (data ?? []) as unknown as SystemRouteRow[] };
  });

export const adminUpdateRouteStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    status: z.enum(["ok", "placeholder", "broken", "hidden", "wip"]),
    notes: z.string().max(500).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuper(context.userId);
    const { data: before } = await supabaseAdmin
      .from("system_routes" as never).select("*").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin
      .from("system_routes" as never)
      .update({ status: data.status, notes: data.notes ?? null, last_checked_at: new Date().toISOString() } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    const beforeRec = (before ?? null) as Record<string, unknown> | null;
    await logAction({
      category: "admin", action: "route_status_changed",
      actorUserId: context.userId, entity: "system_routes", entityId: data.id,
      before: beforeRec,
      after: { ...(beforeRec ?? {}), status: data.status, notes: data.notes },
    });
    return { ok: true };
  });
