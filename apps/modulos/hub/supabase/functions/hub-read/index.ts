// Edge: hub-read (HUB Supabase / lyoigsqluyktoclwdaft)
// Somente leitura agregada: missões, eventos e evidências.
// Autorização: qualquer usuário autenticado (JWT válido).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

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
