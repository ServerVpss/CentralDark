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
import Index from "./pages/Index";
import LandingCentralDark from "./pages/LandingCentralDark";
import LandingTelePainel from "./pages/LandingTelePainel";
import LandingWhatsapp from "./pages/LandingWhatsapp";
import LandingCRM from "./pages/LandingCRM";
import LandingFinanceiro from "./pages/LandingFinanceiro";
import Portal from "./pages/Portal";
import Auth from "./pages/Auth";
import Bots from "./pages/Bots";
import BotSettingsPage from "./pages/BotSettings";
import MigrateSubscriptions from "./pages/MigrateSubscriptions";
import Plans from "./pages/Plans";
import Settings from "./pages/Settings";
import Consultas from "./pages/Consultas";
import TelegramUsers from "./pages/TelegramUsers";
import QueryLogs from "./pages/QueryLogs";
import PixTransactions from "./pages/PixTransactions";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";
import SubscriptionAudit from "./pages/SubscriptionAudit";
import WebAppResult from "./pages/WebAppResult";
import MenuTips from "./pages/MenuTips";
import DatabaseInfo from "./pages/DatabaseInfo";
import Status from "./pages/Status";
import DevTransitions from "./pages/DevTransitions";
import TesteModulos from "./pages/TesteModulos";
import UsuariosPainel from "./pages/UsuariosPainel";
import UsuarioPerfil from "./pages/UsuarioPerfil";
import { ViewAsBanner } from "@/shared/auth/ViewAsBanner";
import { PageSplash } from "@/shared/transitions/PageSplash";
import { SplashController } from "@/shared/transitions/SplashController";
import Docs from "./pages/Docs";

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
                          const redirect = getRootRedirectFor(detectHostKind());
                          return redirect ? <Navigate to={redirect} replace /> : <LandingCentralDark />;
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
