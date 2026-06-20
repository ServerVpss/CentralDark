import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/shared/auth/AuthProvider";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";
import { AdminRoute } from "@/shared/auth/AdminRoute";
import { GlobalSearch } from "@/apps/modulos/telepainel/components/search/GlobalSearch";
import { InstallPrompt } from "@/shared/pwa/InstallPrompt";
import { detectHostKind, getRootRedirectFor } from "@/shared/lib/hostRouting";
// === Páginas do app "web" (portal público) ===
import LandingCentralDark from "@/apps/web/pages/LandingCentralDark";
import Portal from "@/apps/web/pages/Portal";
import Auth from "@/apps/web/pages/Auth";
import Status from "@/apps/web/pages/Status";

// === Páginas dos módulos só-landing ===
import LandingWhatsapp from "@/apps/modulos/bot-whatsapp/pages/LandingWhatsapp";
import LandingCRM from "@/apps/modulos/crm/pages/LandingCRM";
import LandingFinanceiro from "@/apps/modulos/financeiro/pages/LandingFinanceiro";

// === Páginas do módulo TelePainel (produto real) ===
import LandingTelePainel from "@/apps/modulos/telepainel/pages/LandingTelePainel";
import Index from "@/apps/modulos/telepainel/pages/Index";
import Bots from "@/apps/modulos/telepainel/pages/Bots";
import BotSettingsPage from "@/apps/modulos/telepainel/pages/BotSettings";
import MigrateSubscriptions from "@/apps/modulos/telepainel/pages/MigrateSubscriptions";
import Plans from "@/apps/modulos/telepainel/pages/Plans";
import Settings from "@/apps/modulos/telepainel/pages/Settings";
import Consultas from "@/apps/modulos/telepainel/pages/Consultas";
import TelegramUsers from "@/apps/modulos/telepainel/pages/TelegramUsers";
import QueryLogs from "@/apps/modulos/telepainel/pages/QueryLogs";
import PixTransactions from "@/apps/modulos/telepainel/pages/PixTransactions";
import NotFound from "@/apps/modulos/telepainel/pages/NotFound";
import Security from "@/apps/modulos/telepainel/pages/Security";
import SubscriptionAudit from "@/apps/modulos/telepainel/pages/SubscriptionAudit";
import WebAppResult from "@/apps/modulos/telepainel/pages/WebAppResult";
import MenuTips from "@/apps/modulos/telepainel/pages/MenuTips";
import DatabaseInfo from "@/apps/modulos/telepainel/pages/DatabaseInfo";
import DevTransitions from "@/apps/modulos/telepainel/pages/DevTransitions";
import TesteModulos from "@/apps/modulos/telepainel/pages/TesteModulos";
import UsuariosPainel from "@/apps/modulos/telepainel/pages/UsuariosPainel";
import UsuarioPerfil from "@/apps/modulos/telepainel/pages/UsuarioPerfil";
import PonteMCP from "@/apps/modulos/telepainel/pages/PonteMCP";


import { ViewAsBanner } from "@/shared/auth/ViewAsBanner";
import { PageSplash } from "@/shared/transitions/PageSplash";
import { SplashController } from "@/shared/transitions/SplashController";

const queryClient = new QueryClient();

// Se o usuário já estiver logado e acessar /telepainel direto, manda pro dashboard.
// Caso contrário, mostra a landing pública do módulo.
function TelepainelEntry() {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  if (user) return <Navigate to="/telepainel/dashboard" replace />;
  return <LandingTelePainel />;
}

// Rotas internas do módulo TelePainel — usadas tanto na raiz (legado)
// quanto prefixadas em /telepainel/* (novo padrão sob o portal CentralDark).
// `adminOnly: true` exige role=admin no banco (user_roles).
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
  { path: "teste-modulos", element: <TesteModulos />, adminOnly: true },
  { path: "usuarios-painel", element: <UsuariosPainel />, adminOnly: true },
  { path: "usuarios-painel/:id", element: <UsuarioPerfil />, adminOnly: true },
  
];

// Aplica o guard correto: AdminRoute (envolve ProtectedRoute) ou só ProtectedRoute.
const wrapGuard = (el: JSX.Element, adminOnly?: boolean) =>
  adminOnly ? <AdminRoute>{el}</AdminRoute> : <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="telepanel-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <GlobalSearch />
            <ViewAsBanner />
            {/* <InstallPrompt /> */}
            <PageSplash />
            <SplashController />
            {(() => {
              // Modo de build: "web" = só landing+auth, "portal" = só área logada,
              // qualquer outro valor (ou ausente) = app completo (modo Lovable/dev).
              const APP_MODE = (import.meta.env.VITE_APP_MODE as string | undefined) ?? "full";
              const isWeb = APP_MODE === "web";
              const isPortal = APP_MODE === "portal";
              const isFull = !isWeb && !isPortal;

              return (
                <Routes>
                  {/* ===== Rotas públicas (landing + auth) — web e full ===== */}
                  {(isWeb || isFull) && (
                    <>
                      <Route
                        path="/"
                        element={(() => {
                          const kind = detectHostKind();
                          const redirect = getRootRedirectFor(kind);
                          if (redirect) return <Navigate to={redirect} replace />;
                          // Cada subdomínio mostra a landing correspondente direto na raiz
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

                  {/* Em modo portal: raiz manda direto pro /portal */}
                  {isPortal && (
                    <>
                      <Route path="/" element={<Navigate to="/portal" replace />} />
                      <Route path="/auth" element={<Auth />} />
                    </>
                  )}

                  {/* ===== Documentação do Design System (pública) ===== */}
                  <Route path="/docs" element={<Docs />} />

                  {/* ===== Resultado de WebApp (compartilhado) ===== */}
                  <Route path="/result/:pathToken/:secretToken" element={<WebAppResult />} />

                  {/* ===== Rotas logadas (portal + telepainel) — portal e full ===== */}
                  {(isPortal || isFull) && (
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

                  {/* ===== Rota oculta de QA das transições ===== */}
                  <Route path="/dev/transitions" element={<DevTransitions />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              );
            })()}
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
