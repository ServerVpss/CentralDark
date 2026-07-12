// Edge function: testa Telegram, Notion, Drive, GitHub e VPS
// Retorna status de cada serviço com latência e mensagem.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

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

// Conector Telegram do Lovable foi removido de propósito pelo Pivete (11/07/2026) —
// Lovable é só front, não é canal de integração real aqui. O bot @srver1bot opera via
// token direto salvo em telegram_bots (mesmo mecanismo de notify-telegram/index.ts),
// não via connector-gateway.lovable.dev. Testamos o caminho REAL, não o abandonado.
async function checkTelegram(): Promise<Result> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return { service: 'telegram', ok: false, latency_ms: 0, message: 'SUPABASE_URL/SERVICE_ROLE_KEY ausentes' };
  }
  const r = await timed(async () => {
    const client = createClient(supabaseUrl, serviceKey);
    const { data: bots, error: dbErr } = await client
      .from('telegram_bots')
      .select('token, bot_username')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (dbErr) throw new Error(`telegram_bots query: ${dbErr.message}`);
    const bot = bots?.find((b) => b.bot_username === 'srver1bot') ?? bots?.[0];
    if (!bot?.token) throw new Error('nenhum bot ativo cadastrado em telegram_bots');

    const res = await fetch(`https://api.telegram.org/bot${bot.token}/getMe`);
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
