// Cliente do Hub de Segurança.
// Reaproveita o client principal — as tabelas do schema `hub` são acessadas
// por views no `public` (hub_connectors, hub_policies, etc), porque o Data API
// do Lovable Cloud só expõe o schema `public`.
export { supabase as hubClient } from "./client";
