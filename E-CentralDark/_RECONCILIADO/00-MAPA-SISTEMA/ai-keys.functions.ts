import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

async function assertWorkspaceAdmin(userId: string, workspaceId: string) {
  const { data: sa } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (sa) return;
  const { data } = await supabaseAdmin
    .from("workspace_members").select("role")
    .eq("user_id", userId).eq("workspace_id", workspaceId).maybeSingle();
  if (!data || data.role !== "admin") throw new Error("Apenas administradores do workspace podem gerenciar a chave de IA.");
}

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function checkPlanAllowsByok(workspaceId: string): Promise<boolean> {
  const { data: sub } = await supabaseAdmin
    .from("subscriptions").select("plan_id")
    .eq("workspace_id", workspaceId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!sub?.plan_id) return false;
  const { data: plan } = await supabaseAdmin
    .from("plans").select("allow_byok").eq("id", sub.plan_id).single();
  return !!(plan as { allow_byok?: boolean } | null)?.allow_byok;
}

function maskKey(k: string | null | undefined): string | null {
  if (!k) return null;
  if (k.length <= 10) return "•••";
  return `${k.slice(0, 4)}••••${k.slice(-4)}`;
}

export const getMyAiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspaceId);
    const { data: row } = await supabaseAdmin
      .from("workspace_ai_keys" as never)
      .select("provider, api_key, active, last_test_ok, last_test_at, last_test_error, updated_at")
      .eq("workspace_id", data.workspaceId)
      .maybeSingle();
    const allowsByok = await checkPlanAllowsByok(data.workspaceId);
    const r = row as { provider?: string; api_key?: string; active?: boolean; last_test_ok?: boolean; last_test_at?: string; last_test_error?: string; updated_at?: string } | null;
    return {
      allowsByok,
      key: r ? {
        provider: r.provider,
        api_key_masked: maskKey(r.api_key),
        active: r.active,
        last_test_ok: r.last_test_ok ?? null,
        last_test_at: r.last_test_at ?? null,
        last_test_error: r.last_test_error ?? null,
        updated_at: r.updated_at,
      } : null,
    };
  });

export const setMyAiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid(),
    provider: z.enum(["openai", "gemini"]),
    apiKey: z.string().min(20).max(500),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspaceId);
    const allowsByok = await checkPlanAllowsByok(data.workspaceId);
    if (!allowsByok) throw new Error("Seu plano atual não permite usar chave própria. Faça upgrade pro Premium.");

    await supabaseAdmin.from("workspace_ai_keys" as never).upsert({
      workspace_id: data.workspaceId,
      provider: data.provider,
      api_key: data.apiKey,
      active: true,
    } as never, { onConflict: "workspace_id" });

    await logAction({
      category: "user", action: "ai_key_configured",
      actorUserId: context.userId, workspaceId: data.workspaceId,
      entity: "workspace_ai_keys", entityId: data.workspaceId,
      after: { provider: data.provider, active: true },
    });
    return { ok: true };
  });

export const toggleMyAiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid(), active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspaceId);
    await supabaseAdmin.from("workspace_ai_keys" as never)
      .update({ active: data.active } as never)
      .eq("workspace_id", data.workspaceId);
    await logAction({
      category: "user", action: data.active ? "ai_key_activated" : "ai_key_deactivated",
      actorUserId: context.userId, workspaceId: data.workspaceId,
      entity: "workspace_ai_keys", entityId: data.workspaceId,
      after: { active: data.active },
    });
    return { ok: true };
  });

export const deleteMyAiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspaceId);
    await supabaseAdmin.from("workspace_ai_keys" as never).delete().eq("workspace_id", data.workspaceId);
    await logAction({
      category: "user", action: "ai_key_removed",
      actorUserId: context.userId, workspaceId: data.workspaceId,
      entity: "workspace_ai_keys", entityId: data.workspaceId,
    });
    return { ok: true };
  });

export const testMyAiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceAdmin(context.userId, data.workspaceId);
    const { data: row } = await supabaseAdmin
      .from("workspace_ai_keys" as never)
      .select("provider, api_key").eq("workspace_id", data.workspaceId).maybeSingle();
    const r = row as { provider?: string; api_key?: string } | null;
    if (!r?.api_key) throw new Error("Nenhuma chave configurada.");

    let ok = false; let error: string | null = null;
    try {
      if (r.provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${r.api_key}` },
        });
        ok = res.ok;
        if (!ok) error = `OpenAI respondeu ${res.status}`;
      } else if (r.provider === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${r.api_key}`);
        ok = res.ok;
        if (!ok) error = `Gemini respondeu ${res.status}`;
      } else {
        error = "Provedor não suportado.";
      }
    } catch (e) {
      error = (e as Error).message;
    }

    await supabaseAdmin.from("workspace_ai_keys" as never).update({
      last_test_ok: ok, last_test_at: new Date().toISOString(), last_test_error: error,
    } as never).eq("workspace_id", data.workspaceId);

    return { ok, error };
  });

// ---------- master ----------

export const adminListAiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("workspace_ai_keys" as never)
      .select("workspace_id, provider, active, last_test_ok, last_test_at, updated_at")
      .order("updated_at", { ascending: false });
    const rows = (data ?? []) as Array<{ workspace_id: string; provider: string; active: boolean; last_test_ok: boolean | null; last_test_at: string | null; updated_at: string }>;
    const ids = Array.from(new Set(rows.map((r) => r.workspace_id)));
    const { data: ws } = ids.length
      ? await supabaseAdmin.from("workspaces").select("id,name").in("id", ids)
      : { data: [] as Array<{ id: string; name: string }> };
    const map = new Map((ws ?? []).map((w) => [w.id, w.name]));
    return rows.map((r) => ({ ...r, workspace_name: map.get(r.workspace_id) ?? "—" }));
  });

export const adminForceDisableAiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    await supabaseAdmin.from("workspace_ai_keys" as never)
      .update({ active: false } as never).eq("workspace_id", data.workspaceId);
    await logAction({
      category: "admin", action: "ai_key_force_disabled",
      actorUserId: context.userId, workspaceId: data.workspaceId,
      entity: "workspace_ai_keys", entityId: data.workspaceId,
      after: { active: false },
    });
    return { ok: true };
  });
