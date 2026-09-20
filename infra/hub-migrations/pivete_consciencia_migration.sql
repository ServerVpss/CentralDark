-- ==========================================================================
-- Migration HUB Supabase (lyoigsqluyktoclwdaft) — pivete_consciencia
-- ==========================================================================
-- Roda SÓ no HUB, não no Lovable atual (trava firme de memoria).
-- Aplicar via psql:
--   psql "$HUB_SUPABASE_DB_URL" -f pivete_consciencia_migration.sql
-- ==========================================================================

CREATE SCHEMA IF NOT EXISTS hub;

CREATE TABLE IF NOT EXISTS hub.pivete_consciencia (
  nome            text        PRIMARY KEY,
  conteudo        text        NOT NULL,
  hash            text        NOT NULL,
  origem          text        NOT NULL CHECK (origem IN ('lovable', 'webui', 'vps', 'manual')),
  atualizado_em   timestamptz NOT NULL DEFAULT now(),
  atualizado_por  text        DEFAULT 'sync-bot',
  bytes           integer     GENERATED ALWAYS AS (octet_length(conteudo)) STORED
);

CREATE INDEX IF NOT EXISTS idx_pivete_consciencia_atualizado_em
  ON hub.pivete_consciencia (atualizado_em DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON hub.pivete_consciencia TO authenticated;
GRANT ALL ON hub.pivete_consciencia TO service_role;

ALTER TABLE hub.pivete_consciencia ENABLE ROW LEVEL SECURITY;

-- Só service_role escreve; leitura liberada pra authenticated (leitura da consciencia)
DROP POLICY IF EXISTS pivete_read_all ON hub.pivete_consciencia;
CREATE POLICY pivete_read_all
  ON hub.pivete_consciencia
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS pivete_write_service ON hub.pivete_consciencia;
CREATE POLICY pivete_write_service
  ON hub.pivete_consciencia
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================================================
-- Tabela de log de sincronia
-- ==========================================================================
CREATE TABLE IF NOT EXISTS hub.pivete_sync_log (
  id            bigserial   PRIMARY KEY,
  rodada_em     timestamptz NOT NULL DEFAULT now(),
  direcao       text        NOT NULL CHECK (direcao IN ('vps->hub', 'hub->vps', 'noop')),
  arquivo       text        NOT NULL,
  origem_hash   text,
  destino_hash  text,
  status        text        NOT NULL DEFAULT 'ok',
  detalhe       text
);

CREATE INDEX IF NOT EXISTS idx_pivete_sync_log_rodada
  ON hub.pivete_sync_log (rodada_em DESC);

GRANT SELECT ON hub.pivete_sync_log TO authenticated;
GRANT ALL ON hub.pivete_sync_log TO service_role;

ALTER TABLE hub.pivete_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pivete_sync_log_read ON hub.pivete_sync_log;
CREATE POLICY pivete_sync_log_read
  ON hub.pivete_sync_log
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS pivete_sync_log_write ON hub.pivete_sync_log;
CREATE POLICY pivete_sync_log_write
  ON hub.pivete_sync_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);
