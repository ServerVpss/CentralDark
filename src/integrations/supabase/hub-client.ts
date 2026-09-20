// ⚠️ ARQUIVO INTOCÁVEL — client próprio apontando pro Supabase do HUB (lyoig).
// Não é auto-gerado pelo Lovable. NÃO editar sem coordenação.
// A URL e a anon key abaixo são PÚBLICAS por design — a segurança vem do RLS.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './hub-types';

const HUB_URL = 'https://lyoigsqluyktoclwdaft.supabase.co';
const HUB_ANON_KEY = 'sb_publishable_7V83I0wkIYoT7tpvBOh0Sg_jNk-GrX5';

export const supabase = createClient<Database>(HUB_URL, HUB_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
