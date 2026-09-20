-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tabela para configurações das APIs
CREATE TABLE public.api_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  port INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para histórico de consultas
CREATE TABLE public.query_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  provider_id UUID REFERENCES public.api_providers(id),
  query_type TEXT NOT NULL,
  query_input TEXT NOT NULL,
  query_result JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para logs de uso/billing
CREATE TABLE public.api_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  provider_id UUID REFERENCES public.api_providers(id),
  query_type TEXT NOT NULL,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para api_providers (leitura pública)
CREATE POLICY "Anyone can view active providers" 
ON public.api_providers 
FOR SELECT 
USING (is_active = true);

-- Políticas para query_history
CREATE POLICY "Users can view own query history" 
ON public.query_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own queries" 
ON public.query_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para api_usage_logs
CREATE POLICY "Users can view own usage" 
ON public.api_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage logs" 
ON public.api_usage_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Inserir provedores padrão
INSERT INTO public.api_providers (name, base_url, port, description) VALUES
('NexFuture', 'http://nxf-2.nexfuture.com.br', 25589, 'API Principal - CPF, CNPJ, Placa, Telefone, etc.'),
('TConect Score', 'http://node.tconect.xyz', 3029, 'Score de Crédito e Placa Completa'),
('TConect Foto', 'http://node.tconect.xyz', 3030, 'Busca de Fotos por Estado');

-- Trigger para updated_at
CREATE TRIGGER update_api_providers_updated_at
BEFORE UPDATE ON public.api_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();