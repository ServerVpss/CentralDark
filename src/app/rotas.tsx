// Roteador raiz. Cada domínio (portal público, telepainel, admin) mora no seu
// arquivo dedicado dentro de ./rotas/*. Aqui só juntamos tudo.
import { Routes, Route, Navigate } from "react-router-dom";
import Docs from "@/funcionalidades/telepainel/pages/Docs";
import OAuthConsent from "@/paginas/portal-publico/pages/OAuthConsent";
import WebAppResult from "@/funcionalidades/telepainel/pages/WebAppResult";
import NotFound from "@/funcionalidades/telepainel/pages/NotFound";
import SecurityControl from "@/paginas/security-control/SecurityControl";
import { ehModoWeb, ehModoPortal, ehModoFull } from "./configuracao";
import { rotasPortalPublico } from "./rotas/rotas-portal-publico";
import { rotasTelepainel } from "./rotas/rotas-telepainel";
import { rotasAdmin } from "./rotas/rotas-admin";
import { rotasCentraldarkAdmin } from "./rotas/rotas-centraldark-admin";

export function RotasApp() {
  return (
    <Routes>
      {(ehModoWeb || ehModoFull) && rotasPortalPublico()}

      {ehModoPortal && (
        <>
          <Route path="/" element={<Navigate to="/portal" replace />} />
          <Route path="/auth" element={<Navigate to="/portal" replace />} />
        </>
      )}

      <Route path="/docs" element={<Docs />} />
      <Route path="/result/:pathToken/:secretToken" element={<WebAppResult />} />
      <Route path="/security-control" element={<SecurityControl />} />
      <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

      {(ehModoPortal || ehModoFull) && rotasTelepainel()}

      {rotasAdmin()}

      {rotasCentraldarkAdmin()}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
