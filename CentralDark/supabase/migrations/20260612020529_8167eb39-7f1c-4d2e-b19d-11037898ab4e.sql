
-- =========================================================
-- Tabela: vps_deploy_history
-- =========================================================
CREATE TABLE public.vps_deploy_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_hash text,
  environment text NOT NULL DEFAULT 'web',
  status text NOT NULL DEFAULT 'running', -- running | success | error
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  workflow_run_id text,
  log_summary text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vps_deploy_history TO authenticated;
GRANT ALL ON public.vps_deploy_history TO service_role;

ALTER TABLE public.vps_deploy_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem deploys"
  ON public.vps_deploy_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins inserem deploys"
  ON public.vps_deploy_history FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam deploys"
  ON public.vps_deploy_history FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins removem deploys"
  ON public.vps_deploy_history FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_vps_deploy_history_updated_at
  BEFORE UPDATE ON public.vps_deploy_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_vps_deploy_history_started_at ON public.vps_deploy_history (started_at DESC);

-- =========================================================
-- Tabela: project_roadmap
-- =========================================================
CREATE TABLE public.project_roadmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pendente', -- pendente | em_andamento | concluido
  priority integer NOT NULL DEFAULT 3, -- 1 alta, 2 media, 3 baixa
  auto_generated boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_roadmap TO authenticated;
GRANT ALL ON public.project_roadmap TO service_role;

ALTER TABLE public.project_roadmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem roadmap"
  ON public.project_roadmap FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins inserem roadmap"
  ON public.project_roadmap FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam roadmap"
  ON public.project_roadmap FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins removem roadmap"
  ON public.project_roadmap FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_project_roadmap_updated_at
  BEFORE UPDATE ON public.project_roadmap
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_project_roadmap_status ON public.project_roadmap (status, priority);
