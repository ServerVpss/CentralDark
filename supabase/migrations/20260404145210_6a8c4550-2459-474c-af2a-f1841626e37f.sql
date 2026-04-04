ALTER TABLE public.bot_settings 
ADD COLUMN maintenance_mode boolean DEFAULT false;

ALTER TABLE public.bot_settings 
ADD COLUMN maintenance_message text DEFAULT '🔧 Bot em manutenção. Retornaremos em breve.';