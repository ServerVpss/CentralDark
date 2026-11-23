ALTER TABLE public.bot_settings
ADD COLUMN IF NOT EXISTS webapp_url text;

COMMENT ON COLUMN public.bot_settings.webapp_url IS 'URL pública do Mini App, preenchida automaticamente pelo painel com window.location.origin';