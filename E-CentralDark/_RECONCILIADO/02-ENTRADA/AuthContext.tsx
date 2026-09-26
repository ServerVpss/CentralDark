import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaceAndRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspace_id,
          workspaces (
            id,
            name,
            slug
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setRole(data.role);
        if (data.workspaces) {
          setWorkspace(data.workspaces as any);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar workspace/role:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchWorkspaceAndRole(session.user.id).then(() => setIsLoading(false));
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWorkspaceAndRole(session.user.id).then(() => setIsLoading(false));
      } else {
        setWorkspace(null);
        setRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Redireciona para o login após encerrar sessão
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      workspace,
      role,
      isAuthenticated: !!user, 
      isLoading,
      signOut,
      refreshWorkspace: () => user ? fetchWorkspaceAndRole(user.id) : Promise.resolve()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
