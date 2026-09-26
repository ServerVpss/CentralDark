// Roteador da Central de IA (server-only).
// Recebe um profile_key (ex: "chat") e mensagens, decide qual conexão usar
// e chama o provedor. Loga em ai_call_log.
// Se a flag AI_CENTRAL_ENABLED não for "true", lança erro pro chamador
// cair no fallback antigo (callLovableAI).

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { decryptApiKey } from "@/lib/ai-vault.server";
import { callLovableAI, type AIGatewayCallInput, type AIGatewayCallResult } from "@/lib/ai-gateway.server";

const db = supabaseAdmin as any;

export function isCentralEnabled(): boolean {
  return (process.env.AI_CENTRAL_ENABLED ?? "").toLowerCase() === "true";
}

export type CentralCallInput = {
  profileKey: string; // ex: "chat"
  workspaceId?: string | null;
  messages: AIGatewayCallInput["messages"];
  temperature?: number;
  maxTokens?: number;
  context?: { feature?: string; userId?: string | null };
};

export async function callCentralAI(input: CentralCallInput): Promise<AIGatewayCallResult> {
  if (!isCentralEnabled()) {
    throw new Error("AI_CENTRAL_DISABLED");
  }

  // Resolve perfil (workspace primeiro, depois global)
  const { data: profile } = await supabaseAdmin
    .from("ai_profiles")
    .select("id, primary_connection_id, primary_model_id, backup_connection_id, backup_model_id, timeout_ms")
    .or(`workspace_id.eq.${input.workspaceId ?? "00000000-0000-0000-0000-000000000000"},workspace_id.is.null`)
    .eq("profile_key", input.profileKey)
    .eq("is_active", true)
    .order("workspace_id", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!profile?.primary_connection_id) {
    throw new Error("AI_CENTRAL_NO_PROFILE");
  }

  const result = await runOnConnection(profile.primary_connection_id, profile.primary_model_id, input);

  // log fire-and-forget
  db
    .from("ai_call_log")
    .insert({
      workspace_id: input.workspaceId ?? null,
      profile_id: profile.id,
      connection_id: profile.primary_connection_id,
      model_id: profile.primary_model_id,
      feature: input.context?.feature ?? "assistant",
      status: "ok",
      tokens_in: result.usage?.promptTokens ?? null,
      tokens_out: result.usage?.completionTokens ?? null,
      user_id: input.context?.userId ?? null,
    })
    .then(() => null, () => null);

  return result;
}

async function runOnConnection(
  connectionId: string,
  modelId: string | null,
  input: CentralCallInput,
): Promise<AIGatewayCallResult> {
  const { data: conn, error } = await db
    .from("ai_connections")
    .select("id, is_managed, api_key_encrypted, base_url, ai_providers(slug)")
    .eq("id", connectionId)
    .single();
  if (error || !conn) throw new Error("AI_CONN_NOT_FOUND");

  let modelSlug: string | undefined;
  if (modelId) {
    const { data: m } = await db.from("ai_models").select("model_id").eq("id", modelId).maybeSingle();
    modelSlug = m?.model_id;
  }

  const slug = conn.ai_providers?.slug as string;


  // Gerenciada (Lovable Gateway) → usa o helper antigo
  if (conn.is_managed || slug === "lovable") {
    return callLovableAI({
      model: modelSlug,
      messages: input.messages,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });
  }

  if (!conn.api_key_encrypted) throw new Error("AI_CONN_NO_KEY");
  const apiKey = decryptApiKey(conn.api_key_encrypted);

  // Por enquanto, suporte mínimo: chamadas OpenAI-compatíveis (OpenAI/custom).
  // Anthropic/Google ficam para fase seguinte.
  if (slug === "openai" || slug === "custom") {
    const base = conn.base_url ?? "https://api.openai.com/v1";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelSlug ?? "gpt-4o-mini",
        messages: input.messages,
        ...(typeof input.maxTokens === "number" ? { max_tokens: input.maxTokens } : {}),
      }),
    });
    if (!res.ok) throw new Error(`AI_PROVIDER_HTTP_${res.status}`);
    const json = await res.json();
    return {
      text: json?.choices?.[0]?.message?.content ?? "",
      model: json?.model ?? modelSlug ?? "openai",
      usage: json?.usage
        ? {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
            totalTokens: json.usage.total_tokens,
          }
        : undefined,
    };
  }

  throw new Error(`AI_PROVIDER_NOT_IMPLEMENTED_${slug}`);
}
