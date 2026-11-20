ALTER TABLE public.payment_gateway_settings 
ADD COLUMN IF NOT EXISTS monthly_fixed_cost numeric NOT NULL DEFAULT 500;