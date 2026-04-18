ALTER TABLE public.payment_gateway_settings
ADD COLUMN IF NOT EXISTS operational_cost_rate numeric NOT NULL DEFAULT 0.03
CHECK (operational_cost_rate >= 0 AND operational_cost_rate <= 1);