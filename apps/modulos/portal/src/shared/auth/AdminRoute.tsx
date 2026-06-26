// Guard: exige logado + admin. Usa cache global (useIsAdmin) pra não piscar
// "Validando permissão…" a cada navegação entre menus admin.
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/shared/auth/AuthProvider";
import { useIsAdmin } from "@/shared/hooks/useIsAdmin";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const location = useLocation();

  // Bloqueia render dos filhos enquanto qualquer validação roda.
  // Fundo sólido = sem flash branco entre páginas.
  if (authLoading || (isAuthenticated && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            Esta página é só para administradores.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
