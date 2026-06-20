
CREATE TABLE public.ponte_mcp_chaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_agente text NOT NULL,
  chave_hash text NOT NULL UNIQUE,
  prefixo text NOT NULL,
  ativa boolean NOT NULL DEFAULT true,
  total_chamadas bigint NOT NULL DEFAULT 0,
  ultimo_uso_em timestamptz,
  criada_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criada_em timestamptz NOT NULL DEFAULT now(),
  observacao text
);

CREATE INDEX idx_ponte_mcp_chaves_hash ON public.ponte_mcp_chaves(chave_hash) WHERE ativa = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ponte_mcp_chaves TO authenticated;
GRANT ALL ON public.ponte_mcp_chaves TO service_role;

ALTER TABLE public.ponte_mcp_chaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam chaves da ponte MCP"
  ON public.ponte_mcp_chaves FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
