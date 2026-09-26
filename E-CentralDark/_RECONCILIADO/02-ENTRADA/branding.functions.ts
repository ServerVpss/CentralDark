import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logAction } from "@/lib/audit.server";

export const getBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("workspace_branding")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

export const saveBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    workspaceId: string;
    brand_name?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
    sidebar_bg?: string | null;
    favicon_url?: string | null;
    login_background_url?: string | null;
    hide_lovable_brand?: boolean;
    email_from_name?: string | null;
  }) =>
    z.object({
      workspaceId: z.string().uuid(),
      brand_name: z.string().max(80).nullable().optional(),
      logo_url: z.string().url().max(500).nullable().optional(),
      primary_color: z.string().max(40).nullable().optional(),
      sidebar_bg: z.string().max(40).nullable().optional(),
      favicon_url: z.string().url().max(500).nullable().optional(),
      login_background_url: z.string().url().max(500).nullable().optional(),
      hide_lovable_brand: z.boolean().optional(),
      email_from_name: z.string().max(80).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { workspaceId, ...rest } = data;
    const { data: before } = await supabase
      .from("workspace_branding").select("*").eq("workspace_id", workspaceId).maybeSingle();
    const { error } = await supabase
      .from("workspace_branding")
      .upsert({ workspace_id: workspaceId, ...rest }, { onConflict: "workspace_id" });
    if (error) throw error;
    await logAction({
      category: "user", action: "branding_updated",
      actorUserId: userId, workspaceId, entity: "workspace_branding", entityId: workspaceId,
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), ...rest },
    });
    return { ok: true };
  });

