import { useState, useEffect } from 'react';
import { hubClient as supabase } from '@/integrations/supabase/hub-client';

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
    const fetchRole = async (userId: string): Promise<UserRole> => {
      const { data: userRole, error } = await supabase
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        (async () => {
          const role = await fetchRole(session.user.id);
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