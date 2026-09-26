// Segredo IA — server functions exposed to the client (Master Admin only)
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRequestHeader } from "@tanstack/react-start/server";
import { callAIGateway, isBlockedCommand, logSegredoAction } from "./segredo-ia.server";

import { formatTimeBR } from "@/lib/datetime";
async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

function clientMeta() {
  return {
    ip: getRequestHeader("x-forwarded-for") ?? getRequestHeader("cf-connecting-ip") ?? null,
    userAgent: getRequestHeader("user-agent") ?? null,
  };
}

// === STATUS ===
export const getSegredoStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);

    const { data: settings } = await supabaseAdmin
      .from("master_settings")
      .select("segredo_password_hash, segredo_session_minutes")
      .eq("id", 1)
      .maybeSingle();

    const passwordSet = !!(settings as { segredo_password_hash?: string } | null)?.segredo_password_hash;

    const { data: session } = await supabaseAdmin
      .from("ai_admin_sessions")
      .select("id, expires_at, blocked_until, failed_attempts, active")
      .eq("admin_user_id", context.userId)
      .eq("active", true)
      .order("activated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = Date.now();
    const s = session as { id: string; expires_at: string; blocked_until: string | null; failed_attempts: number; active: boolean } | null;
    const isActive = !!s && new Date(s.expires_at).getTime() > now;
    const blockedUntil = s?.blocked_until ? new Date(s.blocked_until).getTime() : 0;
    const isBlocked = blockedUntil > now;

    return {
      passwordSet,
      sessionMinutes: (settings as { segredo_session_minutes?: number } | null)?.segredo_session_minutes ?? 15,
      isActive,
      sessionId: isActive ? s!.id : null,
      expiresAt: isActive ? s!.expires_at : null,
      isBlocked,
      blockedUntil: isBlocked ? new Date(blockedUntil).toISOString() : null,
      failedAttempts: s?.failed_attempts ?? 0,
    };
  });

// === SET PASSWORD (master only, 1x) ===
export const setSegredoPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ newPassword: z.string().min(6).max(128), currentPassword: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: cur } = await supabaseAdmin
      .from("master_settings")
      .select("segredo_password_hash")
      .eq("id", 1)
      .maybeSingle();

    const existingHash = (cur as { segredo_password_hash?: string } | null)?.segredo_password_hash;
    if (existingHash) {
      if (!data.currentPassword) throw new Error("Informe a senha atual para trocar.");
      const ok = await bcrypt.compare(data.currentPassword, existingHash);
      if (!ok) throw new Error("Senha atual incorreta.");
    }

    const hash = await bcrypt.hash(data.newPassword, 10);
    const { error } = await supabaseAdmin
      .from("master_settings")
      .update({ segredo_password_hash: hash } as never)
      .eq("id", 1);
    if (error) throw new Error(error.message);

    await logSegredoAction({
      adminUserId: context.userId, sessionId: null,
      command: existingHash ? "[alterar senha do Modo Segredo]" : "[definir senha do Modo Segredo]",
      intent: "system_config", needsConfirmation: false, confirmed: true, status: "ok",
      ...clientMeta(),
    });
    return { ok: true };
  });

// === ACTIVATE ===
export const activateSegredoMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ password: z.string().min(1).max(256) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const meta = clientMeta();

    const { data: settings } = await supabaseAdmin
      .from("master_settings")
      .select("segredo_password_hash, segredo_session_minutes")
      .eq("id", 1)
      .maybeSingle();
    const s = settings as { segredo_password_hash: string | null; segredo_session_minutes: number } | null;
    if (!s?.segredo_password_hash) throw new Error("Senha do Modo Segredo ainda não foi definida. Vá em Configurações → Modo Segredo.");

    // Check existing block
    const { data: prev } = await supabaseAdmin
      .from("ai_admin_sessions")
      .select("id, blocked_until, failed_attempts")
      .eq("admin_user_id", context.userId)
      .order("activated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevS = prev as { id: string; blocked_until: string | null; failed_attempts: number } | null;
    if (prevS?.blocked_until && new Date(prevS.blocked_until).getTime() > Date.now()) {
      throw new Error(`Modo Segredo bloqueado até ${formatTimeBR(prevS.blocked_until)}.`);
    }

    const ok = await bcrypt.compare(data.password, s.segredo_password_hash);
    if (!ok) {
      const attempts = (prevS?.failed_attempts ?? 0) + 1;
      const blockedUntil = attempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await supabaseAdmin.from("ai_admin_sessions").insert({
        admin_user_id: context.userId,
        expires_at: new Date().toISOString(),
        failed_attempts: attempts,
        blocked_until: blockedUntil,
        active: false,
        ip: meta.ip,
        user_agent: meta.userAgent,
      } as never);
      await logSegredoAction({
        adminUserId: context.userId, sessionId: null,
        command: "[tentativa de ativar Modo Segredo]",
        intent: "activate_segredo", needsConfirmation: false, confirmed: false,
        status: "error", error: blockedUntil ? "senha incorreta — bloqueado por 15 min" : "senha incorreta",
        ...meta,
      });
      throw new Error(blockedUntil ? "Senha incorreta. Modo Segredo bloqueado por 15 minutos." : "Senha incorreta.");
    }

    // Deactivate any previous active sessions
    await supabaseAdmin.from("ai_admin_sessions")
      .update({ active: false } as never)
      .eq("admin_user_id", context.userId)
      .eq("active", true);

    const minutes = s.segredo_session_minutes ?? 15;
    const expires = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const { data: created, error } = await supabaseAdmin
      .from("ai_admin_sessions")
      .insert({
        admin_user_id: context.userId,
        expires_at: expires,
        failed_attempts: 0,
        active: true,
        ip: meta.ip,
        user_agent: meta.userAgent,
      } as never)
      .select("id, expires_at")
      .single();
    if (error) throw new Error(error.message);

    await logSegredoAction({
      adminUserId: context.userId, sessionId: (created as { id: string }).id,
      command: "[ativar Modo Segredo]",
      intent: "activate_segredo", needsConfirmation: false, confirmed: true, status: "ok",
      ...meta,
    });

    return { sessionId: (created as { id: string }).id, expiresAt: (created as { expires_at: string }).expires_at };
  });

// === DEACTIVATE ===
export const deactivateSegredoMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    await supabaseAdmin.from("ai_admin_sessions")
      .update({ active: false } as never)
      .eq("admin_user_id", context.userId)
      .eq("active", true);
    await logSegredoAction({
      adminUserId: context.userId, sessionId: null,
      command: "[desativar Modo Segredo]",
      intent: "deactivate_segredo", needsConfirmation: false, confirmed: true, status: "ok",
      ...clientMeta(),
    });
    return { ok: true };
  });

// === SEND COMMAND ===
export const sendSegredoCommand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    message: z.string().min(1).max(2000),
    sessionId: z.string().uuid(),
    history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).max(20).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const meta = clientMeta();

    // Validate session
    const { data: sess } = await supabaseAdmin
      .from("ai_admin_sessions")
      .select("id, expires_at, active")
      .eq("id", data.sessionId)
      .eq("admin_user_id", context.userId)
      .maybeSingle();
    const s = sess as { id: string; expires_at: string; active: boolean } | null;
    if (!s || !s.active || new Date(s.expires_at).getTime() < Date.now()) {
      throw new Error("Sessão do Modo Segredo expirou. Reative.");
    }

    // Block dangerous commands
    if (isBlockedCommand(data.message)) {
      await logSegredoAction({
        adminUserId: context.userId, sessionId: s.id,
        command: data.message, intent: "blocked", needsConfirmation: false, confirmed: false,
        status: "blocked", error: "comando bloqueado por filtro de segurança",
        ...meta,
      });
      return {
        reply: "Não posso executar esse tipo de comando. Pelo seu próprio bem 🛡️.",
        intent: "blocked", needsConfirmation: false, route: null, data: null,
      };
    }

    // Renew session "last_used"
    const newExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await supabaseAdmin.from("ai_admin_sessions")
      .update({ last_used_at: new Date().toISOString(), expires_at: newExpiry } as never)
      .eq("id", s.id);

    // Call AI
    const history = data.history ?? [];
    let result;
    try {
      result = await callAIGateway([
        ...history,
        { role: "user", content: data.message },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "falha na IA";
      await logSegredoAction({
        adminUserId: context.userId, sessionId: s.id,
        command: data.message, intent: "ai_error", needsConfirmation: false, confirmed: false,
        status: "error", error: msg, ...meta,
      });
      throw new Error(msg);
    }

    await logSegredoAction({
      adminUserId: context.userId, sessionId: s.id,
      command: data.message, intent: result.intent,
      needsConfirmation: result.needsConfirmation,
      confirmed: !result.needsConfirmation,
      status: "ok",
      routeOpened: result.route,
      result: { reply: result.reply.slice(0, 500) },
      ...meta,
    });

    return {
      reply: result.reply,
      intent: result.intent,
      needsConfirmation: result.needsConfirmation,
      route: result.route,
      data: result.data,
      newExpiresAt: newExpiry,
    };
  });
