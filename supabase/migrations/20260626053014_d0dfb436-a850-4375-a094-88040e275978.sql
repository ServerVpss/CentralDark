
CREATE TABLE public.vault_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'generic',
  description text,
  ciphertext text NOT NULL,
  iv text NOT NULL,
  auth_tag text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_secrets TO authenticated;
GRANT ALL ON public.vault_secrets TO service_role;

ALTER TABLE public.vault_secrets ENABLE ROW LEVEL SECURITY;

-- Apenas admin pode listar metadados (nunca expõe ciphertext útil sem a chave-mestra)
CREATE POLICY "Admins podem ver metadados do cofre"
  ON public.vault_secrets FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir no cofre"
  ON public.vault_secrets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar o cofre"
  ON public.vault_secrets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar do cofre"
  ON public.vault_secrets FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER vault_secrets_updated_at
  BEFORE UPDATE ON public.vault_secrets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_vault_secrets_kind ON public.vault_secrets(kind);
