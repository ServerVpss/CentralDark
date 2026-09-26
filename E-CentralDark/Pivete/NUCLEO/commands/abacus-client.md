# COMANDO - abacus-client.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\hub\src\services\abacus-client.ts
**SHA:** b4d91bd166f32bc3
**Timestamp:** 2026-08-28T02:56:29.234312
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- async chat(model: string, prompt: string, correlationId = newCorrelationId()): Promise<{ ok: boolean; content: string; latencyMs: number; status: number; correlationId: string }> {

### Ouro Bruto (primeiros 5000 chars)
```
import { hubClient } from "@/integrations/supabase/hub-client";
import { newCorrelationId, logWarn } from "@/lib/buttonLog";

const FN_BASE = `${import.meta.env.VITE_HUB_SUPABASE_URL || "https://lyoigsqluyktoclwdaft.supabase.co"}/functions/v1/abacus-router`;

export class AuthRequiredError extends Error {
  code = "AUTH_REQUIRED";
  constructor(msg = "Sessão expirada — faça login para continuar.") { super(msg); }
}

async function requireSession() {
  const { data: { session } } = await hubClient.auth.getSession();
  if (!session?.access_token) throw new AuthRequiredError();
  return session;
}

async function authHeaders(correlationId: string, needSession: boolean) {
  const session = needSession ? await requireSession() : (await hubClient.auth.getSession()).data.session;
  return {
    "Content-Type": "application/json",
    "x-correlation-id": correlationId,
    Authorization: `Bearer ${session?.access_token ?? ""}`,
  };
}

export interface AbacusStatus {
  keyConfigured: boolean;
  keyHint: string | null;
  endpoints: { name: string; url: string; status: number; latencyMs: number; ok: boolean }[];
  modelCount: number;
}
export interface AbacusLog {
  id: string; model: string; status: number;
  latency_ms: number | null; tokens_in: number | null; tokens_out: number | null;
  error_snippet: string | null; created_at: string;
}
export interface AbacusModel { id: string; name: string; active: boolean; }

export const abacusApi = {
  async status(correlationId = newCorrelationId()): Promise<AbacusStatus> {
    const r = await fetch(`${FN_BASE}/status`, { headers: await authHeaders(correlationId, false) });
    if (!r.ok) throw new Error(`status ${r.status}`);
    return r.json();
  },

  async models(correlationId = newCorrelationId()): Promise<AbacusModel[]> {
    try {
      const r = await fetch(`${FN_BASE}/models`, { headers: await authHeaders(correlationId, true) });
      if (r.status === 401 || r.status === 403) {
        logWarn("abacus:models:auth", "Sessão inválida ou sem permissão (HTTP " + r.status + ").", { correlationId }, correlationId);
        throw new AuthRequiredError();
      }
      if (!r.ok) throw new Error(`models ${r.status}`);
      const j = await r.json();
      return j.models ?? [];
    } catch (e) {
      if (e instanceof AuthRequiredError) logWarn("abacus:models:auth", e.message, { correlationId }, correlationId);
      throw e;
    }
  },

  async logs(limit = 100, correlationId = newCorrelationId()): Promise<AbacusLog[]> {
    try {
      const r = await fetch(`${FN_BASE}/logs?limit=${limit}`, { headers: await authHeaders(correlationId, true) });
      if (r.status === 401 || r.status === 403) {
        logWarn("abacus:logs:auth", "Sessão inválida ou sem permissão (HTTP " + r.status + ").", { correlationId }, correlationId);
        throw new AuthRequiredError();
      }
      if (!r.ok) throw new Error(`logs ${r.status}`);
      const j = await r.json();
      return j.logs ?? [];
    } catch (e) {
      if (e instanceof AuthRequiredError) logWarn("abacus:logs:auth", e.message, { correlationId }, correlationId);
      throw e;
    }
  },

  async setKey(apiKey: string, correlationId = newCorrelationId()): Promise<{ ok: boolean; keyHint?: string; error?: string }> {
    const r = await fetch(`${FN_BASE}/set-key`, {
      method: "POST",
      headers: await authHeaders(correlationId, true),
      body: JSON.stringify({ apiKey }),
    });
    return r.json();
  },

  async chat(model: string, prompt: string, correlationId = newCorrelationId()): Promise<{ ok: boolean; content: string; latencyMs: number; status: number; correlationId: string }> {
    const t0 = performance.now();
    const r = await fetch(`${FN_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: await authHeaders(correlationId, true),
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], stream: false }),
    });
    const latencyMs = Math.round(performance.now() - t0);
    const text = await r.text();
    let content = text;
    try { const j = JSON.parse(text); content = j?.choices?.[0]?.message?.content ?? j?.error ?? text; } catch {}
    return { ok: r.ok, content, latencyMs, status: r.status, correlationId };
  },
};

```