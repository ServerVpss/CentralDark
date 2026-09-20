
-- Tabela dos módulos exibidos no Portal público
CREATE TABLE public.modulos_portal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  icone TEXT NOT NULL,
  href TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'em processo' CHECK (status IN ('ativo','em processo')),
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.modulos_portal TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modulos_portal TO authenticated;
GRANT ALL ON public.modulos_portal TO service_role;

ALTER TABLE public.modulos_portal ENABLE ROW LEVEL SECURITY;

-- Público (visitante) só lê
CREATE POLICY "Qualquer um pode ler modulos_portal"
  ON public.modulos_portal FOR SELECT
  USING (true);

-- Só admin escreve
CREATE POLICY "Admin insere modulos_portal"
  ON public.modulos_portal FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin atualiza modulos_portal"
  ON public.modulos_portal FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin remove modulos_portal"
  ON public.modulos_portal FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER modulos_portal_set_updated_at
  BEFORE UPDATE ON public.modulos_portal
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed com os 4 módulos atuais (ícones referenciados por chave; o front resolve pro asset local)
INSERT INTO public.modulos_portal (slug, nome, icone, href, status, ordem) VALUES
  ('whatsapp',   'Bot WhatsApp', 'whatsapp',   '/whatsapp',          'em processo', 1),
  ('crm',        'CRM',          'crm',        '/crm',               'em processo', 2),
  ('telegram',   'TelePainel',   'telegram',   '/telepainel/dashboard', 'ativo',    3),
  ('financeiro', 'Financeiro',   'financeiro', '/financeiro',        'em processo', 4);
