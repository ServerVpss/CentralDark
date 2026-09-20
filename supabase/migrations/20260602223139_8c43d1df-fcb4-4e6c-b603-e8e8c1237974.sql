
CREATE TABLE public.menu_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  icon text NOT NULL DEFAULT '💡',
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_tips_route ON public.menu_tips(route) WHERE enabled = true;

GRANT SELECT ON public.menu_tips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_tips TO authenticated;
GRANT ALL ON public.menu_tips TO service_role;

ALTER TABLE public.menu_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública das dicas"
  ON public.menu_tips FOR SELECT
  USING (true);

CREATE POLICY "Autenticados gerenciam dicas"
  ON public.menu_tips FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE TRIGGER trg_menu_tips_updated
  BEFORE UPDATE ON public.menu_tips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.menu_tips (route, title, content, icon, sort_order) VALUES
  ('/dashboard', 'Visão geral do negócio', 'Aqui você acompanha receita, assinantes ativos, consultas do dia e a saúde dos bots em tempo real.', '📊', 1),
  ('/dashboard', 'Atalho rápido', 'Pressione Ctrl+K em qualquer página para abrir a busca global e pular direto pra qualquer tela.', '⚡', 2),
  ('/bots', 'Gerencie seus bots', 'Adicione, edite e monitore cada bot Telegram. Clique em um bot para configurar comandos, módulos e segurança.', '🤖', 1),
  ('/consultas', 'Central de consultas', 'Teste todas as APIs (CPF, placa, telefone, CNPJ...) direto pelo painel antes de liberar no bot.', '🔍', 1),
  ('/logs', 'Histórico completo', 'Filtre consultas por usuário, módulo ou período. Útil pra auditar uso e identificar abusos.', '📜', 1),
  ('/plans', 'Planos e preços', 'Crie planos com duração e valor personalizados. Planos privados custam R$3 a mais (regra interna).', '💎', 1),
  ('/pix', 'Transações PIX', 'Acompanhe pagamentos EFI, Mercado Pago e Binance em tempo real. Inclui gráfico de break-even.', '💰', 1),
  ('/settings', 'Ajustes do sistema', 'Configure limpeza automática, backups e preferências gerais do painel.', '⚙️', 1),
  ('/security', 'Proteções ativas', 'Centro de segurança: anti-flood, bloqueio de mídia, antibanca e mais. Ajustes por bot ou globais.', '🛡️', 1),
  ('/telegram-users', 'Base de usuários', 'Veja todos os usuários que já interagiram com seus bots. Filtre por assinatura ativa, banidos ou expirados.', '👥', 1),
  ('/audit', 'Auditoria de assinaturas', 'Rastreia toda extensão manual, ativação ou cancelamento de plano. Transparência total.', '📋', 1),
  ('/', 'Bem-vindo ao TelePanel', 'Sistema premium de administração para bots Telegram com consultas em tempo real.', '✨', 1);
