
INSERT INTO public.agent_events (agent, area, acao, alvo, status, metadata) VALUES
  ('Lovable', 'Cloud', 'criou tabela agent_events com Realtime + RLS', 'public.agent_events', 'sucesso', '{"fase":"1/3"}'::jsonb),
  ('Lovable', 'Cloud', 'deployou edge function agent-log', '/functions/v1/agent-log', 'sucesso', '{"fase":"2/3"}'::jsonb),
  ('Lovable', 'TelePanel', 'criou página Consciência Viva estilo Jarvis', '/telepainel/consciencia', 'sucesso', '{"fase":"3/3"}'::jsonb),
  ('Lovable', 'Cognitivo', 'registrou 5 pendências antigas no MCP (algumas com token 401)', 'docs/PENDENCIAS.md', 'aviso', '{"detalhe":"GitHub token do MCP expirou — precisa refresh"}'::jsonb),
  ('Sistema', 'Cognitivo', 'Consciência Viva pronta para receber eventos de qualquer agente (VPS, MCP, bots)', NULL, 'info', '{}'::jsonb);
