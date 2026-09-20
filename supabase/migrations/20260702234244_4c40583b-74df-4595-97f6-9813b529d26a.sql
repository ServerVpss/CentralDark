DROP POLICY IF EXISTS "Service role full access" ON public.paginated_results;

CREATE POLICY "Service role full access"
ON public.paginated_results
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.paginated_results FROM anon, authenticated;
GRANT ALL ON public.paginated_results TO service_role;