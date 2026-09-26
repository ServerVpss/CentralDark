// Server functions do fluxo "Adicionar número direto pelo MultiZap".
// Conversa só com a Meta Cloud API / WhatsApp Business Management API.
// Nunca persiste token, PIN ou código SMS em logs.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const META_API = "https://graph.facebook.com/v22.0";
const COOLDOWN_SECONDS = 60;

async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const { data: sa } = await supabaseAdmin
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (sa) return;
  const { data } = await supabaseAdmin
    .from("workspace_members").select("id")
    .eq("user_id", userId).eq("workspace_id", workspaceId).maybeSingle();
  if (!data) throw new Error("Acesso negado a este workspace.");
}

async function metaFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${META_API}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

type MetaError = {
  error?: {
    message?: string;
    code?: number | string;
    error_subcode?: number | string;
    error_user_title?: string;
    error_user_msg?: string;
  };
};

function readMetaError(body: unknown): {
  code: string | null;
  subcode: string | null;
  message: string | null;
  userMsg: string | null;
} {
  const b = body as MetaError | null;
  return {
    code: b?.error?.code != null ? String(b.error.code) : null,
    subcode: b?.error?.error_subcode != null ? String(b.error.error_subcode) : null,
    message: b?.error?.message ?? null,
    userMsg: b?.error?.error_user_msg ?? null,
  };
}

// Sanitização recursiva: remove qualquer chave com token/pin/code/secret/password
const SENSITIVE_KEY = /token|pin|code|secret|password|passwd/i;
function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(k)) continue;
      out[k] = sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

type MetaErrPayload = {
  friendly: string;
  next: string | null;
  action: string;
  status: number;
  code: string | null;
  subcode: string | null;
  message: string | null;
  raw: unknown;
};

function buildFriendly(action: string, status: number, body: unknown): { friendly: string; next: string | null } {
  const { code, message, userMsg } = readMetaError(body);
  const m = (message ?? "") + " " + (userMsg ?? "");

  if (status === 401 || status === 403 || code === "200" || code === "190" || /permission|oauth/i.test(m)) {
    return {
      friendly: "Seu token não tem permissão para essa ação.",
      next: "Gere um novo token com whatsapp_business_management e whatsapp_business_messaging.",
    };
  }
  if (/app secret/i.test(m)) {
    return { friendly: "App Secret ausente ou inválido.", next: "Configure em Canais → Configurações da Meta." };
  }
  if (action === "create_number") {
    if (/already.*(exist|registered|in use)/i.test(m) || code === "100") {
      return { friendly: "Este número já está registrado na Meta.", next: "Atualize a lista de números e selecione-o." };
    }
    if (status === 400) {
      return {
        friendly: "A Meta não permitiu adicionar esse número automaticamente.",
        next: "Adicione pelo WhatsApp Manager e clique em Atualizar números.",
      };
    }
  }
  if (action === "request_code") {
    if (/too many|rate/i.test(m)) {
      return { friendly: "Muitas tentativas em pouco tempo.", next: "Aguarde alguns minutos antes de tentar de novo." };
    }
    if (/not supported|cannot|unavailable/i.test(m)) {
      return {
        friendly: "A Meta não permitiu enviar o código automaticamente.",
        next: "Faça a verificação pelo WhatsApp Manager e clique em Atualizar números.",
      };
    }
  }
  if (action === "verify_code") {
    if (/expired|invalid|incorrect|mismatch/i.test(m)) {
      return { friendly: "O código está incorreto ou expirou.", next: "Solicite um novo SMS ou ligação." };
    }
  }
  if (action === "register") {
    if (/pin/i.test(m)) {
      return { friendly: "PIN incorreto.", next: "Confira os 6 dígitos do PIN de duas etapas." };
    }
    if (/re[- ]?verify|reverification/i.test(m)) {
      return {
        friendly: "Esse número precisa ser reverificado.",
        next: "Volte ao passo de confirmação e peça um novo código.",
      };
    }
  }
  return {
    friendly: userMsg ?? message ?? `Falha na Meta (HTTP ${status}).`,
    next: "Veja os detalhes técnicos abaixo ou contate o suporte.",
  };
}

function makeMetaError(action: string, status: number, body: unknown): MetaErrPayload {
  const { code, subcode, message } = readMetaError(body);
  const { friendly, next } = buildFriendly(action, status, body);
  return {
    friendly, next, action, status, code, subcode, message,
    raw: sanitize(body),
  };
}

function throwMetaError(payload: MetaErrPayload): never {
  throw new Error("META_ERR::" + JSON.stringify(payload));
}

async function logEvent(input: {
  workspaceId: string;
  profileId?: string | null;
  connectionId?: string | null;
  action: string;
  status: "ok" | "error" | "started";
  message?: string | null;
  metaErrorCode?: string | null;
  metaErrorMessage?: string | null;
  next?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const md = sanitize(input.metadata ?? {}) as Record<string, unknown>;
  if (input.next) md.next = input.next;
  await supabaseAdmin.from("meta_phone_number_events").insert({
    workspace_id: input.workspaceId,
    profile_id: input.profileId ?? null,
    connection_id: input.connectionId ?? null,
    action: input.action,
    status: input.status,
    message: input.message ?? null,
    meta_error_code: input.metaErrorCode ?? null,
    meta_error_message: input.metaErrorMessage ?? null,
    metadata: md as never,
  });
}

async function loadProfile(profileId: string) {
  const { data } = await supabaseAdmin
    .from("whatsapp_meta_profiles")
    .select("id,workspace_id,waba_id,access_token,name")
    .eq("id", profileId).single();
  if (!data) throw new Error("Perfil Meta não encontrado.");
  return data;
}

async function loadConnection(connectionId: string) {
  const { data } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,workspace_id,profile_id,phone_number_id,access_token,code_request_cooldown_until")
    .eq("id", connectionId).single();
  if (!data) throw new Error("Conexão não encontrada.");
  return data;
}

// ---------------- Verificar permissões do token ----------------

export const checkMetaTokenPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ profileId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const p = await loadProfile(data.profileId);
    await assertWorkspaceMember(context.userId, p.workspace_id);

    const res = await metaFetch(`/debug_token?input_token=${encodeURIComponent(p.access_token)}`, p.access_token);
    if (!res.ok) {
      return { ok: false, missing: [], message: "Não foi possível validar as permissões do token." };
    }
    const body = res.body as { data?: { scopes?: string[]; granular_scopes?: { scope: string }[] } };
    const scopes = new Set<string>([
      ...(body.data?.scopes ?? []),
      ...((body.data?.granular_scopes ?? []).map((g) => g.scope)),
    ]);
    const required = ["whatsapp_business_management", "whatsapp_business_messaging"];
    const missing = required.filter((s) => !scopes.has(s));
    return {
      ok: missing.length === 0,
      missing,
      message: missing.length === 0
        ? "Token com permissões corretas."
        : `Faltam permissões no token: ${missing.join(", ")}.`,
    };
  });

// ---------------- 1. Criar/adicionar número na WABA ----------------

export const createMetaPhoneNumber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      profileId: z.string().uuid(),
      display_name: z.string().trim().min(1).max(120),
      cc: z.string().trim().regex(/^\d{1,4}$/, "DDI deve conter apenas números (1 a 4 dígitos)"),
      phone_number: z.string().trim().regex(/^\d{6,15}$/, "Telefone deve conter apenas números"),
      verification_method: z.enum(["SMS", "VOICE"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const p = await loadProfile(data.profileId);
    await assertWorkspaceMember(context.userId, p.workspace_id);

    await logEvent({
      workspaceId: p.workspace_id, profileId: p.id,
      action: "create_number_started", status: "started",
      metadata: { cc: data.cc, verification_method: data.verification_method },
    });

    // Tenta criar o número na WABA.
    const create = await metaFetch(`/${p.waba_id}/phone_numbers`, p.access_token, {
      method: "POST",
      body: JSON.stringify({
        cc: data.cc,
        phone_number: data.phone_number,
        verified_name: data.display_name,
      }),
    });

    if (!create.ok) {
      const err = makeMetaError("create_number", create.status, create.body);
      await logEvent({
        workspaceId: p.workspace_id, profileId: p.id,
        action: "create_number_failed", status: "error",
        message: err.friendly, metaErrorCode: err.code, metaErrorMessage: err.message, next: err.next,
      });
      throwMetaError(err);
    }


    const created = create.body as { id?: string };
    const phoneNumberId = created.id ?? null;
    const formatted = `+${data.cc} ${data.phone_number}`;

    // Cria/atualiza a conexão local
    let connectionId: string;
    if (phoneNumberId) {
      const { data: existing } = await supabaseAdmin
        .from("whatsapp_connections")
        .select("id")
        .eq("workspace_id", p.workspace_id)
        .eq("phone_number_id", phoneNumberId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("whatsapp_connections")
          .update({
            profile_id: p.id,
            waba_id: p.waba_id,
            access_token: p.access_token,
            display_name: data.display_name,
            country_code: data.cc,
            phone: data.phone_number,
            display_phone_number: formatted,
            formatted_phone_number: formatted,
            verification_method: data.verification_method,
            status: "pending_verification",
            meta_status: "pending_verification",
            onboarding_mode: "manual",
            connection_mode: "new",
            provider: "meta_cloud",
          })
          .eq("id", existing.id);
        connectionId = existing.id;
      } else {
        const { data: inserted, error } = await supabaseAdmin
          .from("whatsapp_connections")
          .insert({
            workspace_id: p.workspace_id,
            profile_id: p.id,
            name: data.display_name,
            display_name: data.display_name,
            waba_id: p.waba_id,
            access_token: p.access_token,
            phone_number_id: phoneNumberId,
            country_code: data.cc,
            phone: data.phone_number,
            display_phone_number: formatted,
            formatted_phone_number: formatted,
            verification_method: data.verification_method,
            provider: "meta_cloud",
            connection_mode: "new",
            onboarding_mode: "manual",
            status: "pending_verification",
            meta_status: "pending_verification",
          })
          .select("id").single();
        if (error) throw new Error(error.message);
        connectionId = inserted.id;
      }
    } else {
      throw new Error("A Meta não retornou o ID do número. Tente novamente.");
    }

    await logEvent({
      workspaceId: p.workspace_id, profileId: p.id, connectionId,
      action: "create_number_success", status: "ok",
      metadata: { phone_number_id: phoneNumberId },
    });

    return { connectionId, phoneNumberId, formatted };
  });

// ---------------- 2. Pedir código (SMS / VOICE) ----------------

export const requestPhoneCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      connectionId: z.string().uuid(),
      method: z.enum(["SMS", "VOICE"]),
      language: z.string().trim().min(2).max(10).default("pt_BR"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId);
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.phone_number_id || !conn.access_token) {
      throw new Error("Conexão sem phone_number_id ou token.");
    }

    // Rate limit: 60s entre solicitações
    if (conn.code_request_cooldown_until && new Date(conn.code_request_cooldown_until) > new Date()) {
      const secs = Math.ceil((new Date(conn.code_request_cooldown_until).getTime() - Date.now()) / 1000);
      throw new Error(`Aguarde ${secs}s antes de pedir um novo código.`);
    }

    await logEvent({
      workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
      action: "request_code_started", status: "started",
      metadata: { method: data.method, language: data.language },
    });

    const res = await metaFetch(`/${conn.phone_number_id}/request_code`, conn.access_token, {
      method: "POST",
      body: JSON.stringify({ code_method: data.method, language: data.language }),
    });

    if (!res.ok) {
      const err = makeMetaError("request_code", res.status, res.body);
      await logEvent({
        workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
        action: "request_code_failed", status: "error",
        message: err.friendly, metaErrorCode: err.code, metaErrorMessage: err.message, next: err.next,
      });
      throwMetaError(err);
    }

    const until = new Date(Date.now() + COOLDOWN_SECONDS * 1000).toISOString();
    await supabaseAdmin
      .from("whatsapp_connections")
      .update({ code_request_cooldown_until: until, status: "awaiting_code", meta_status: "awaiting_code" })
      .eq("id", conn.id);

    await logEvent({
      workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
      action: "request_code_success", status: "ok",
      metadata: { method: data.method },
    });

    return { ok: true, cooldown_until: until };
  });

// ---------------- 3. Confirmar código ----------------

export const verifyPhoneCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      connectionId: z.string().uuid(),
      code: z.string().trim().regex(/^\d{3,8}$/, "Código inválido"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId);
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.phone_number_id || !conn.access_token) {
      throw new Error("Conexão sem phone_number_id ou token.");
    }

    await logEvent({
      workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
      action: "verify_code_started", status: "started",
    });

    const res = await metaFetch(`/${conn.phone_number_id}/verify_code`, conn.access_token, {
      method: "POST",
      body: JSON.stringify({ code: data.code }),
    });

    if (!res.ok) {
      const err = makeMetaError("verify_code", res.status, res.body);
      await logEvent({
        workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
        action: "verify_code_failed", status: "error",
        message: err.friendly, metaErrorCode: err.code, metaErrorMessage: err.message, next: err.next,
      });
      throwMetaError(err);
    }

    await supabaseAdmin
      .from("whatsapp_connections")
      .update({ status: "verified", meta_status: "verified" })
      .eq("id", conn.id);

    await logEvent({
      workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
      action: "verify_code_success", status: "ok",
    });
    return { ok: true };
  });

// ---------------- 4. Registrar número na Cloud API ----------------

export const registerMetaPhoneNumber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      connectionId: z.string().uuid(),
      pin: z.string().regex(/^\d{6}$/, "PIN deve ter 6 dígitos"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId);
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.phone_number_id || !conn.access_token) {
      throw new Error("Conexão sem phone_number_id ou token.");
    }

    await logEvent({
      workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
      action: "register_started", status: "started",
    });

    const res = await metaFetch(`/${conn.phone_number_id}/register`, conn.access_token, {
      method: "POST",
      body: JSON.stringify({ messaging_product: "whatsapp", pin: data.pin }),
    });

    if (!res.ok) {
      const err = makeMetaError("register", res.status, res.body);
      await logEvent({
        workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
        action: "register_failed", status: "error",
        message: err.friendly, metaErrorCode: err.code, metaErrorMessage: err.message, next: err.next,
      });
      throwMetaError(err);
    }

    await supabaseAdmin
      .from("whatsapp_connections")
      .update({
        status: "connected",
        meta_status: "connected",
        pin_set: true,
        registered_at: new Date().toISOString(),
      })
      .eq("id", conn.id);

    await logEvent({
      workspaceId: conn.workspace_id, profileId: conn.profile_id, connectionId: conn.id,
      action: "register_success", status: "ok",
    });

    return { ok: true };
  });
