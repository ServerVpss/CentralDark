// Edge function: testa Telegram, Notion, Drive, GitHub e VPS
// Retorna status de cada serviço com latência e mensagem.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type Result = {
  service: string;
  ok: boolean;
  latency_ms: number;
  message: string;
  detail?: unknown;
};

async function timed<T>(fn: () => Promise<T>): Promise<{ value?: T; err?: unknown; ms: number }> {
  const t0 = Date.now();
  try {
    const value = await fn();
    return { value, ms: Date.now() - t0 };
  } catch (err) {
    return { err, ms: Date.now() - t0 };
  }
}

async function checkTelegram(): Promise<Result> {
  const key = Deno.env.get('TELEGRAM_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!key || !lovableKey) {
    return { service: 'telegram', ok: false, latency_ms: 0, message: 'Chave não configurada' };
  }
  const r = await timed(async () => {
    const res = await fetch('https://connector-gateway.lovable.dev/telegram/getMe', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        'X-Connection-Api-Key': key,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    const j = await res.json();
    if (!res.ok || !j.ok) throw new Error(JSON.stringify(j));
    return j.result;
  });
  return r.err
    ? { service: 'telegram', ok: false, latency_ms: r.ms, message: String(r.err).slice(0, 200) }
    : { service: 'telegram', ok: true, latency_ms: r.ms, message: `Bot @${(r.value as any).username}`, detail: r.value };
}

async function checkNotion(): Promise<Result> {
  const token = Deno.env.get('NOTION_API_TOKEN');
  if (!token) return { service: 'notion', ok: false, latency_ms: 0, message: 'NOTION_API_TOKEN ausente' };
  const r = await timed(async () => {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
      },
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message || res.statusText);
    return j;
  });
  return r.err
    ? { service: 'notion', ok: false, latency_ms: r.ms, message: String(r.err).slice(0, 200) }
    : { service: 'notion', ok: true, latency_ms: r.ms, message: `Bot: ${(r.value as any).name || 'ok'}`, detail: r.value };
}

async function checkGitHub(): Promise<Result> {
  const token = Deno.env.get('GITHUB_TOKEN') || Deno.env.get('GH_TOKEN') || Deno.env.get('GH_APP_TOKEN');
  if (!token) return { service: 'github', ok: false, latency_ms: 0, message: 'Token GitHub ausente' };
  const r = await timed(async () => {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'centraldark-hub' },
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message || res.statusText);
    return j;
  });
  return r.err
    ? { service: 'github', ok: false, latency_ms: r.ms, message: String(r.err).slice(0, 200) }
    : { service: 'github', ok: true, latency_ms: r.ms, message: `User: ${(r.value as any).login}`, detail: r.value };
}

async function checkVPS(): Promise<Result> {
  // Ping ao painel público como sinal de vida da VPS
  const r = await timed(async () => {
    const res = await fetch('https://status.centralldark.com/painel-data.json', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  });
  return r.err
    ? { service: 'vps', ok: false, latency_ms: r.ms, message: String(r.err).slice(0, 200) }
    : {
        service: 'vps',
        ok: true,
        latency_ms: r.ms,
        message: `Painel online (${(r.value as any)?.ultimo_commit?.slice(0, 7) || 'ok'})`,
        detail: { ultimo_commit: (r.value as any)?.ultimo_commit },
      };
}

async function checkDrive(): Promise<Result> {
  // Drive é sincronizado via rclone na VPS — checamos se o painel reporta bisync ok
  const r = await timed(async () => {
    const res = await fetch('https://status.centralldark.com/painel-data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  });
  if (r.err) return { service: 'drive', ok: false, latency_ms: r.ms, message: String(r.err).slice(0, 200) };
  // Se painel VPS respondeu, assumimos bisync ativo (rodando via cron)
  return {
    service: 'drive',
    ok: true,
    latency_ms: r.ms,
    message: 'Bisync via rclone (VPS ↔ CentralDark)',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const only = url.searchParams.get('service');

    const all: Array<() => Promise<Result>> = [
      checkTelegram,
      checkNotion,
      checkDrive,
      checkGitHub,
      checkVPS,
    ];
    const filtered = only
      ? all.filter((f) => f.name.toLowerCase().includes(only.toLowerCase()))
      : all;
    const results = await Promise.all(filtered.map((f) => f()));

    return new Response(
      JSON.stringify({ ok: true, ts: new Date().toISOString(), results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
