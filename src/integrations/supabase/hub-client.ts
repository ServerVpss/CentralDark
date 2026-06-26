// Hub Supabase Client — aponta para lyoigsqluyktoclwdaft (multizap)
// Separado do client principal da Lovable (kagejpghnwdfymddwxuf)
import { createClient } from '@supabase/supabase-js';

const HUB_URL = import.meta.env.VITE_HUB_SUPABASE_URL as string;
const HUB_KEY = import.meta.env.VITE_HUB_SUPABASE_ANON_KEY as string;

if (!HUB_URL || !HUB_KEY) {
  console.warn('[HubClient] VITE_HUB_SUPABASE_URL ou VITE_HUB_SUPABASE_ANON_KEY não definidos.');
}

export const hubClient = createClient(
  HUB_URL ?? 'https://lyoigsqluyktoclwdaft.supabase.co',
  HUB_KEY ?? '',
  {
    db: { schema: 'hub' },
    auth: { persistSession: false },
  }
);
