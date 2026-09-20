// Edge: hub-revoke-api-key (HUB Supabase)
// Marca uma chave como revoked. Admin-only.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: corsHeaders });

  const URL_ = Deno.env.get('SUPABASE_URL')!;
  const SRK  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'no_auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const asUser = createClient(URL_, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await asUser.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return new Response(JSON.stringify({ error: 'no_user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const { data: isAdmin } = await asUser.rpc('has_role', { _user_id: uid, _role: 'admin' });
  if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return new Response(JSON.stringify({ error: 'id_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const admin = createClient(URL_, SRK, { db: { schema: 'api' } });
  const { data, error } = await admin.from('api_keys')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', id).select('id, prefix, status, revoked_at').single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  await admin.from('audit_log_api').insert({
    request_id: crypto.randomUUID(), key_prefix: data.prefix, path: '/hub-revoke-api-key', method: 'POST',
    status: 200, model: 'admin-op',
  }).then(() => {}, () => {});

  return new Response(JSON.stringify({ ok: true, key: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
