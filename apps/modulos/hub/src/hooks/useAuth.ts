import { useState, useEffect } from 'react';
// hubAuth: client com persistSession: true — é o único que realmente guarda/hidrata
// a sessão de login (LoginPage.tsx e ApiKeysManager.tsx usam hubAuth pro mesmo motivo).
// hubClient: schema 'api' (onde api.user_roles + RLS "own_read" vivem), persistSession: false.
// Bug raiz do "Acesso Restrito" mesmo sendo admin: este hook usava hubClient tanto pra
// ler sessão quanto pra consultar user_roles — mas hubClient nunca hidrata sessão do
// storage (persistSession: false), então getSession() sempre voltava null e a query de
// role saía sem JWT (RLS/grant bloqueava). Fix: pegar a sessão real do hubAuth e replicar
// no hubClient via setSession() antes de consultar, mantendo o schema 'api' correto.
import { hubClient, hubAuth } from '@/integrations/supabase/hub-client';

export type UserRole = 'admin' | 'operator' | 'viewer';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async (userId: string, session: NonNullable<Awaited<ReturnType<typeof hubAuth.auth.getSession>>['data']['session']>): Promise<UserRole> => {
      // Replica a sessão real (hubAuth) no hubClient antes de consultar — sem isso, hubClient
      // envia a query sem JWT (persistSession: false) e RLS/grant bloqueia mesmo sendo admin.
      await hubClient.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      const { data: userRole, error } = await hubClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        // PGRST116 = nenhuma linha encontrada (usuário novo, sem role atribuída ainda) — 'viewer' é esperado.
        // Qualquer outro erro (tabela/coluna inexistente, RLS bloqueando, etc.) merece log pra debug.
        if (error.code !== 'PGRST116') {
          console.error('[useAuth] Falha ao buscar role em user_roles:', error);
        }
        return 'viewer';
      }

      return (userRole?.role as UserRole) || 'viewer';
    };

    const getSession = async () => {
      const { data: { session } } = await hubAuth.auth.getSession();
      if (session?.user) {
        const role = await fetchRole(session.user.id, session);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = hubAuth.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        (async () => {
          const role = await fetchRole(session.user.id, session);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role,
          });
          setLoading(false);
        })();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.role === 'admin';

  return { user, loading, isAdmin };
}