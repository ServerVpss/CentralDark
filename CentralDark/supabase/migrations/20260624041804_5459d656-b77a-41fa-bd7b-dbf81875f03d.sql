-- 1) Garantir GRANTs (admin lê via app; edge functions escrevem via service_role)
GRANT SELECT ON public.notifications_log TO authenticated;
GRANT ALL ON public.notifications_log TO service_role;

-- 2) Permitir UPDATE/INSERT/DELETE só via service_role (edge functions). Frontend nunca escreve direto.
-- (Não cria policy para INSERT — service_role bypassa RLS, então não precisa.)

-- 3) Índices para performance do painel (filtros por origem/tipo/data)
CREATE INDEX IF NOT EXISTS idx_notifications_log_created_desc ON public.notifications_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_log_origem ON public.notifications_log (origem);
CREATE INDEX IF NOT EXISTS idx_notifications_log_tipo ON public.notifications_log (tipo);
CREATE INDEX IF NOT EXISTS idx_notifications_log_dedupe ON public.notifications_log (dedupe_hash, created_at DESC);

-- 4) Realtime: precisa REPLICA IDENTITY FULL + estar na publicação supabase_realtime
ALTER TABLE public.notifications_log REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications_log;