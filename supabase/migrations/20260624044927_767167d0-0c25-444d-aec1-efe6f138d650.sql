
-- 1. Tabela de roteamento de notificações
CREATE TABLE public.notification_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('info','sucesso','aviso','erro','critico','venda','pagamento','sistema')),
  bot_id uuid NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  chat_id bigint NOT NULL,
  label text,
  ativo boolean NOT NULL DEFAULT true,
  prioridade integer NOT NULL DEFAULT 100,
  is_fallback boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_routes_tipo_ativo ON public.notification_routes (tipo, ativo, prioridade);
CREATE INDEX idx_notification_routes_bot ON public.notification_routes (bot_id);

-- 2. GRANTs (obrigatório no public schema)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_routes TO authenticated;
GRANT ALL ON public.notification_routes TO service_role;

-- 3. RLS
ALTER TABLE public.notification_routes ENABLE ROW LEVEL SECURITY;

-- 4. Policies (só admin)
CREATE POLICY "Admins podem ver rotas de notificação"
  ON public.notification_routes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem criar rotas de notificação"
  ON public.notification_routes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar rotas de notificação"
  ON public.notification_routes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem apagar rotas de notificação"
  ON public.notification_routes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Trigger de updated_at
CREATE TRIGGER trg_notification_routes_updated_at
  BEFORE UPDATE ON public.notification_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
