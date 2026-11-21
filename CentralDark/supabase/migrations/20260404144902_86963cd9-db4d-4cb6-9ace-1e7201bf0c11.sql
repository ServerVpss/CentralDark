
-- Tabela de módulos de consulta
CREATE TABLE public.query_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text UNIQUE NOT NULL,
  label text NOT NULL,
  icon text DEFAULT '📋',
  category text DEFAULT 'outros',
  enabled boolean DEFAULT true,
  provider text DEFAULT 'VeiculosAPI',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.query_modules ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler (edge functions precisam)
CREATE POLICY "Anyone can view query modules"
ON public.query_modules FOR SELECT
TO public
USING (true);

-- Apenas authenticated pode editar
CREATE POLICY "Authenticated users can update modules"
ON public.query_modules FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Apenas authenticated pode inserir
CREATE POLICY "Authenticated users can insert modules"
ON public.query_modules FOR INSERT
TO authenticated
WITH CHECK (true);

-- Apenas authenticated pode deletar
CREATE POLICY "Authenticated users can delete modules"
ON public.query_modules FOR DELETE
TO authenticated
USING (true);

-- Trigger updated_at
CREATE TRIGGER update_query_modules_updated_at
BEFORE UPDATE ON public.query_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed: todos os módulos habilitados
INSERT INTO public.query_modules (module_key, label, icon, category, enabled, provider) VALUES
  ('cpf', 'CPF', '👤', 'pessoa', true, 'VeiculosAPI'),
  ('nome', 'Nome', '📝', 'pessoa', true, 'VeiculosAPI'),
  ('foto', 'Foto', '📸', 'pessoa', true, 'VeiculosAPI'),
  ('nacional', 'Foto Nacional', '🇧🇷', 'pessoa', true, 'VeiculosAPI'),
  ('parentes', 'Parentes', '👨‍👩‍👧‍👦', 'pessoa', true, 'VeiculosAPI'),
  ('mae', 'Nome da Mãe', '👩', 'pessoa', true, 'VeiculosAPI'),
  ('rg', 'RG', '🪪', 'documento', true, 'VeiculosAPI'),
  ('cnh', 'CNH', '🪪', 'documento', true, 'VeiculosAPI'),
  ('titulo', 'Título Eleitor', '📜', 'documento', true, 'VeiculosAPI'),
  ('pis', 'PIS', '📋', 'documento', true, 'VeiculosAPI'),
  ('telefone', 'Telefone', '📞', 'contato', true, 'VeiculosAPI'),
  ('email', 'Email', '📧', 'contato', true, 'VeiculosAPI'),
  ('cep', 'CEP', '📍', 'contato', true, 'VeiculosAPI'),
  ('endereco', 'Endereço', '🏠', 'contato', true, 'VeiculosAPI'),
  ('pix', 'PIX', '💳', 'financeiro', true, 'VeiculosAPI'),
  ('score', 'Score', '📊', 'financeiro', true, 'VeiculosAPI'),
  ('renda', 'Renda', '💰', 'financeiro', true, 'VeiculosAPI'),
  ('credilink', 'Credilink', '📊', 'financeiro', true, 'VeiculosAPI'),
  ('cpf_spc', 'SPC', '📋', 'financeiro', true, 'VeiculosAPI'),
  ('poderaquisitivo', 'Poder Aquisitivo', '💎', 'financeiro', true, 'VeiculosAPI'),
  ('placa', 'Placa', '🚗', 'veiculo', true, 'VeiculosAPI'),
  ('placa_completa', 'Placa Completa', '🚗', 'veiculo', true, 'VeiculosAPI'),
  ('chassi', 'Chassi', '🔧', 'veiculo', true, 'VeiculosAPI'),
  ('renavam', 'RENAVAM', '📋', 'veiculo', true, 'VeiculosAPI'),
  ('motor', 'Motor', '⚙️', 'veiculo', true, 'VeiculosAPI'),
  ('cnpj', 'CNPJ', '🏢', 'empresa', true, 'VeiculosAPI'),
  ('processos', 'Processos', '⚖️', 'justica', true, 'VeiculosAPI'),
  ('bnmp', 'BNMP', '🔍', 'justica', true, 'VeiculosAPI'),
  ('siel', 'SIEL', '🔎', 'justica', true, 'VeiculosAPI'),
  ('tse', 'TSE', '🗳️', 'governo', true, 'VeiculosAPI'),
  ('cpfsus', 'SUS', '🏥', 'governo', true, 'VeiculosAPI'),
  ('placa_sesp', 'Placa SESP', '🚔', 'veiculo', true, 'VeiculosAPI'),
  ('cepfull', 'CEP Completo', '📍', 'contato', true, 'VeiculosAPI'),
  ('telefonefull', 'Telefone Completo', '📞', 'contato', true, 'VeiculosAPI'),
  ('nomefull', 'Nome Completo', '📝', 'pessoa', true, 'VeiculosAPI');
