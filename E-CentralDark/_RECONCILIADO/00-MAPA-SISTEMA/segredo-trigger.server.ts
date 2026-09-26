// Server-only: detecta "ativar modo segredo[: SENHA]" vindo do WhatsApp do super admin
// e ativa uma sessão de Modo Segredo. Manda confirmação/erro de volta pelo Zap quando possível.
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp-send.server";

import { formatTimeBR } from "@/lib/datetime";
const PHRASE = /^\s*ativar\s+modo\s+segredo\s*[:\-\s]*\s*(.*)$/i;

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

type Settings = {
  segredo_password_hash: string | null;
  segredo_session_minutes: number | null;
  super_admin_phone_e164: string | null;
  super_admin_notify_connection_id: string | null;
  segredo_block_after_attempts: number | null;
  segredo_block_minutes: number | null;
};

async function notify(text: string, fromConnId: string, toPhone: string, preferredConnId: string | null) {
  // Tenta a conexão preferida; se falhar (ex: fora da janela), tenta a conexão da própria mensagem.
  const targets = preferredConnId && preferredConnId !== fromConnId ? [preferredConnId, fromConnId] : [fromConnId];
  for (const cid of targets) {
    const r = await dispatchWhatsAppMessage({ connectionId: cid, to: toPhone, text });
    if (r.ok) return true;
  }
  return false;
}

async function logAudit(action: string, payload: Record<string, unknown>) {
  await supabaseAdmin.from("audit_log").insert({
    action: `admin:segredo_${action}`,
    payload: payload as never,
    category: "system",
  });
}

/**
 * Retorna `true` se a mensagem foi consumida (não deve cair no chatbot/IA).
 */
export async function tryHandleSegredoTrigger(opts: {
  fromPhone: string;
  body: string;
  connectionId: string;
}): Promise<boolean> {
  const text = (opts.body ?? "").trim();
  const match = normalize(text).match(PHRASE);
  if (!match) return false;

  const { data: s } = await supabaseAdmin
    .from("master_settings")
    .select("segredo_password_hash, segredo_session_minutes, super_admin_phone_e164, super_admin_notify_connection_id, segredo_block_after_attempts, segredo_block_minutes")
    .eq("id", 1)
    .maybeSingle();
  const settings = (s ?? null) as Settings | null;

  // Sem número cadastrado → ignora silenciosamente para não vazar info.
  if (!settings?.super_admin_phone_e164) return false;

  const isAuthorized = opts.fromPhone === settings.super_admin_phone_e164;
  if (!isAuthorized) {
    // Loga tentativa de número não autorizado, mas não responde nada (stealth).
    await logAudit("unauthorized_phone_attempt", {
      from: opts.fromPhone,
      connection_id: opts.connectionId,
      body_preview: text.slice(0, 200),
    });
    return true; // consome para não ativar chatbot
  }

  // Achar o super_admin user (usa o primeiro)
  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin")
    .order("user_id", { ascending: true })
    .limit(1)
    .maybeSingle();
  const adminUserId = roleRow?.user_id as string | undefined;
  if (!adminUserId) {
    await logAudit("no_super_admin_user", { from: opts.fromPhone });
    return true;
  }

  // Bloqueio ativo?
  const { data: prev } = await supabaseAdmin
    .from("ai_admin_sessions")
    .select("id, blocked_until, failed_attempts")
    .eq("admin_user_id", adminUserId)
    .order("activated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const blockedUntil = prev?.blocked_until ? new Date(prev.blocked_until as string) : null;
  if (blockedUntil && blockedUntil.getTime() > Date.now()) {
    await notify(
      `🚫 Modo Segredo bloqueado até ${formatTimeBR(blockedUntil, { hour: "2-digit", minute: "2-digit", second: "2-digit" })} por excesso de tentativas erradas.`,
      opts.connectionId,
      opts.fromPhone,
      settings.super_admin_notify_connection_id,
    );
    await logAudit("blocked_attempt_while_locked", { from: opts.fromPhone, blocked_until: blockedUntil.toISOString() });
    return true;
  }

  // Senha?
  const password = (match[1] ?? "").trim();
  if (!settings.segredo_password_hash) {
    await notify(
      "⚠️ Senha do Modo Segredo ainda não foi cadastrada no painel. Vá em Admin → Configurações → Modo Segredo.",
      opts.connectionId,
      opts.fromPhone,
      settings.super_admin_notify_connection_id,
    );
    return true;
  }
  if (!password) {
    await notify(
      "🔐 Para ativar pelo Zap, mande no formato:\n\n*ativar modo segredo: SUA_SENHA*",
      opts.connectionId,
      opts.fromPhone,
      settings.super_admin_notify_connection_id,
    );
    return true;
  }

  const ok = await bcrypt.compare(password, settings.segredo_password_hash);
  if (!ok) {
    const limit = settings.segredo_block_after_attempts ?? 3;
    const blockMin = settings.segredo_block_minutes ?? 10;
    const attempts = ((prev?.failed_attempts as number | null) ?? 0) + 1;
    const newBlock = attempts >= limit ? new Date(Date.now() + blockMin * 60_000).toISOString() : null;
    await supabaseAdmin.from("ai_admin_sessions").insert({
      admin_user_id: adminUserId,
      expires_at: new Date().toISOString(),
      failed_attempts: attempts,
      blocked_until: newBlock,
      active: false,
      ip: `whatsapp:${opts.fromPhone}`,
      user_agent: "whatsapp-trigger",
    } as never);
    await notify(
      newBlock
        ? `❌ Senha incorreta. Acesso bloqueado por ${blockMin} minutos.`
        : `❌ Senha incorreta (${attempts}/${limit}).`,
      opts.connectionId,
      opts.fromPhone,
      settings.super_admin_notify_connection_id,
    );
    await logAudit("wrong_password_via_whatsapp", { from: opts.fromPhone, attempts, blocked: !!newBlock });
    return true;
  }

  // Sucesso — ativa sessão
  await supabaseAdmin
    .from("ai_admin_sessions")
    .update({ active: false } as never)
    .eq("admin_user_id", adminUserId)
    .eq("active", true);

  const minutes = settings.segredo_session_minutes ?? 15;
  const expires = new Date(Date.now() + minutes * 60_000).toISOString();
  const { data: created } = await supabaseAdmin
    .from("ai_admin_sessions")
    .insert({
      admin_user_id: adminUserId,
      expires_at: expires,
      failed_attempts: 0,
      active: true,
      ip: `whatsapp:${opts.fromPhone}`,
      user_agent: "whatsapp-trigger",
    } as never)
    .select("id")
    .single();

  await notify(
    `✅ *Modo Segredo ativado* via WhatsApp.\nSessão válida por ${minutes} min (expira ${formatTimeBR(expires)}).\nAbra o painel para conversar com a IA.`,
    opts.connectionId,
    opts.fromPhone,
    settings.super_admin_notify_connection_id,
  );
  await logAudit("activated_via_whatsapp", {
    from: opts.fromPhone,
    session_id: (created as { id?: string } | null)?.id ?? null,
    expires_at: expires,
  });
  return true;
}
