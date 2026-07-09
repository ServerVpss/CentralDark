import { hubClient } from '@/integrations/supabase/hub-client';
import { trackAction, logButton } from '@/lib/buttonLog';

const FN_BASE = `${import.meta.env.VITE_HUB_SUPABASE_URL || 'https://lyoigsqluyktoclwdaft.supabase.co'}/functions/v1/abacus-router`;

async function headers() {
  const { data: { session } } = await hubClient.auth.getSession();
  if (!session?.access_token) {
    logButton('abacus.no-session', { hint: 'usuário não autenticado no HUB — chamadas vão retornar 401' });
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  };
}

export interface AbacusStatus {
  keyConfigured: boolean;
  keyHint: string | null;
  endpoints: { name: string; url: string; status: number; latencyMs: number; ok: boolean }[];
  modelCount: number;
}

export interface AbacusLog {
  id: string;
  model: string;
  status: number;
  latency_ms: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  error_snippet: string | null;
  created_at: string;
}

export interface AbacusModel {
  id: string;
  name: string;
  active: boolean;
}

async function safeFetchJson(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  const text = await r.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* mantém texto */ }
  return { status: r.status, ok: r.ok, body };
}

export const abacusApi = {
  status(): Promise<AbacusStatus> {
    return trackAction('abacus.status', async () => {
      const { ok, status, body } = await safeFetchJson(`${FN_BASE}/status`, { headers: await headers() });
      if (!ok) throw new Error(`status ${status}`);
      return body as AbacusStatus;
    });
  },

  models(): Promise<AbacusModel[]> {
    return trackAction('abacus.models', async () => {
      const { ok, status, body } = await safeFetchJson(`${FN_BASE}/models`, { headers: await headers() });
      if (!ok) throw new Error(`models ${status}`);
      return ((body as any)?.models ?? []) as AbacusModel[];
    });
  },

  logs(limit = 100): Promise<AbacusLog[]> {
    return trackAction('abacus.logs', async () => {
      const { ok, status, body } = await safeFetchJson(`${FN_BASE}/logs?limit=${limit}`, { headers: await headers() });
      if (!ok) throw new Error(`logs ${status}`);
      return ((body as any)?.logs ?? []) as AbacusLog[];
    }, { limit });
  },

  setKey(apiKey: string): Promise<{ ok: boolean; keyHint?: string; error?: string }> {
    return trackAction('abacus.set-key', async () => {
      const { body } = await safeFetchJson(`${FN_BASE}/set-key`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify({ apiKey }),
      });
      return body as { ok: boolean; keyHint?: string; error?: string };
    }, { keyLen: apiKey.length });
  },

  chat(model: string, prompt: string): Promise<{ ok: boolean; content: string; latencyMs: number; status: number }> {
    return trackAction('abacus.chat', async () => {
      const t0 = performance.now();
      const r = await fetch(`${FN_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const text = await r.text();
      let content = text;
      try {
        const j = JSON.parse(text);
        content = j?.choices?.[0]?.message?.content ?? j?.error ?? text;
      } catch { /* mantém texto cru */ }
      return { ok: r.ok, content, latencyMs, status: r.status };
    }, { model, promptLen: prompt.length });
  },
};
