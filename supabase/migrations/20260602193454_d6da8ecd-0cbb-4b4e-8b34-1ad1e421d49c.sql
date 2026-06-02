ALTER TABLE public.bot_settings
ADD COLUMN IF NOT EXISTS fake_engagement_max_per_day integer NOT NULL DEFAULT 12;