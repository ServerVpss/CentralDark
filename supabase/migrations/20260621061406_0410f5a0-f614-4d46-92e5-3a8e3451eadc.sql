-- Adiciona suporte a OAuth (GitHub/OpenAI) na tabela de chaves da Ponte MCP
ALTER TABLE public.ponte_mcp_chaves
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_user_id text,
  ADD COLUMN IF NOT EXISTS external_username text,
  ADD COLUMN IF NOT EXISTS external_avatar_url text;

-- Índice para deduplicar conexões OAuth pelo mesmo usuário externo
CREATE UNIQUE INDEX IF NOT EXISTS ponte_mcp_chaves_provider_user_uniq
  ON public.ponte_mcp_chaves (provider, external_user_id)
  WHERE external_user_id IS NOT NULL AND ativa = true;