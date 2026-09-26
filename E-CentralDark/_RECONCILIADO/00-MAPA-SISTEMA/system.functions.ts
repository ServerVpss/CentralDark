import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logAction } from "@/lib/audit.server";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

// ---------- Atualizações (banner de nova versão) ----------
export const adminGetVersionSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("master_settings")
      .select("version_banner_enabled,version_check_interval_seconds,force_refresh_token,updated_at")
      .eq("id", 1).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpdateVersionSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    version_banner_enabled: z.boolean().optional(),
    version_check_interval_seconds: z.number().int().min(15).max(600).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const updates: Record<string, unknown> = {};
    if (data.version_banner_enabled !== undefined) updates.version_banner_enabled = data.version_banner_enabled;
    if (data.version_check_interval_seconds !== undefined) updates.version_check_interval_seconds = data.version_check_interval_seconds;
    if (Object.keys(updates).length === 0) return { ok: true };
    const { data: before } = await supabaseAdmin
      .from("master_settings").select("version_banner_enabled,version_check_interval_seconds").eq("id", 1).maybeSingle();
    const { error } = await supabaseAdmin.from("master_settings").update(updates as never).eq("id", 1);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin", action: "system_version_settings_updated",
      actorUserId: context.userId, entity: "master_settings", entityId: "1",
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), ...updates },
    });
    return { ok: true };
  });

export const adminForceGlobalRefresh = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { error } = await supabaseAdmin.from("master_settings")
      .update({ force_refresh_token: token } as never).eq("id", 1);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin", action: "system_force_refresh",
      actorUserId: context.userId, entity: "master_settings", entityId: "1",
      payload: { token },
    });
    return { ok: true, token };
  });

// ---------- Jobs agendados ----------
export const adminListSystemJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("system_jobs")
      .select("id,name,description,cron_expr,endpoint_path,enabled,last_run_at,last_status,last_duration_ms,last_error,run_count,error_count,updated_at")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminToggleSystemJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), enabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: before } = await supabaseAdmin
      .from("system_jobs").select("name,enabled").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin.from("system_jobs")
      .update({ enabled: data.enabled } as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin", action: data.enabled ? "system_job_enabled" : "system_job_disabled",
      actorUserId: context.userId, entity: "system_jobs", entityId: data.id,
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), enabled: data.enabled },
    });
    return { ok: true };
  });

export const adminRunSystemJobNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: job, error } = await supabaseAdmin
      .from("system_jobs").select("name,endpoint_path,enabled").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!job) throw new Error("Job não encontrado.");
    if (!job.enabled) throw new Error("Job está desativado.");

    // Chama o próprio endpoint público (mesma origem). URL absoluta via env runtime.
    const base = process.env.PUBLIC_APP_URL || "";
    const url = base ? `${base}${job.endpoint_path}` : job.endpoint_path;
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const okText = await res.text();
      await logAction({
        category: "admin", action: "system_job_run_now",
        actorUserId: context.userId, entity: "system_jobs", entityId: data.id,
        payload: { job: job.name, status: res.status, ok: res.ok, body: okText.slice(0, 200) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${okText}`);
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(msg);
    }
  });
