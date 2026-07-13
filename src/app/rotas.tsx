// Definição de todas as rotas do app.
// Separado de App.tsx para manter cada coisa no seu lugar:
// - App.tsx = composição da árvore de provedores
// - provedores.tsx = provedores globais
// - rotas.tsx = rotas (o que aparece em cada URL)
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "@/compartilhado/auth/AuthProvider";
import { ProtectedRoute } from "@/compartilhado/auth/ProtectedRoute";
import { AdminRoute } from "@/compartilhado/auth/AdminRoute";
import { detectHostKind, getRootRedirectFor } from "@/compartilhado/utilitarios/hostRouting";
import { ehModoWeb, ehModoPortal, ehModoFull } from "./configuracao";

// === Páginas do portal público ===
import LandingCentralDark from "@/paginas/portal-publico/pages/LandingCentralDark";
import Portal from "@/paginas/portal-publico/pages/Portal";
import Auth from "@/paginas/portal-publico/pages/Auth";
import Status from "@/paginas/portal-publico/pages/Status";

// === Páginas dos módulos só-landing ===
import LandingWhatsapp from "@/funcionalidades/bot-whatsapp/pages/LandingWhatsapp";
import LandingCRM from "@/funcionalidades/crm/pages/LandingCRM";
import LandingFinanceiro from "@/funcionalidades/financeiro/pages/LandingFinanceiro";

// === Páginas do módulo TelePainel ===
import LandingTelePainel from "@/funcionalidades/telepainel/pages/LandingTelePainel";
import Index from "@/funcionalidades/telepainel/pages/Index";
import Bots from "@/funcionalidades/telepainel/pages/Bots";
import BotSettingsPage from "@/funcionalidades/telepainel/pages/BotSettings";
import MigrateSubscriptions from "@/funcionalidades/telepainel/pages/MigrateSubscriptions";
import Plans from "@/funcionalidades/telepainel/pages/Plans";
import Settings from "@/funcionalidades/telepainel/pages/Settings";
import Consultas from "@/funcionalidades/telepainel/pages/Consultas";
import TelegramUsers from "@/funcionalidades/telepainel/pages/TelegramUsers";
import ConscienciaViva from "@/funcionalidades/telepainel/pages/ConscienciaViva";
import QueryLogs from "@/funcionalidades/telepainel/pages/QueryLogs";
import PixTransactions from "@/funcionalidades/telepainel/pages/PixTransactions";
import NotFound from "@/funcionalidades/telepainel/pages/NotFound";
import Security from "@/funcionalidades/telepainel/pages/Security";
import SubscriptionAudit from "@/funcionalidades/telepainel/pages/SubscriptionAudit";
import WebAppResult from "@/funcionalidades/telepainel/pages/WebAppResult";
import MenuTips from "@/funcionalidades/telepainel/pages/MenuTips";
import DatabaseInfo from "@/funcionalidades/telepainel/pages/DatabaseInfo";
import DevTransitions from "@/funcionalidades/telepainel/pages/DevTransitions";
import TesteModulos from "@/funcionalidades/telepainel/pages/TesteModulos";
import UsuariosPainel from "@/funcionalidades/telepainel/pages/UsuariosPainel";
import UsuarioPerfil from "@/funcionalidades/telepainel/pages/UsuarioPerfil";
import Docs from "@/funcionalidades/telepainel/pages/Docs";
import PonteMCP from "@/funcionalidades/telepainel/pages/PonteMCP";
import MegaPainel from "@/funcionalidades/telepainel/pages/MegaPainel";
import Cofre from "@/funcionalidades/telepainel/pages/Cofre";
import MapaSite from "@/funcionalidades/telepainel/pages/MapaSite";
import AiProxyConfig from "@/funcionalidades/telepainel/pages/AiProxyConfig";
import CockpitPreview from "@/admin/cockpit";
import HermesPanel from "@/funcionalidades/hermes-panel/pages/HermesPanel";

function TelepainelEntry() {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  if (user) return <Navigate to="/telepainel/dashboard" replace />;
  return <LandingTelePainel />;
}

const telepainelRoutes: Array<{ path: string; element: JSX.Element; adminOnly?: boolean }> = [
  { path: "dashboard", element: <Index /> },
  { path: "consultas", element: <Consultas /> },
  { path: "bots", element: <Bots />, adminOnly: true },
  { path: "bots/:botId/settings", element: <BotSettingsPage />, adminOnly: true },
  { path: "bots/:botId/migrate", element: <MigrateSubscriptions />, adminOnly: true },
  { path: "telegram-users", element: <TelegramUsers />, adminOnly: true },
  { path: "logs", element: <QueryLogs />, adminOnly: true },
  { path: "plans", element: <Plans />, adminOnly: true },
  { path: "pix", element: <PixTransactions />, adminOnly: true },
  { path: "settings", element: <Settings />, adminOnly: true },
  { path: "security", element: <Security />, adminOnly: true },
  { path: "audit", element: <SubscriptionAudit />, adminOnly: true },
  { path: "menu-tips", element: <MenuTips />, adminOnly: true },
  { path: "database", element: <DatabaseInfo />, adminOnly: true },
  { path: "status", element: <Status />, adminOnly: true },
  { path: "mega-painel", element: <MegaPainel />, adminOnly: true },
  { path: "cofre", element: <Cofre />, adminOnly: true },
  { path: "teste-modulos", element: <TesteModulos />, adminOnly: true },
  { path: "usuarios-painel", element: <UsuariosPainel />, adminOnly: true },
  { path: "usuarios-painel/:id", element: <UsuarioPerfil />, adminOnly: true },
  { path: "ponte-mcp", element: <PonteMCP />, adminOnly: true },
  { path: "mapa", element: <MapaSite />, adminOnly: true },
  { path: "consciencia", element: <ConscienciaViva />, adminOnly: true },
  { path: "hermes", element: <HermesPanel />, adminOnly: true },
  { path: "ai-proxy", element: <AiProxyConfig />, adminOnly: true },
];

const wrapGuard = (el: JSX.Element, adminOnly?: boolean) =>
  adminOnly ? <AdminRoute>{el}</AdminRoute> : <ProtectedRoute>{el}</ProtectedRoute>;

export function RotasApp() {
  return (
    <Routes>
      {(ehModoWeb || ehModoFull) && (
        <>
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={(() => {
              const kind = detectHostKind();
              const redirect = getRootRedirectFor(kind);
              if (redirect) return <Navigate to={redirect} replace />;
              if (kind === "whatsapp") return <LandingWhatsapp />;
              if (kind === "crm") return <LandingCRM />;
              if (kind === "financeiro") return <LandingFinanceiro />;
              return <LandingCentralDark />;
            })()}
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/telepainel" element={<TelepainelEntry />} />
          <Route path="/whatsapp" element={<LandingWhatsapp />} />
          <Route path="/crm" element={<LandingCRM />} />
          <Route path="/financeiro" element={<LandingFinanceiro />} />
        </>
      )}

      {ehModoPortal && (
        <>
          <Route path="/" element={<Navigate to="/portal" replace />} />
          <Route path="/auth" element={<Auth />} />
        </>
      )}

      <Route path="/docs" element={<Docs />} />
      <Route path="/result/:pathToken/:secretToken" element={<WebAppResult />} />

      {(ehModoPortal || ehModoFull) && (
        <>
          <Route
            path="/portal"
            element={<ProtectedRoute><Portal /></ProtectedRoute>}
          />
          {telepainelRoutes.map((r) => (
            <Route
              key={`legacy-${r.path}`}
              path={`/${r.path}`}
              element={wrapGuard(r.element, r.adminOnly)}
            />
          ))}
          {telepainelRoutes.map((r) => (
            <Route
              key={`tp-${r.path}`}
              path={`/telepainel/${r.path}`}
              element={wrapGuard(r.element, r.adminOnly)}
            />
          ))}
        </>
      )}

      <Route path="/dev/transitions" element={<DevTransitions />} />
      {/* Cockpit oficial — antes vivia em /preview/cockpit */}
      <Route path="/admin/cockpit" element={<CockpitPreview />} />
      <Route path="/preview/cockpit" element={<Navigate to="/admin/cockpit" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
