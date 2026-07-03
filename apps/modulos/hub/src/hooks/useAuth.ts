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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Busca role customizada se houver tabela de perfis, caso contrário assume viewer
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: (profile?.role as UserRole) || 'viewer',
        });
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: 'viewer', // Refresh trigger usualmente exigiria re-fetch de profile
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.role === 'admin';

  return { user, loading, isAdmin };
}