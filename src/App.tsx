import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Bots from "./pages/Bots";
import BotSettingsPage from "./pages/BotSettings";
import Security from "./pages/Security";
import Plans from "./pages/Plans";
import Settings from "./pages/Settings";
import Consultas from "./pages/Consultas";
import TelegramUsers from "./pages/TelegramUsers";
import QueryLogs from "./pages/QueryLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/consultas" element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
            <Route path="/bots" element={<ProtectedRoute><Bots /></ProtectedRoute>} />
            <Route path="/bots/:botId/settings" element={<ProtectedRoute><BotSettingsPage /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
            <Route path="/telegram-users" element={<ProtectedRoute><TelegramUsers /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><QueryLogs /></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
