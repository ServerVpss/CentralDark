// Edge: hub-command (HUB Supabase / lyoigsqluyktoclwdaft)
// Fluxo: autenticar -> validar admin -> registrar auditoria -> criar missão -> devolver mission_id.
// NÃO executa tarefa longa aqui. A execução é consumida pelo plano de controle fora desta função.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CAPABILITY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const AUTHORIZATIONS = new Set(['pending', 'approved', 'denied']);
const RISKS = new Set(['R0', 'R1', 'R2', 'R3', 'R4']);
const MAX_INPUT_BYTES = 20_000;

function json(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: corsHeaders });

  const URL_ = Deno.env.get('SUPABASE_URL')!;
  const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return json(401, { error: 'no_auth' });

  const asUser = createClient(URL_, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await asUser.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return json(401, { error: 'no_user' });

  const { data: isAdmin, error: roleErr } = await asUser.rpc('has_role', { _user_id: uid, _role: 'admin' });
  if (roleErr || !isAdmin) return json(403, { error: 'forbidden' });

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || '').slice(0, 200).trim();
  if (!title) return json(400, { error: 'title_required' });

  const authorization = String(body.authorization || 'pending');
  if (!AUTHORIZATIONS.has(authorization)) return json(400, { error: 'authorization_invalid' });

  const risk = String(body.risk || 'R1');
  if (!RISKS.has(risk)) return json(400, { error: 'risk_invalid' });

  const capability = body.capability == null || String(body.capability).trim() === ''
    ? null
    : String(body.capability).trim();
  if (capability && !CAPABILITY_RE.test(capability)) return json(400, { error: 'capability_invalid' });

  const executionInput = body.input == null ? {} : body.input;
  if (typeof executionInput !== 'object' || Array.isArray(executionInput)) {
    return json(400, { error: 'input_must_be_object' });
  }
  const inputJson = JSON.stringify(executionInput);
  if (new TextEncoder().encode(inputJson).byteLength > MAX_INPUT_BYTES) {
    return json(413, { error: 'input_too_large', max_bytes: MAX_INPUT_BYTES });
  }

  const admin = createClient(URL_, SRK, { db: { schema: 'api' } });
  const { data, error } = await admin.from('hub_missions').insert({
    title,
    creator: uid,
    agent: String(body.agent || 'hermes').slice(0, 40),
    target: body.target ? String(body.target).slice(0, 200) : null,
    state: 'queued',
    authorization,
    branch_sha: body.branch_sha ? String(body.branch_sha).slice(0, 64) : null,
    risk,
    rollback: body.rollback ? String(body.rollback).slice(0, 500) : null,
    capability,
    input: executionInput,
  }).select('id, title, state, authorization, capability, created_at').single();

  if (error) return json(500, { error: error.message });

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

  return json(201, {
    ok: true,
    mission_id: data.id,
    mission: data,
    auto_execution_eligible: authorization === 'approved' && Boolean(capability),
    note: capability
      ? 'Missão criada com capability MCP; consumidor do plano de controle pode executar após claim.'
      : 'Missão criada sem capability; permanece observável, mas não entra no auto-executor.',
  });
});
