// Rota antiga — agora apenas redireciona pra aba GitHub dentro de /admin/integracao
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/sistema/integracoes/github")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/integracao", search: { tab: "github" } as any });
  },
  component: () => null,
});
