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
import Landing from "./pages/Landing";
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

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="telepanel-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <GlobalSearch />
            <InstallPrompt />
            <Routes>
              {/* Rota pública do Mini App do Telegram (resultado) */}
              <Route path="/result/:pathToken/:secretToken" element={<WebAppResult />} />
              <Route path="/auth" element={<Auth />} />
              {/* Landing pública na raiz */}
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/consultas" element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
              <Route path="/bots" element={<ProtectedRoute><Bots /></ProtectedRoute>} />
              <Route path="/bots/:botId/settings" element={<ProtectedRoute><BotSettingsPage /></ProtectedRoute>} />
              <Route path="/bots/:botId/migrate" element={<ProtectedRoute><MigrateSubscriptions /></ProtectedRoute>} />
              <Route path="/telegram-users" element={<ProtectedRoute><TelegramUsers /></ProtectedRoute>} />
              <Route path="/logs" element={<ProtectedRoute><QueryLogs /></ProtectedRoute>} />
              <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
              <Route path="/pix" element={<ProtectedRoute><PixTransactions /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute><SubscriptionAudit /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
