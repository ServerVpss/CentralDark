import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { detectHostKind, getRootRedirectFor } from "@/lib/hostRouting";
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
import { PageSplash } from "@/components/transitions/PageSplash";

const queryClient = new QueryClient();

// Rotas internas do módulo TelePainel — usadas tanto na raiz (legado)
// quanto prefixadas em /telepainel/* (novo padrão sob o portal CentralDark).
const telepainelRoutes = [
  { path: "dashboard", element: <Index /> },
  { path: "consultas", element: <Consultas /> },
  { path: "bots", element: <Bots /> },
  { path: "bots/:botId/settings", element: <BotSettingsPage /> },
  { path: "bots/:botId/migrate", element: <MigrateSubscriptions /> },
  { path: "telegram-users", element: <TelegramUsers /> },
  { path: "logs", element: <QueryLogs /> },
  { path: "plans", element: <Plans /> },
  { path: "pix", element: <PixTransactions /> },
  { path: "settings", element: <Settings /> },
  { path: "security", element: <Security /> },
  { path: "audit", element: <SubscriptionAudit /> },
  { path: "menu-tips", element: <MenuTips /> },
];

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="telepanel-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <GlobalSearch />
            {/* <InstallPrompt /> */}
            <PageSplash />
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
                      <Route path="/telepainel" element={<LandingTelePainel />} />
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
                          element={<ProtectedRoute>{r.element}</ProtectedRoute>}
                        />
                      ))}
                      {telepainelRoutes.map((r) => (
                        <Route
                          key={`tp-${r.path}`}
                          path={`/telepainel/${r.path}`}
                          element={<ProtectedRoute>{r.element}</ProtectedRoute>}
                        />
                      ))}
                    </>
                  )}

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
