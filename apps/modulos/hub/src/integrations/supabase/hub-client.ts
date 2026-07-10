// Cliente Supabase do HUB (projeto lyoigsqluyktoclwdaft) — usado só pelo módulo HUB.
// Não substitui o cliente do TelePainel (kagejpghnwdfymddwxuf).
import { createClient } from "@supabase/supabase-js";

const HUB_URL = import.meta.env.VITE_HUB_SUPABASE_URL || "https://lyoigsqluyktoclwdaft.supabase.co";
const HUB_KEY = import.meta.env.VITE_HUB_SUPABASE_ANON_KEY
  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5b2lnc3FsdXlrdG9jbHdkYWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTUyMjIsImV4cCI6MjA3NzY5MTIyMn0.LWFDXfBz9GBAmXpi7uCTHYqjOMwzcRZk_i7EITvL1LI";

// schema "api" — PostgREST deste projeto expõe 'api' como padrão; views espelham hub.*
export const hubClient = createClient(HUB_URL, HUB_KEY, {
  db: { schema: "api" },
  auth: { persistSession: false },
});

// Cliente dedicado ao fluxo de autenticação (persistência de sessão + refresh automático).
// Compartilha o storageKey com o hubClient pra manter uma sessão única no navegador.
export const hubAuth = createClient(HUB_URL, HUB_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "cd-hub-auth",
  },
});
