-- Create audit_logs table for tracking admin actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "Admins can read all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can only see their own logs
CREATE POLICY "Users can view their own logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can insert logs (via edge functions)
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create scheduled_broadcasts table
CREATE TABLE public.scheduled_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  message_template TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'active', 'expired', 'specific'
  target_user_ids BIGINT[],
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_scheduled_broadcasts_user_id ON public.scheduled_broadcasts(user_id);
CREATE INDEX idx_scheduled_broadcasts_status ON public.scheduled_broadcasts(status);
CREATE INDEX idx_scheduled_broadcasts_scheduled_at ON public.scheduled_broadcasts(scheduled_at);

-- Enable RLS
ALTER TABLE public.scheduled_broadcasts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own broadcasts
CREATE POLICY "Users can manage their own broadcasts"
ON public.scheduled_broadcasts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_broadcasts_updated_at
BEFORE UPDATE ON public.scheduled_broadcasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_broadcasts;