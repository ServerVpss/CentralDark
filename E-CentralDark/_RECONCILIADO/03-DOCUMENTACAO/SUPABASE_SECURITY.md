# Segurança do Supabase

- **Service Role Key:** O uso da `service_role` key deve ser estritamente no backend (Bots, Node.js workers, Edge Functions) e NUNCA no frontend ou CRM React.
- **Row Level Security (RLS):** Todas as tabelas acessíveis pelas APIs front-facing devem ter o RLS habilitado.
- As políticas de RLS devem validar o `auth.uid()` para os acessos a dados e o `tenant_id` ou `workspace_id`.
- Nenhum bucket do Storage com informações privadas (documentos, áudios e imagens de chats privados do WhatsApp) pode ser configurado como "Public". Deve usar URLs assinadas (signed URLs) ou RLS para o `storage.objects`.
- O banco de dados Postgres não pode ter a porta 5432 exposta para a internet pública (0.0.0.0/0) sem bloqueio ou acesso apenas via pgbouncer/IPv4 estrito ou Supabase pool.
