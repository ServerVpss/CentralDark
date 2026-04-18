CREATE POLICY "Admins can view all query history"
ON public.query_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));