-- Adicionar campos de engajamento fake na tabela bot_settings
ALTER TABLE public.bot_settings 
ADD COLUMN IF NOT EXISTS fake_engagement_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fake_engagement_interval_minutes integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS fake_engagement_names text[] DEFAULT ARRAY[
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Lucas Souza',
  'Juliana Lima', 'Rafael Pereira', 'Camila Rodrigues', 'Bruno Almeida', 'Fernanda Martins',
  'Gabriel Ferreira', 'Larissa Gomes', 'Thiago Ribeiro', 'Beatriz Carvalho', 'Matheus Nascimento',
  'Amanda Barbosa', 'Felipe Araújo', 'Letícia Dias', 'Gustavo Moreira', 'Carolina Nunes'
],
ADD COLUMN IF NOT EXISTS fake_engagement_last_sent timestamp with time zone;