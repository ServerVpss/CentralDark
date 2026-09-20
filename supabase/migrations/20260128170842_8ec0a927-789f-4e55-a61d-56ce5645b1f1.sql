-- Tabela para rastrear updates processados e evitar duplicatas
CREATE TABLE IF NOT EXISTS processed_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id BIGINT NOT NULL,
  bot_id UUID NOT NULL REFERENCES telegram_bots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(update_id, bot_id)
);

-- Índice para busca rápida
CREATE INDEX idx_processed_updates_lookup ON processed_updates(update_id, bot_id);

-- Habilitar RLS
ALTER TABLE processed_updates ENABLE ROW LEVEL SECURITY;

-- Policy para service role (edge functions)
CREATE POLICY "Service role can manage processed updates"
ON processed_updates
FOR ALL
USING (true)
WITH CHECK (true);

-- Função para limpar registros antigos automaticamente (mais de 1 hora)
CREATE OR REPLACE FUNCTION cleanup_old_updates()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM processed_updates WHERE created_at < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para limpeza automática
CREATE TRIGGER trigger_cleanup_updates
AFTER INSERT ON processed_updates
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_updates();