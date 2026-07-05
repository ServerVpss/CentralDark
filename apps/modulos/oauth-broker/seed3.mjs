import 'dotenv/config';
import dot from 'dotenv'; dot.config({ path: '.env' });
import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.HUB_SUPABASE_URL, process.env.HUB_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const provs = [
  { id: 'claude', display_name: 'Claude (Anthropic)', color: '#d97706', icon: 'C',  scopes: 'messages',           auth_url: 'api-key', token_url: 'api-key', enabled: true },
  { id: 'groq',   display_name: 'Groq',               color: '#f55036', icon: 'Gq', scopes: 'chat.completions',   auth_url: 'api-key', token_url: 'api-key', enabled: true },
];
for (const p of provs) {
  const { error } = await sb.from('oauth_providers').upsert(p, { onConflict: 'id' });
  console.log(p.id, '→', error ? '❌ '+error.message : '✅');
}
