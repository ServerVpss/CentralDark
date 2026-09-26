// Rate limit server-side: usa a função SQL public.consume_rate_limit.
// Janela deslizante por (action, actor_user_id, workspace_id, ip_hash).
//
// MODOS:
//  - failOpen (padrão): se a checagem em si falhar (RPC error, timeout, etc.),
//    permite a operação. Usar apenas em fluxos NÃO sensíveis.
//  - failClosed: se a checagem falhar, BLOQUEIA a operação e registra
//    `rate_limit_check_failed` no audit_log. Obrigatório em criação/remoção
//    de usuários, mudança de role e aceite de convite.
import crypto from "crypto";
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

export type RateLimitAction =
  | "user.create"
  | "user.update"
  | "user.update.role"
  | "user.remove"
  | "invite.accept"
  | "invite.resend"
  | "workspace.signup";

export type RateLimitRule = {
  limit: number;
  windowSeconds: number;
};

export const RATE_LIMIT_RULES: Record<RateLimitAction, RateLimitRule> = {
  "user.create":       { limit: 10, windowSeconds: 3600 },
  "user.update":       { limit: 30, windowSeconds: 3600 },
  "user.update.role":  { limit: 10, windowSeconds: 3600 },
  "user.remove":       { limit: 10, windowSeconds: 3600 },
  "invite.accept":     { limit: 20, windowSeconds: 3600 },
  "invite.resend":     { limit: 20, windowSeconds: 3600 },
  "workspace.signup":  { limit: 5,  windowSeconds: 3600 },
};

export function getClientIpHash(): string | null {
  try {
    const raw =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-real-ip") ??
      (getRequestHeader("x-forwarded-for") ?? "").split(",")[0]?.trim() ??
      null;
    if (!raw) return null;
    return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32);
  } catch {
    return null;
  }
}

export class RateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class RateLimitCheckFailedError extends Error {
  constructor() {
    super("Não foi possível validar a segurança da operação agora. Tente novamente em instantes.");
    this.name = "RateLimitCheckFailedError";
  }
}

/**
 * Consome um token de rate limit. Lança RateLimitError se bloqueado por limite,
 * ou RateLimitCheckFailedError quando `failClosed=true` e a checagem em si falhou.
 * Aplica até 3 buckets independentes: por actor, por workspace, por ip.
 */
export async function enforceRateLimit(opts: {
  action: RateLimitAction;
  actorUserId?: string | null;
  workspaceId?: string | null;
  useIp?: boolean;
  /** Se true, bloqueia a operação quando a checagem do rate limit falhar (recomendado para ações sensíveis). */
  failClosed?: boolean;
}): Promise<void> {
  const rule = RATE_LIMIT_RULES[opts.action];
  const ipHash = opts.useIp ? getClientIpHash() : null;
  const failClosed = opts.failClosed === true;

  const buckets: Array<{ actor: string | null; ws: string | null; ip: string | null; tag: string }> = [];
  if (opts.actorUserId) buckets.push({ actor: opts.actorUserId, ws: null, ip: null, tag: "actor" });
  if (opts.workspaceId) buckets.push({ actor: null, ws: opts.workspaceId, ip: null, tag: "workspace" });
  if (ipHash) buckets.push({ actor: null, ws: null, ip: ipHash, tag: "ip" });

  // Em modo fail-closed sem nenhum bucket identificável, ainda é seguro permitir
  // (não há o que rastrear), porém logamos como aviso.
  if (buckets.length === 0 && failClosed) {
    await logAction({
      category: "security",
      action: "rate_limit_check_failed",
      actorUserId: opts.actorUserId ?? null,
      workspaceId: opts.workspaceId ?? null,
      entity: "rate_limit",
      payload: { action: opts.action, reason: "no_bucket_identifiable", fail_mode: "closed" },
    });
  }

  for (const b of buckets) {
    let rpcOk = false;
    try {
      const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
        _action: opts.action,
        _limit: rule.limit,
        _window_seconds: rule.windowSeconds,
        _actor_user_id: b.actor ?? undefined,
        _workspace_id: b.ws ?? undefined,
        _ip_hash: b.ip ?? undefined,
      });
      if (error) {
        // checagem em si falhou
        await logAction({
          category: "security",
          action: "rate_limit_check_failed",
          actorUserId: opts.actorUserId ?? null,
          workspaceId: opts.workspaceId ?? null,
          entity: "rate_limit",
          payload: {
            action: opts.action,
            bucket: b.tag,
            ip_hash: b.ip,
            error: error.message,
            fail_mode: failClosed ? "closed" : "open",
          },
        });
        if (failClosed) throw new RateLimitCheckFailedError();
        continue;
      }
      rpcOk = true;
      const row = Array.isArray(data) ? data[0] : data;
      if (row && row.allowed === false) {
        await logAction({
          category: "security",
          action: "rate_limit_blocked",
          actorUserId: opts.actorUserId ?? null,
          workspaceId: opts.workspaceId ?? null,
          entity: "rate_limit",
          payload: {
            action: opts.action,
            bucket: b.tag,
            ip_hash: b.ip,
            retry_after_seconds: row.retry_after_seconds,
          },
        });
        const minutes = Math.ceil((row.retry_after_seconds ?? 60) / 60);
        throw new RateLimitError(
          `Muitas operações em pouco tempo. Tente novamente em ${minutes} minuto${minutes === 1 ? "" : "s"}.`,
          row.retry_after_seconds ?? 60,
        );
      }
    } catch (e) {
      if (e instanceof RateLimitError) throw e;
      if (e instanceof RateLimitCheckFailedError) throw e;
      // erro inesperado (não RPC) — logar e respeitar fail mode
      if (!rpcOk) {
        await logAction({
          category: "security",
          action: "rate_limit_check_failed",
          actorUserId: opts.actorUserId ?? null,
          workspaceId: opts.workspaceId ?? null,
          entity: "rate_limit",
          payload: {
            action: opts.action,
            bucket: b.tag,
            ip_hash: b.ip,
            error: e instanceof Error ? e.message : "unknown",
            fail_mode: failClosed ? "closed" : "open",
          },
        }).catch(() => {});
        if (failClosed) throw new RateLimitCheckFailedError();
      }
    }
  }
}
