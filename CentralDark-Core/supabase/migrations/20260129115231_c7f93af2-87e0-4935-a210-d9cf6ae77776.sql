-- Add individual interval column to engagement_messages
ALTER TABLE public.engagement_messages 
ADD COLUMN interval_minutes integer DEFAULT 30;

-- Update existing records to have default interval
UPDATE public.engagement_messages 
SET interval_minutes = 30 
WHERE interval_minutes IS NULL;