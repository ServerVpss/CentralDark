-- 🩸 HUB · Auditoria de ingestões do Grabber (rodar no HUB lyoig)
-- Registra CADA chamada da edge `lovable-ingest`: workspace, ip, quantidade coletada, snapshot dos créditos.

CREATE TABLE IF NOT EXISTS public.contas_lovable_ingest_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em   timestamptz NOT NULL DEFAULT now(),
  workspace_id text NOT NULL,
  versao      text,
  ip          text,
  user_agent  text,
  ok          boolean NOT NULL DEFAULT true,
  erro        text,
  qtd_rotas   int,           -- quantas rotas vieram no payload
  creditos_restantes numeric,
  creditos_totais    numeric,
  usado_periodo      numeric,
  diario_restante    numeric,
  payload     jsonb          -- snapshot completo (opcional; pode limpar depois)
);

CREATE INDEX IF NOT EXISTS idx_ingest_log_ws   ON public.contas_lovable_ingest_log(workspace_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_ingest_log_time ON public.contas_lovable_ingest_log(criado_em DESC);

-- GRANTs (Data API) — leitura só p/ authenticated; write só service_role (edge)
GRANT SELECT ON public.contas_lovable_ingest_log TO authenticated;
GRANT ALL    ON public.contas_lovable_ingest_log TO service_role;

ALTER TABLE public.contas_lovable_ingest_log ENABLE ROW LEVEL SECURITY;

-- Política: qualquer usuário logado do painel pode ler o histórico
DROP POLICY IF EXISTS "ingest_log_read_auth" ON public.contas_lovable_ingest_log;
CREATE POLICY "ingest_log_read_auth"
  ON public.contas_lovable_ingest_log
  FOR SELECT TO authenticated
  USING (true);

-- View de resumo por workspace (última ingestão + total no dia)
CREATE OR REPLACE VIEW public.contas_lovable_ingest_resumo AS
SELECT
  workspace_id,
  COUNT(*)                                             AS ingestoes_total,
  COUNT(*) FILTER (WHERE criado_em > now() - interval '24 hours') AS ingestoes_24h,
  MAX(criado_em)                                       AS ultima_ingestao,
  (ARRAY_AGG(creditos_restantes ORDER BY criado_em DESC))[1] AS creditos_atuais
FROM public.contas_lovable_ingest_log
GROUP BY workspace_id;

GRANT SELECT ON public.contas_lovable_ingest_resumo TO authenticated;
