import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
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
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<LandingCentralDark />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/result/:pathToken/:secretToken" element={<WebAppResult />} />

              {/* Landings individuais dos módulos */}
              <Route path="/telepainel" element={<LandingTelePainel />} />
              <Route path="/whatsapp" element={<LandingWhatsapp />} />
              <Route path="/crm" element={<LandingCRM />} />
              <Route path="/financeiro" element={<LandingFinanceiro />} />

              {/* Portal CentralDark (área logada principal) */}
              <Route
                path="/portal"
                element={<ProtectedRoute><Portal /></ProtectedRoute>}
              />

              {/* Rotas internas do TelePainel — legado (sem prefixo) */}
              {telepainelRoutes.map((r) => (
                <Route
                  key={`legacy-${r.path}`}
                  path={`/${r.path}`}
                  element={<ProtectedRoute>{r.element}</ProtectedRoute>}
                />
              ))}

              {/* Rotas internas do TelePainel — novas (prefixadas) */}
              {telepainelRoutes.map((r) => (
                <Route
                  key={`tp-${r.path}`}
                  path={`/telepainel/${r.path}`}
                  element={<ProtectedRoute>{r.element}</ProtectedRoute>}
                />
              ))}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
