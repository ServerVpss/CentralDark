# MISSAO - meta-phone-numbers.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\meta-phone-numbers.functions.ts
**SHA:** d5510cd83e7b9d87
**Timestamp:** 2026-08-26T19:33:45.600268
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- return { ok: false, missing: [], message: "Não foi possível validar as permissões do token." };
- const missing = required.filter((s) => !scopes.has(s));

### Ouro Bruto (primeiros 5000 chars)
```
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
        next: "Volte ao passo de confirmação 
```