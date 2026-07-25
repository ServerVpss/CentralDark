
-- Blindar pending_payments e pix_transactions contra escalada de privilégio:
-- usuário não pode mais mudar status/amount/paid_at pra "pago" sem passar pelo backend.

DROP POLICY IF EXISTS "Users can update own pending payments" ON public.pending_payments;
DROP POLICY IF EXISTS "Users can update own pix transactions" ON public.pix_transactions;

-- Admins ainda podem ajustar manualmente (suporte); service_role continua com passe livre.
CREATE POLICY "Admins can update pending payments"
  ON public.pending_payments
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pix transactions"
  ON public.pix_transactions
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
