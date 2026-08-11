// Edge: hub-command (HUB Supabase / lyoigsqluyktoclwdaft)
// Fluxo: autenticar -> validar admin -> registrar auditoria -> criar missão -> devolver mission_id.
// NÃO executa tarefa longa aqui. A execução é consumida pelo plano de controle fora desta função.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CAPABILITY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const WRITER_SCOPE_RE = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$/;
const SHA_RE = /^[0-9a-f]{40}$/i;
const AUTHORIZATIONS = new Set(['pending', 'approved', 'denied']);
const RISKS = new Set(['R0', 'R1', 'R2', 'R3', 'R4']);
const MAX_INPUT_BYTES = 20_000;
const SENSITIVE_KEY_RE = /(token|secret|password|passwd|authorization|cookie|session|api[_-]?key|private[_-]?key|service[_-]?role)/i;
const SENSITIVE_VALUE_RE = /(?:Bearer\s+\S{12,}|gh[pousr]_[A-Za-z0-9]{20,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i;

function json(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function containsSensitiveMaterial(value: unknown, depth = 0): boolean {
  if (depth > 8) return true;
  if (typeof value === 'string') return SENSITIVE_VALUE_RE.test(value);
  if (Array.isArray(value)) return value.some((item) => containsSensitiveMaterial(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([key, item]) =>
      SENSITIVE_KEY_RE.test(key) || containsSensitiveMaterial(item, depth + 1)
    );
  }
  return false;
}

function derivedWriterScope(capability: string | null): string | null {
  if (!capability) return null;
  const scope = `capability:${capability.toLowerCase()}`;
  return WRITER_SCOPE_RE.test(scope) ? scope : null;
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
  if (authorization === 'approved') return json(403, { error: 'approval_requires_independent_gate' });

  const risk = String(body.risk || 'R1');
  if (!RISKS.has(risk)) return json(400, { error: 'risk_invalid' });

  const capability = body.capability == null || String(body.capability).trim() === ''
    ? null
    : String(body.capability).trim();
  if (capability && !CAPABILITY_RE.test(capability)) return json(400, { error: 'capability_invalid' });

  const writerScope = derivedWriterScope(capability);
  if (capability && !writerScope) return json(400, { error: 'writer_scope_derivation_failed' });
  if (body.writer_scope != null && String(body.writer_scope).trim() !== writerScope) {
    return json(400, { error: 'writer_scope_is_server_derived', expected: writerScope });
  }

  const branchSha = body.branch_sha == null || String(body.branch_sha).trim() === ''
    ? null
    : String(body.branch_sha).trim();
  if (branchSha && !SHA_RE.test(branchSha)) return json(400, { error: 'branch_sha_invalid' });
  if (capability && !branchSha) return json(400, { error: 'branch_sha_required_for_execution' });

  const executionInput = body.input == null ? {} : body.input;
  if (typeof executionInput !== 'object' || Array.isArray(executionInput)) {
    return json(400, { error: 'input_must_be_object' });
  }
  if (containsSensitiveMaterial(executionInput)) {
    return json(400, { error: 'input_contains_sensitive_material' });
  }
  const inputJson = JSON.stringify(executionInput);
  if (new TextEncoder().encode(inputJson).byteLength > MAX_INPUT_BYTES) {
    return json(413, { error: 'input_too_large', max_bytes: MAX_INPUT_BYTES });
  }

  // `input` é deliberadamente omitido da view api.hub_missions; a escrita
  // privilegiada precisa atingir a tabela interna public.hub_missions.
  const adminPublic = createClient(URL_, SRK);
  const adminApi = createClient(URL_, SRK, { db: { schema: 'api' } });
  const { data, error } = await adminPublic.from('hub_missions').insert({
    title,
    creator: uid,
    agent: String(body.agent || 'hermes').slice(0, 40),
    target: body.target ? String(body.target).slice(0, 200) : null,
    state: 'queued',
    authorization,
    branch_sha: branchSha,
    risk,
    rollback: body.rollback ? String(body.rollback).slice(0, 500) : null,
    capability,
    writer_scope: writerScope,
    input: executionInput,
  }).select('id, title, state, authorization, capability, writer_scope, branch_sha, created_at').single();

  if (error) return json(500, { error: error.message });

  // Auditoria (sem segredos)
  await adminApi.from('audit_log_api').insert({
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
    auto_execution_eligible: false,
    note: capability
      ? 'Missão criada pendente; writer_scope é derivado no servidor e aprovação exige gate independente.'
      : 'Missão criada sem capability; permanece observável, mas não entra no auto-executor.',
  });
});