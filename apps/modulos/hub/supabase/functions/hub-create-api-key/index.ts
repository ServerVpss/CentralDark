// Edge: hub-create-api-key (HUB Supabase / lyoigsqluyktoclwdaft)
// Gera prefix cdk_live_<12> + secret aleatório, retorna a chave completa UMA vez, grava só hash em api.api_keys.
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: corsHeaders });

  const URL_ = Deno.env.get('SUPABASE_URL')!;
  const SRK  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'no_auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  // Cliente com o JWT do usuário → confere admin via has_role
  const asUser = createClient(URL_, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await asUser.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return new Response(JSON.stringify({ error: 'no_user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const { data: isAdmin, error: roleErr } = await asUser.rpc('has_role', { _user_id: uid, _role: 'admin' });
  if (roleErr || !isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const body = await req.json().catch(() => ({}));
  const label = String(body.label || '').slice(0, 80).trim() || 'sem-label';
  const scopes: string[] = Array.isArray(body.scopes) ? body.scopes.map(String).slice(0, 10) : ['read'];
  const owner_email = body.owner_email ? String(body.owner_email).slice(0, 200) : null;

  // Gera secret: prefix cdk_live_ + 12 chars visíveis + 32 chars random adicionais
  const rand = new Uint8Array(24); crypto.getRandomValues(rand);
  const secret = b64url(rand);                // ~32 chars
  const prefix = 'cdk_live_' + secret.slice(0, 12);
  const full   = prefix + '.' + secret;       // formato: cdk_live_XXXXXXXXXXXX.<random>
  const hash   = await sha256hex(full);

  const admin = createClient(URL_, SRK, { db: { schema: 'api' } });
  const { data, error } = await admin.from('api_keys').insert({
    prefix, hash, label, scopes, owner_email, created_by: uid, status: 'active',
  }).select('id, prefix, label, status, scopes, created_at').single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  // Auditoria da criação (sem hash, sem secret)
  await admin.from('audit_log_api').insert({
    request_id: crypto.randomUUID(), key_prefix: prefix, path: '/hub-create-api-key', method: 'POST',
    status: 201, model: 'admin-op', error_code: null,
  }).then(() => {}, () => {});

  return new Response(JSON.stringify({
    ok: true,
    secret_show_once: full,      // ⚠️ mostrada UMA vez
    key: data,
    warning: 'GRAVE ESTA CHAVE AGORA. Não será exibida novamente.',
  }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
