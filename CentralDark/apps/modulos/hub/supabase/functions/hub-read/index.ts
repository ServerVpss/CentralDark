// Edge: hub-read (HUB Supabase / lyoigsqluyktoclwdaft)
// Somente leitura agregada: missões, eventos e evidências.
// Autorização: qualquer usuário autenticado (JWT válido).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Existing HUB read surface: same authenticated entrypoint, scoped deploy sensor.
// GitHub Actions is CI evidence; a successful run is NOT proof of VPS runtime.
async function readDeployState() {
  const token = Deno.env.get('GITHUB_TOKEN') || Deno.env.get('GH_TOKEN');
  const workflowUrl = 'https://github.com/ServerVpss/CentralDark/actions/workflows/vps-exec-selfhosted.yml';
  const verifiedAt = new Date().toISOString();
  if (!token) return {
    state: 'SENSOR_BLOCKED', reason: 'HUB_GITHUB_TOKEN_NOT_CONFIGURED',
    runtimeProof: false, verifiedAt, workflowUrl,
  };
  const api = 'https://api.github.com/repos/ServerVpss/CentralDark';
  const get = async (pathname: string) => {
    const res = await fetch(api + pathname, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error('GITHUB_HTTP_' + res.status);
    return res.json();
  };
  try {
    const [commit, workflows] = await Promise.all([
      get('/commits/main'),
      get('/actions/workflows/vps-exec-selfhosted.yml/runs?branch=main&per_page=30'),
    ]);
    const sha = typeof commit?.sha === 'string' && /^[a-f0-9]{40}$/.test(commit.sha)
      ? commit.sha : '';
    if (!sha) throw new Error('GITHUB_MAIN_SHA_INVALID');
    const runs = Array.isArray(workflows?.workflow_runs) ? workflows.workflow_runs : [];
    const current = runs.find((run: any) => run.head_sha === sha);
    const runState = current?.status || 'not_dispatched';
    const conclusion = current?.conclusion || null;
    let state = 'PENDING';
    if (runState === 'queued' || runState === 'waiting' || runState === 'pending') state = 'QUEUED';
    else if (runState === 'in_progress') state = 'RUNNING';
    else if (runState === 'completed' && conclusion === 'success') state = 'AWAIT_RUNTIME_PROOF';
    else if (runState === 'completed' && conclusion === 'failure') state = 'FAILED';
    else if (runState === 'completed') state = 'PENDING';
    return {
      state, mainSha: sha, runId: current?.id || null,
      runStatus: runState, conclusion, runUrl: current?.html_url || null,
      workflowUrl, runtimeProof: false, verifiedAt,
      reason: state === 'AWAIT_RUNTIME_PROOF'
        ? 'CI_SUCCESS_NOT_RUNTIME_READBACK' : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GITHUB_READ_FAILED';
    const safeCode = /^GITHUB_(HTTP_\d{3}|MAIN_SHA_INVALID)$/.test(message)
      ? message : 'GITHUB_READ_UNAVAILABLE';
    return { state: 'SENSOR_BLOCKED', reason: safeCode, runtimeProof: false, workflowUrl, verifiedAt };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('method not allowed', { status: 405, headers: corsHeaders });
  }

  const URL_ = Deno.env.get('SUPABASE_URL')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'no_auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const user = createClient(URL_, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: u } = await user.auth.getUser();
  if (!u?.user?.id) {
    return new Response(JSON.stringify({ error: 'no_user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const body = req.method === 'POST' ? (await req.json().catch(() => ({}))) : {};
  // scope=deploy reuses hub-read, not another endpoint or access layer.
  if (body?.scope === 'deploy') {
    const deploy = await readDeployState();
    return new Response(JSON.stringify({ ok: deploy.state !== 'SENSOR_BLOCKED', deploy }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  const missionId = body.mission_id ? String(body.mission_id).slice(0, 64) : null;

  const admin = createClient(URL_, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { db: { schema: 'api' } });

  const { data: missions, error: mErr } = await admin
    .from('hub_missions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  let events: any[] = [];
  let evidence: any[] = [];
  if (missionId) {
    const { data: ev } = await admin.from('hub_mission_events').select('*').eq('mission_id', missionId).order('created_at', { ascending: true });
    const { data: ed } = await admin.from('hub_evidence').select('*').eq('mission_id', missionId).order('created_at', { ascending: true });
    events = ev || [];
    evidence = ed || [];
  }

  if (mErr) {
    return new Response(JSON.stringify({ error: mErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({
    ok: true,
    missions: missions || [],
    events,
    evidence,
    scope: missionId ? 'mission_detail' : 'mission_list',
  }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
