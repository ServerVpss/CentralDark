// Guard de rota: além de logado, exige role=admin no banco (user_roles).
// TODO: cache de role no AuthContext pra evitar RPC por navegação.
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, loading } = useAuthContext();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (loading || !user) return;
    (async () => {
      setChecking(true);
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (cancelled) return;
      setIsAdmin(!error && data === true);
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [user, loading]);

  if (loading || (isAuthenticated && checking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Validando permissão…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Acesso restrito</h1>
          <p className="text-muted-foreground">
            Esta página é só para administradores. Se você acha que isso é um engano, fale com o dono do painel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
