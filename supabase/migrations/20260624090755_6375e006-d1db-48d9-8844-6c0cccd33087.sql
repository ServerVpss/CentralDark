CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_key TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    severity_default TEXT NOT NULL CHECK (severity_default IN ('info','sucesso','aviso','erro','critico')),
    title_template TEXT,
    body_template TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.notification_events TO authenticated, anon;
GRANT ALL ON public.notification_events TO service_role;

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_authenticated" ON public.notification_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_all_service_role" ON public.notification_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER tr_notification_events_updated_at
    BEFORE UPDATE ON public.notification_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.notifications_log
    ADD COLUMN IF NOT EXISTS event_key TEXT,
    ADD COLUMN IF NOT EXISTS link TEXT,
    ADD COLUMN IF NOT EXISTS group_key TEXT,
    ADD COLUMN IF NOT EXISTS group_count INT NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_notifications_log_event_key_created_at
    ON public.notifications_log (event_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_log_group_key_created_at
    ON public.notifications_log (group_key, created_at DESC);