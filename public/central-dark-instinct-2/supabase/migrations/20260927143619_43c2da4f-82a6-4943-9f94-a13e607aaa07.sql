DO $$
DECLARE
  alvo_id uuid;
BEGIN
  SELECT id INTO alvo_id
  FROM auth.users
  WHERE lower(email) = lower('contacobra3467@gmail.com')
  LIMIT 1;

  IF alvo_id IS NULL THEN
    RAISE EXCEPTION 'Conta solicitada não existe';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (alvo_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END
$$;