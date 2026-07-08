-- ============================================================
-- HERMES COLETIVO v2 — Cérebro central multi-agente com memória viva
-- ============================================================

-- 1) Extensão para busca semântica por embedding
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 2) MEMÓRIA VETORIAL (lembranças + aprendizados + decisões)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memoria_vetorial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,               -- 'lembranca' | 'aprendizado' | 'decisao' | 'regra'
  titulo text NOT NULL,
  conteudo text NOT NULL,
  tags text[] DEFAULT '{}',
  escopo text DEFAULT 'global',     -- 'global' | 'infra' | 'ui' | 'ia' | 'deploy' | ...
  relevancia text DEFAULT 'media',  -- 'alta' | 'media' | 'baixa'
  embedding vector(1536),           -- OpenAI text-embedding-3-small
  origem text,                       -- quem criou (agent_id ou 'pivete' ou 'auto-learn')
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz             -- NULL = permanente
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.memoria_vetorial TO authenticated;
GRANT ALL ON public.memoria_vetorial TO service_role;
GRANT SELECT ON public.memoria_vetorial TO anon;

ALTER TABLE public.memoria_vetorial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura publica de memoria" ON public.memoria_vetorial FOR SELECT USING (true);
CREATE POLICY "escrita apenas service_role" ON public.memoria_vetorial FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_memoria_embedding ON public.memoria_vetorial
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_memoria_escopo ON public.memoria_vetorial (escopo);
CREATE INDEX IF NOT EXISTS idx_memoria_tipo ON public.memoria_vetorial (tipo);

-- Função de busca semântica top-N
CREATE OR REPLACE FUNCTION public.buscar_memoria_similar(
  p_embedding vector(1536),
  p_escopos text[] DEFAULT ARRAY['global'],
  p_limite int DEFAULT 8,
  p_similaridade_minima float DEFAULT 0.5
) RETURNS TABLE (
  id uuid, tipo text, titulo text, conteudo text, tags text[],
  escopo text, similaridade float
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    m.id, m.tipo, m.titulo, m.conteudo, m.tags, m.escopo,
    1 - (m.embedding <=> p_embedding) AS similaridade
  FROM public.memoria_vetorial m
  WHERE m.embedding IS NOT NULL
    AND (m.expires_at IS NULL OR m.expires_at > now())
    AND (m.escopo = ANY(p_escopos) OR 'global' = ANY(p_escopos))
    AND 1 - (m.embedding <=> p_embedding) >= p_similaridade_minima
  ORDER BY m.embedding <=> p_embedding
  LIMIT p_limite;
$$;

-- ============================================================
-- 3) AGENTES (configuração por agente/personalidade)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  emoji text DEFAULT '🤖',
  modelos_debate text[] NOT NULL DEFAULT ARRAY['openai/gpt-5','google/gemini-2.5-pro','google/gemini-3-flash-preview'],
  modelo_juiz text NOT NULL DEFAULT 'openai/gpt-5',
  escopos_memoria text[] NOT NULL DEFAULT ARRAY['global'],
  tom text DEFAULT 'direto e técnico',
  temperature float DEFAULT 0.7,
  ativo boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_configs TO authenticated;
GRANT ALL ON public.agent_configs TO service_role;
GRANT SELECT ON public.agent_configs TO anon;

ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura publica de agentes" ON public.agent_configs FOR SELECT USING (true);
CREATE POLICY "escrita apenas service_role" ON public.agent_configs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_agent_configs_updated
  BEFORE UPDATE ON public.agent_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Agentes iniciais
INSERT INTO public.agent_configs (agent_id, nome, descricao, emoji, escopos_memoria, tom) VALUES
  ('hermes', 'Hermes Orquestrador', 'Cérebro coletivo padrão. Debate multi-modelo com memória global.', '🧠', ARRAY['global'], 'direto, executor, sem enrolação'),
  ('darkai', 'DarkAI Debatedor', 'Debate profundo, questiona premissas.', '🌑', ARRAY['global','ia'], 'analítico e provocador'),
  ('executor', 'Executor', 'Foco em ação. Respostas curtas, comandos prontos.', '⚡', ARRAY['infra','deploy'], 'direto, comando pronto pra colar'),
  ('critic', 'Critic', 'Encontra falhas antes de executar. Chato de propósito.', '🔍', ARRAY['global','ia'], 'crítico, questiona tudo'),
  ('deploy_watcher', 'Deploy Watcher', 'Especialista em infra, PM2, edge functions.', '🛠️', ARRAY['infra','deploy'], 'técnico, focado em evidência')
ON CONFLICT (agent_id) DO NOTHING;

-- ============================================================
-- 4) MISSÕES (cada pergunta / tarefa executada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.missoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  prompt text NOT NULL,
  resposta_final text,
  status text NOT NULL DEFAULT 'pendente', -- 'pendente' | 'debatendo' | 'concluida' | 'falhou'
  memorias_usadas uuid[] DEFAULT '{}',
  modelos_usados text[] DEFAULT '{}',
  tokens_total int DEFAULT 0,
  duracao_ms int,
  outcome text,                             -- 'sucesso' | 'falha' | NULL (aguardando feedback)
  outcome_nota text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  concluida_em timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.missoes TO authenticated;
GRANT ALL ON public.missoes TO service_role;
GRANT SELECT ON public.missoes TO anon;

ALTER TABLE public.missoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura publica de missoes" ON public.missoes FOR SELECT USING (true);
CREATE POLICY "escrita apenas service_role" ON public.missoes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_missoes_agent ON public.missoes (agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_missoes_status ON public.missoes (status);

-- ============================================================
-- 5) DEBATES (rodadas do conselho de modelos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  missao_id uuid NOT NULL REFERENCES public.missoes(id) ON DELETE CASCADE,
  rodada int NOT NULL,                     -- 1 = paralelo | 2 = crítica cruzada | 3 = juiz
  modelo text NOT NULL,
  resposta text NOT NULL,
  tokens int DEFAULT 0,
  duracao_ms int,
  papel text,                              -- 'debatedor' | 'critico' | 'juiz'
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debates TO authenticated;
GRANT ALL ON public.debates TO service_role;
GRANT SELECT ON public.debates TO anon;

ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura publica de debates" ON public.debates FOR SELECT USING (true);
CREATE POLICY "escrita apenas service_role" ON public.debates FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_debates_missao ON public.debates (missao_id, rodada);

-- ============================================================
-- 6) REPUTAÇÃO DE MODELOS (auto-calibração)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.model_scores (
  modelo text PRIMARY KEY,
  score float NOT NULL DEFAULT 1.0,        -- peso multiplicador no juiz (0.1 a 2.0)
  acertos int DEFAULT 0,
  erros int DEFAULT 0,
  total_missoes int DEFAULT 0,
  ultima_avaliacao timestamptz DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.model_scores TO authenticated;
GRANT ALL ON public.model_scores TO service_role;
GRANT SELECT ON public.model_scores TO anon;

ALTER TABLE public.model_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura publica de scores" ON public.model_scores FOR SELECT USING (true);
CREATE POLICY "escrita apenas service_role" ON public.model_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_model_scores_updated
  BEFORE UPDATE ON public.model_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed dos modelos padrão
INSERT INTO public.model_scores (modelo, score) VALUES
  ('openai/gpt-5', 1.0),
  ('openai/gpt-5-mini', 0.9),
  ('google/gemini-2.5-pro', 1.0),
  ('google/gemini-2.5-flash', 0.85),
  ('google/gemini-3-flash-preview', 0.95),
  ('google/gemini-3.1-pro-preview', 1.05)
ON CONFLICT (modelo) DO NOTHING;
