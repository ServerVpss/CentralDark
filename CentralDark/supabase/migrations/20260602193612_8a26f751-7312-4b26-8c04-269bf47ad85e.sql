ALTER TABLE public.bot_settings
ADD COLUMN IF NOT EXISTS fake_engagement_sent_today integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS fake_engagement_count_date date;