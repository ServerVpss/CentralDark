-- INVENTARIO CENTRAlDARK, READ ONLY, executar no Supabase SQL Editor autenticado.
-- Objetos, roles, policies, functions, publicacoes: sem ler dados de usuarios ou segredos.
SELECT n.nspname AS schema, c.relkind, c.relname AS objeto, c.relrowsecurity AS rls
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname IN ('public','api','hub') AND c.relkind IN ('r','p','v','m')
ORDER BY n.nspname,c.relkind,c.relname;
SELECT n.nspname AS schema, p.proname AS funcao, pg_get_function_identity_arguments(p.oid) AS parametros
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname IN ('public','api','hub') ORDER BY n.nspname,p.proname;
SELECT schemaname,tablename,policyname,roles,cmd,qual FROM pg_policies
WHERE schemaname IN ('public','api','hub') ORDER BY schemaname,tablename,policyname;
SELECT pubname,schemaname,tablename FROM pg_publication_tables
ORDER BY pubname,schemaname,tablename;
SELECT table_schema,table_name,grantee,privilege_type FROM information_schema.role_table_grants
WHERE table_schema IN ('public','api','hub') AND grantee IN ('anon','authenticated','service_role')
ORDER BY table_schema,table_name,grantee,privilege_type;
