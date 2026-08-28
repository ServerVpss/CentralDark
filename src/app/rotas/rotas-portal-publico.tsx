// Rotas do Portal Público (CentralDark): landing, auth, landings dos módulos.
// Vive separado das rotas do TelePainel pra deixar cada mundo no seu lugar.
import { Route, Navigate } from "react-router-dom";
import { detectHostKind, getRootRedirectFor } from "@/compartilhado/utilitarios/hostRouting";
import { useAuthContext } from "@/compartilhado/auth/AuthProvider";

import LandingCentralDark from "@/paginas/portal-publico/pages/LandingCentralDark";
import Auth from "@/paginas/portal-publico/pages/Auth";
import LandingWhatsapp from "@/funcionalidades/bot-whatsapp/pages/LandingWhatsapp";
import LandingCRM from "@/funcionalidades/crm/pages/LandingCRM";
import LandingFinanceiro from "@/funcionalidades/financeiro/pages/LandingFinanceiro";
import LandingTelePainel from "@/funcionalidades/telepainel/pages/LandingTelePainel";

function TelepainelEntry() {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  if (user) return <Navigate to="/telepainel/dashboard" replace />;
  return <LandingTelePainel />;
}

function RaizPorHost() {
  const kind = detectHostKind();
  const redirect = getRootRedirectFor(kind);
  if (redirect) return <Navigate to={redirect} replace />;
  if (kind === "whatsapp") return <LandingWhatsapp />;
  if (kind === "crm") return <LandingCRM />;
  if (kind === "financeiro") return <LandingFinanceiro />;
  return <LandingCentralDark />;
}

export function rotasPortalPublico() {
  return (
    <>
      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="/" element={<RaizPorHost />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/telepainel" element={<TelepainelEntry />} />
      <Route path="/whatsapp" element={<LandingWhatsapp />} />
      <Route path="/crm" element={<LandingCRM />} />
      <Route path="/financeiro" element={<LandingFinanceiro />} />
    </>
  );
}
