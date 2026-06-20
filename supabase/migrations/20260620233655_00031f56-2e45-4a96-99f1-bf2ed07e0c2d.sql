create table public.ponte_mcp_chaves (
  id uuid primary key default gen_random_uuid(),
  nome_agente text not null,
  hash_chave text not null unique,
  prefixo text not null,
  ativa boolean not null default true,
  usos integer not null default 0,
  ultimo_uso_at timestamptz,
  criada_em timestamptz not null default now(),
  revogada_em timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ponte_mcp_chaves TO authenticated;
GRANT ALL ON public.ponte_mcp_chaves TO service_role;

ALTER TABLE public.ponte_mcp_chaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar chaves"
ON public.ponte_mcp_chaves
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
