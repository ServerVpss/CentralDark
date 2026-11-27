-- Add group_title column to bot_settings
ALTER TABLE public.bot_settings 
ADD COLUMN IF NOT EXISTS group_title TEXT;