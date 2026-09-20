-- Cofre interno da chave Abacus (nunca exposto ao front)
-- Singleton: sempre a linha id=1. Só service_role lê/escreve.
CREATE TABLE IF NOT EXISTS public.abacus_config (
  id           smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  api_key      text,
  key_hint     text,              -- últimos 4 chars, seguro pra mostrar
  updated_by   uuid,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.abacus_config TO service_role;
-- authenticated NÃO recebe grant: leitura da chave só via edge (service_role)

ALTER TABLE public.abacus_config ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy pra roles públicos = travado por padrão. service_role bypassa RLS.

INSERT INTO public.abacus_config (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;
