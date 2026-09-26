// Espelho master da tela de Perfil do WhatsApp.
// Redireciona para a rota /app que já tem toda a UI e funciona pra super_admin.
import { createFileRoute, useParams, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/whatsapp/perfil/$connectionId")({
  component: AdminPerfilRedirect,
});

function AdminPerfilRedirect() {
  const { connectionId } = useParams({ from: "/admin/whatsapp/perfil/$connectionId" });
  return <Navigate to="/app/canais/perfil/$connectionId" params={{ connectionId }} replace />;
}
