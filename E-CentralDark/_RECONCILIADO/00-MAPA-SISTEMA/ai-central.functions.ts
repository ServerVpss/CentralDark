// Central de IA — server functions (Fase 1B).
// Leituras: super_admin.
// Escritas: super_admin somente, via supabaseAdmin.
// NUNCA expõe api_key_encrypted ao frontend.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { encryptApiKey, decryptApiKey, last4 } from "@/lib/ai-vault.server";

// supabaseAdmin tipado depois do regen; por ora usamos any para tabelas novas
const db = supabaseAdmin as any;

async function requireMaster(): Promise<string> {
  const { getRequest } = await import("@tanstack/react-start/server");
  const req = getRequest();
  const auth = req?.headers?.get("authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Faça login.");
  const { data } = await supabaseAdmin.auth.getUser(auth.slice(7));
  const userId = data?.user?.id;
  if (!userId) throw new Error("Sessão expirada.");
  const { data: isMaster } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (!isMaster) throw new Error("Acesso restrito ao administrador.");
  return userId;
}

async function logAudit(userId: string, action: string, entityId: string, payload: Record<string, unknown> = {}) {
  await db
    .from("audit_log")
    .insert({
      actor_user_id: userId,
      action,
      entity: "ai_connection",
      entity_id: entityId,
      payload,
    })
    .then(() => null, () => null);
}

const SAFE_CONN_COLS =
  "id, provider_id, workspace_id, label, api_key_last4, base_url, is_managed, is_active, is_default, status, last_test_status, last_test_error, last_test_at, created_at, updated_at";

export const listAiProviders = createServerFn({ method: "GET" }).handler(async () => {
  await requireMaster();
  const { data, error } = await db.from("ai_providers").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error("Não foi possível listar provedores.");
  return data ?? [];
});

export const listAiConnections = createServerFn({ method: "GET" }).handler(async () => {
  await requireMaster();
  const { data, error } = await db.from("ai_connections").select(SAFE_CONN_COLS).order("created_at", { ascending: false });
  if (error) throw new Error("Não foi possível listar conexões.");
  return data ?? [];
});

export const listAiProfiles = createServerFn({ method: "GET" }).handler(async () => {
  await requireMaster();
  const { data, error } = await db.from("ai_profiles").select("*").order("profile_key", { ascending: true });
  if (error) throw new Error("Não foi possível listar perfis.");
  return data ?? [];
});

const CreateConnInput = z.object({
  providerId: z.string().uuid(),
  workspaceId: z.string().uuid().nullable().optional(),
  label: z.string().min(1).max(120),
  apiKey: z.string().min(8).max(8000),
  baseUrl: z.string().url().nullable().optional(),
  isManaged: z.boolean().optional().default(false),
  isDefault: z.boolean().optional().default(false),
});

export const createAiConnection = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => CreateConnInput.parse(i))
  .handler(async ({ data }) => {
    const userId = await requireMaster();
    const encrypted = encryptApiKey(data.apiKey);
    const { data: row, error } = await db
      .from("ai_connections")
      .insert({
        provider_id: data.providerId,
        workspace_id: data.workspaceId ?? null,
        label: data.label,
        api_key_encrypted: encrypted,
        api_key_last4: last4(data.apiKey),
        base_url: data.baseUrl ?? null,
        is_managed: data.isManaged ?? false,
        is_default: data.isDefault ?? false,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error("Não foi possível criar a conexão.");
    await logAudit(userId, "admin:ai_connection_create", row.id, { provider_id: data.providerId, label: data.label });
    return { id: row.id };
  });

const UpdateConnInput = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(120).optional(),
  apiKey: z.string().min(8).max(8000).nullable().optional(),
  baseUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAiConnection = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => UpdateConnInput.parse(i))
  .handler(async ({ data }) => {
    const userId = await requireMaster();
    const patch: Record<string, unknown> = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.baseUrl !== undefined) patch.base_url = data.baseUrl;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    if (data.isDefault !== undefined) patch.is_default = data.isDefault;
    if (data.apiKey) {
      patch.api_key_encrypted = encryptApiKey(data.apiKey);
      patch.api_key_last4 = last4(data.apiKey);
    }
    const { error } = await db.from("ai_connections").update(patch).eq("id", data.id);
    if (error) throw new Error("Não foi possível atualizar.");
    await logAudit(userId, "admin:ai_connection_update", data.id, { fields: Object.keys(patch) });
    return { ok: true };
  });

export const deleteAiConnection = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const userId = await requireMaster();
    const { error } = await db.from("ai_connections").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível remover.");
    await logAudit(userId, "admin:ai_connection_delete", data.id);
    return { ok: true };
  });

// Teste leve: descriptografa, faz uma chamada mínima ao provedor e grava status.
export const testAiConnection = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    await requireMaster();
    const { data: conn, error } = await db
      .from("ai_connections")
      .select("id, provider_id, api_key_encrypted, base_url, is_managed, ai_providers(slug)")
      .eq("id", data.id)
      .single();
    if (error || !conn) throw new Error("Conexão não encontrada.");

    const slug = conn.ai_providers?.slug as string;
    let ok = false;
    let errMsg: string | null = null;
    try {
      if (conn.is_managed || slug === "lovable") {
        if (!process.env.LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente no servidor.");
        ok = true;
      } else {
        if (!conn.api_key_encrypted) throw new Error("Chave não cadastrada.");
        const apiKey = decryptApiKey(conn.api_key_encrypted);
        if (slug === "openai") {
          const r = await fetch((conn.base_url ?? "https://api.openai.com/v1") + "/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          ok = true;
        } else if (slug === "anthropic") {
          const r = await fetch((conn.base_url ?? "https://api.anthropic.com/v1") + "/models", {
            headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          ok = true;
        } else if (slug === "google") {
          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
          );
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          ok = true;
        } else {
          ok = apiKey.length > 0;
        }
      }
    } catch (e) {
      errMsg = (e as Error).message?.slice(0, 300) ?? "Falha ao testar.";
    }

    await db
      .from("ai_connections")
      .update({
        status: ok ? "ok" : "error",
        last_test_status: ok ? "ok" : "error",
        last_test_error: errMsg,
        last_test_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    return { ok, error: errMsg };
  });
