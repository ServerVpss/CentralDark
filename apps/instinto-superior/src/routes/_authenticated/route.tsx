import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// O servidor não tem a sessão do navegador (ssr: false). Redirecionar em
// beforeLoad na primeira navegação muda a árvore antes da hidratação (#418).
// Verificar após montar, mantendo o conteúdo protegido fechado até o PASS.
function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser()
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data.user) {
          void navigate({ to: "/auth", replace: true });
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (active) void navigate({ to: "/auth", replace: true });
      });
    return () => { active = false; };
  }, [navigate]);

  return authorized ? <Outlet /> : null;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});
