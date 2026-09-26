import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const wsOnly = z.object({ workspaceId: z.string().uuid() });

const EVENT_LIST = [
  "ticket.created",
  "ticket.updated",
  "ticket.closed",
  "message.received",
  "message.sent",
  "contact.created",
  "contact.updated",
  "campaign.finished",
] as const;

export const listIntegrationEvents = createServerFn({ method: "GET" }).handler(async () => {
  return { events: EVENT_LIST };
});

// ===== WEBHOOKS =====
export const listWebhooks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => wsOnly.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("workspace_webhooks")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { webhooks: rows ?? [] };
  });

export const upsertWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      workspaceId: z.string().uuid(),
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(100),
      targetUrl: z.string().url().max(500),
      events: z.array(z.string()).min(1).max(20),
      active: z.boolean().default(true),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.id) {
      const { error } = await supabase
        .from("workspace_webhooks")
        .update({ name: data.name, target_url: data.targetUrl, events: data.events, active: data.active })
        .eq("id", data.id)
        .eq("workspace_id", data.workspaceId);
      if (error) throw error;
      await supabase.from("audit_log").insert({
        workspace_id: data.workspaceId,
        actor_user_id: userId,
        action: "webhook:update",
        payload: { id: data.id },
      });
      return { ok: true, id: data.id };
    }
    const secret = "whsec_" + randomBytes(24).toString("hex");
    const { data: row, error } = await supabase
      .from("workspace_webhooks")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        target_url: data.targetUrl,
        events: data.events,
        active: data.active,
        secret,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    await supabase.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: userId,
      action: "webhook:create",
      payload: { id: row.id, name: data.name },
    });
    return { ok: true, id: row.id, secret };
  });

export const deleteWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ workspaceId: z.string().uuid(), id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("workspace_webhooks")
      .delete()
      .eq("id", data.id)
      .eq("workspace_id", data.workspaceId);
    if (error) throw error;
    await supabase.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: userId,
      action: "webhook:delete",
      payload: { id: data.id },
    });
    return { ok: true };
  });

export const revealWebhookSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ workspaceId: z.string().uuid(), id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("workspace_webhooks")
      .select("secret")
      .eq("id", data.id)
      .eq("workspace_id", data.workspaceId)
      .single();
    if (error) throw error;
    return { secret: row?.secret ?? null };
  });

export const listWebhookDeliveries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ workspaceId: z.string().uuid(), webhookId: z.string().uuid().optional() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("workspace_webhook_deliveries")
      .select("id, webhook_id, event, status, http_status, latency_ms, attempt, error, created_at")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.webhookId) q = q.eq("webhook_id", data.webhookId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { deliveries: rows ?? [] };
  });

// ===== API TOKENS =====
export const listApiTokens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => wsOnly.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("workspace_api_tokens")
      .select("id, name, token_prefix, scopes, expires_at, last_used_at, use_count, revoked, created_at")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { tokens: rows ?? [] };
  });

export const createApiToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      workspaceId: z.string().uuid(),
      name: z.string().min(1).max(100),
      scopes: z.array(z.enum(["read", "write", "admin"])).min(1).default(["read", "write"]),
      expiresInDays: z.number().int().min(1).max(3650).optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const raw = "mzpk_" + randomBytes(28).toString("hex");
    const hash = createHash("sha256").update(raw).digest("hex");
    const prefix = raw.slice(0, 12);
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 86_400_000).toISOString()
      : null;

    const { data: row, error } = await supabase
      .from("workspace_api_tokens")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        token_hash: hash,
        token_prefix: prefix,
        scopes: data.scopes,
        expires_at: expiresAt,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw error;

    await supabase.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: userId,
      action: "api_token:create",
      payload: { id: row.id, name: data.name, scopes: data.scopes },
    });

    return { ok: true, id: row.id, token: raw, prefix };
  });

export const revokeApiToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ workspaceId: z.string().uuid(), id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("workspace_api_tokens")
      .update({ revoked: true })
      .eq("id", data.id)
      .eq("workspace_id", data.workspaceId);
    if (error) throw error;
    await supabase.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: userId,
      action: "api_token:revoke",
      payload: { id: data.id },
    });
    return { ok: true };
  });

export const deleteApiToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ workspaceId: z.string().uuid(), id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("workspace_api_tokens")
      .delete()
      .eq("id", data.id)
      .eq("workspace_id", data.workspaceId);
    if (error) throw error;
    await supabase.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: userId,
      action: "api_token:delete",
      payload: { id: data.id },
    });
    return { ok: true };
  });

// ===== MASTER =====
export const adminListAllWebhooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: sa } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
    if (!sa) throw new Error("Acesso negado");
    const { data: webhooks, error: e1 } = await supabase
      .from("workspace_webhooks")
      .select("*, workspaces:workspace_id(name, slug)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (e1) throw e1;
    const { data: tokens, error: e2 } = await supabase
      .from("workspace_api_tokens")
      .select("id, workspace_id, name, token_prefix, scopes, revoked, last_used_at, use_count, created_at, workspaces:workspace_id(name, slug)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (e2) throw e2;
    return { webhooks: webhooks ?? [], tokens: tokens ?? [] };
  });
