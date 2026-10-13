-- Canonical read-only projection for authenticated bot owner or CentralDark admin.
-- NEVER grant broad SELECT on public.telegram_bots: it also stores private bot credentials.
CREATE OR REPLACE FUNCTION public.centraldark_telegram_bots_resumo()
RETURNS TABLE(
  id uuid,
  name text,
  bot_username text,
  is_active boolean,
  health_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT b.id, b.name, b.bot_username, coalesce(b.is_active, false), b.health_status
  FROM public.telegram_bots AS b
  WHERE auth.uid() IS NOT NULL
    AND (
      b.user_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  ORDER BY b.created_at DESC
$$;
REVOKE ALL ON FUNCTION public.centraldark_telegram_bots_resumo() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.centraldark_telegram_bots_resumo() FROM anon;
GRANT EXECUTE ON FUNCTION public.centraldark_telegram_bots_resumo() TO authenticated;
