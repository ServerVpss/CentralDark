-- Add typing and reactions settings to bot_settings
ALTER TABLE public.bot_settings
ADD COLUMN IF NOT EXISTS auto_delete_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_typing boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS react_to_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reaction_mode text DEFAULT 'random',
ADD COLUMN IF NOT EXISTS fixed_emoji text DEFAULT '👍',
ADD COLUMN IF NOT EXISTS custom_emojis text[] DEFAULT '{}'::text[];