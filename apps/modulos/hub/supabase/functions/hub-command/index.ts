// Edge: hub-command (HUB Supabase / lyoigsqluyktoclwdaft)
// Fluxo: autenticar -> validar admin -> registrar auditoria -> criar missão -> devolver mission_id.
// NÃO executa tarefa longa aqui. A execução fica a cargo do Hermes/VPS (fora desta função).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405, headers: corsHeaders });
  }

  const URL_ = Deno.env.get('SUPABASE_URL')!;
  const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'no_auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const asUser = createClient(URL_, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await asUser.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) {
    return new Response(JSON.stringify({ error: 'no_user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { data: isAdmin, error: roleErr } = await asUser.rpc('has_role', { _user_id: uid, _role: 'admin' });
  if (roleErr || !isAdmin) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || '').slice(0, 200).trim();
  if (!title) {
    return new Response(JSON.stringify({ error: 'title_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const admin = createClient(URL_, SRK, { db: { schema: 'api' } });
  const { data, error } = await admin.from('hub_missions').insert({
    title,
    creator: uid,
    agent: String(body.agent || 'hermes').slice(0, 40),
    target: body.target ? String(body.target).slice(0, 200) : null,
    state: 'queued',
    authorization: String(body.authorization || 'pending'),
    branch_sha: body.branch_sha ? String(body.branch_sha).slice(0, 64) : null,
    risk: String(body.risk || 'R1'),
    rollback: body.rollback ? String(body.rollback).slice(0, 500) : null,
  }).select('id, title, state, authorization, created_at').single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Auditoria (sem segredos)
  await admin.from('audit_log_api').insert({
    request_id: crypto.randomUUID(),
    key_prefix: 'hub-command',
    path: '/hub-command',
    method: 'POST',
    status: 201,
    model: 'admin-op',
    error_code: null,
  }).then(() => {}, () => {});

  return new Response(JSON.stringify({
    ok: true,
    mission_id: data.id,
    mission: data,
    note: 'Missão criada. Execução é consumida pelo Hermes/VPS fora desta função.',
  }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
