import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SESSION_SCOPED_KEYS } from "@/lib/query-keys";
import { bumpSessionEpoch } from "@/lib/session-epoch";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Reinvalida só as chaves que dependem da sessão (workspace, permissões, menu,
// super-admin, controles, branding). Mantém o resto do cache intacto pra evitar
// glitch e refetch desnecessário no resto da UI.
function invalidateSessionScoped(qc: QueryClient) {
  for (const key of SESSION_SCOPED_KEYS) {
    qc.invalidateQueries({ queryKey: key as unknown as readonly unknown[] });
  }
}

// Cancela requests em voo + remove cache das chaves de sessão.
// Usado no logout e na troca de usuário pra garantir que respostas atrasadas
// do usuário anterior não pintem a tela do novo usuário (race guard).
function purgeSessionScoped(qc: QueryClient) {
  for (const key of SESSION_SCOPED_KEYS) {
    const k = key as unknown as readonly unknown[];
    // cancelQueries aborta o fetch via AbortSignal (quando o queryFn usa).
    qc.cancelQueries({ queryKey: k });
    qc.removeQueries({ queryKey: k });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Set listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      const newUserId = s?.user?.id ?? null;
      const prevUserId = prevUserIdRef.current;

      // Troca de usuário: bump da época + cancela + remove escopo de sessão.
      // Bump força qualquer queryFn em voo a lançar StaleSessionError quando
      // chegar a resposta, evitando flash com dados do usuário anterior.
      if (prevUserId && prevUserId !== newUserId) {
        bumpSessionEpoch();
        purgeSessionScoped(queryClient);
      }

      // Login novo ou atualização de metadata (papel, workspace, etc.):
      // só reinvalida as chaves que montam o menu/contexto do usuário.
      // TOKEN_REFRESHED é ignorado de propósito.
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        invalidateSessionScoped(queryClient);
      }

      if (event === "SIGNED_OUT") {
        bumpSessionEpoch();
        purgeSessionScoped(queryClient);
      }

      prevUserIdRef.current = newUserId;
    });
    // Then hydrate session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      prevUserIdRef.current = data.session?.user?.id ?? null;
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
