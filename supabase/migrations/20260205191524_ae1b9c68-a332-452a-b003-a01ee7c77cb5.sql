-- Add group_photo_url column to bot_settings
ALTER TABLE public.bot_settings 
ADD COLUMN IF NOT EXISTS group_photo_url TEXT;