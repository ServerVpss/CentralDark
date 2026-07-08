import { hubClient } from '@/integrations/supabase/hub-client';

const FN_BASE = `${import.meta.env.VITE_HUB_SUPABASE_URL || 'https://lyoigsqluyktoclwdaft.supabase.co'}/functions/v1/abacus-router`;

async function headers() {
  const { data: { session } } = await hubClient.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  };
}

export interface AbacusStatus {
  keyConfigured: boolean;
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

export const abacusApi = {
  async status(): Promise<AbacusStatus> {
    const r = await fetch(`${FN_BASE}/status`, { headers: await headers() });
    if (!r.ok) throw new Error(`status ${r.status}`);
    return r.json();
  },

  async models(): Promise<AbacusModel[]> {
    const r = await fetch(`${FN_BASE}/models`, { headers: await headers() });
    if (!r.ok) throw new Error(`models ${r.status}`);
    const j = await r.json();
    return j.models ?? [];
  },

  async logs(limit = 100): Promise<AbacusLog[]> {
    const r = await fetch(`${FN_BASE}/logs?limit=${limit}`, { headers: await headers() });
    if (!r.ok) throw new Error(`logs ${r.status}`);
    const j = await r.json();
    return j.logs ?? [];
  },

  async chat(model: string, prompt: string): Promise<{ ok: boolean; content: string; latencyMs: number; status: number }> {
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
  },
};
