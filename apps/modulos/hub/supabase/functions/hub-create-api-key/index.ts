// Edge: hub-create-api-key (HUB Supabase / lyoigsqluyktoclwdaft)
// GET lista keys (sem segredo); POST gera prefix cdk_live_<12> + secret e grava só hash em api.api_keys.
// Autorização: apenas admin (public.has_role(auth.uid(), 'admin')). Verificado via RPC no schema public.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

function b64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256hex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!['GET', 'POST'].includes(req.method)) return json({ error: 'method_not_allowed' }, 405);

  const URL_ = Deno.env.get('SUPABASE_URL')!;
  const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'no_auth' }, 401);

  const asUser = createClient(URL_, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await asUser.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return json({ error: 'no_user' }, 401);

  const { data: isAdmin, error: roleErr } = await asUser.rpc('has_role', {
    _user_id: uid,
    _role: 'admin',
  });
  if (roleErr || !isAdmin) return json({ error: 'forbidden' }, 403);

  const admin = createClient(URL_, SRK, { db: { schema: 'api' } });

  if (req.method === 'GET') {
    const { data, error } = await admin
      .from('api_keys')
      .select('id, prefix, label, status, scopes, owner_email, created_at, revoked_at')
      .order('created_at', { ascending: false });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, keys: data || [] });
  }

  const body = await req.json().catch(() => ({}));
  const label = String(body.label || '').slice(0, 80).trim() || 'sem-label';
  const scopes: string[] = Array.isArray(body.scopes) ? body.scopes.map(String).slice(0, 10) : ['read'];
  const owner_email = body.owner_email ? String(body.owner_email).slice(0, 200) : null;

  const rand = new Uint8Array(24);
  crypto.getRandomValues(rand);
  const secret = b64url(rand);
  const prefix = 'cdk_live_' + secret.slice(0, 12);
  const full = prefix + '.' + secret;
  const hash = await sha256hex(full);

  const { data, error } = await admin
    .from('api_keys')
    .insert({ prefix, hash, label, scopes, owner_email, created_by: uid, status: 'active' })
    .select('id, prefix, label, status, scopes, created_at')
    .single();
  if (error) return json({ error: error.message }, 500);

  await admin
    .from('audit_log_api')
    .insert({
      request_id: crypto.randomUUID(),
      key_prefix: prefix,
      path: '/hub-create-api-key',
      method: 'POST',
      status: 201,
      model: 'admin-op',
      error_code: null,
    })
    .then(() => {}, () => {});

  return json(
    {
      ok: true,
      secret_show_once: full,
      key: data,
      warning: 'GRAVE ESTA CHAVE AGORA. Não será exibida novamente.',
    },
    201,
  );
});
