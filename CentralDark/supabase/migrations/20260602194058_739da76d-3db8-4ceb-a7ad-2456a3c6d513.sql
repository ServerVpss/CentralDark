ALTER TABLE public.engagement_messages
  ADD COLUMN IF NOT EXISTS max_per_day integer NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS sent_today integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS count_date date;