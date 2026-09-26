# Segurança Realtime (Supabase / Sockets)

- Apenas as tabelas necessárias devem estar ativas para a publicação do Supabase Realtime (ex: `supabase_realtime` publication).
- As mensagens (`messages`), conexões (`connections`), chats (`chats`) e instâncias (`instances`) devem ser protegidas por RLS.
- O Frontend (React/CRM) deve se conectar usando a `anon key` e passar o token JWT do usuário autenticado para validação das regras RLS do Realtime.
- Nunca ativar realtime para a tabela de usuários com dados de autenticação ou secrets, tampouco permitir `SELECT` irrestrito no RLS de Realtime.
- Verificar por vazamento de dados em múltiplos tenants (Workspaces): O RLS deve exigir o `workspace_id` correto via token JWT.
