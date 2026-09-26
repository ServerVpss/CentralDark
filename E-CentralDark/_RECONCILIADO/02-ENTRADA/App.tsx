import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Pages — Portal
import ModulePortal from "./pages/ModulePortal.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

// Pages — User panel
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Instances from "./pages/Instances.tsx";
import Contacts from "./pages/Contacts.tsx";
import Chats from "./pages/Chats.tsx";
import Sessions from "./pages/Sessions.tsx";
import Campaigns from "./pages/Campaigns.tsx";
import Flows from "./pages/Flows.tsx";
import AutoReplies from "./pages/AutoReplies.tsx";
import Webhooks from "./pages/Webhooks.tsx";
import ApiIntegrations from "./pages/ApiIntegrations.tsx";
import Settings from "./pages/Settings.tsx";
import SystemLogs from "./pages/SystemLogs.tsx";
import Users from "./pages/Users.tsx";
import Backups from "./pages/Backups.tsx";
import HelpSupport from "./pages/HelpSupport.tsx";
import Financial from "./pages/Financial.tsx";

// Pages — Admin panel
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminClients from "./pages/AdminClients.tsx";
import AdminPlans from "./pages/AdminPlans.tsx";
import AdminLogs from "./pages/AdminLogs.tsx";
import AdminMonitoring from "./pages/AdminMonitoring.tsx";
import AdminSettings from "./pages/AdminSettings.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";

// Pages — Admin wrappers (reuse user pages with admin banner)
import AdminConnections from "./pages/admin/AdminConnections.tsx";
import AdminChats from "./pages/admin/AdminChats.tsx";
import AdminContacts from "./pages/admin/AdminContacts.tsx";
import AdminCampaigns from "./pages/admin/AdminCampaigns.tsx";
import AdminAutoReplies from "./pages/admin/AdminAutoReplies.tsx";
import AdminFlows from "./pages/admin/AdminFlows.tsx";
import AdminWebhooks from "./pages/admin/AdminWebhooks.tsx";
import AdminApi from "./pages/admin/AdminApi.tsx";
import AdminSessions from "./pages/admin/AdminSessions.tsx";
import AdminBackups from "./pages/admin/AdminBackups.tsx";
import AdminCofreLovable from "./pages/admin/AdminCofreLovable.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'owner' && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/auth/reset-password" element={<ResetPassword />} />
    <Route path="/auth/callback" element={<Navigate to="/portal" replace />} />

    {/* ============================================= */}
    {/* PORTAL DE MÓDULOS — Tela pós-login            */}
    {/* ============================================= */}
    <Route path="/portal" element={<ProtectedRoute><ModulePortal /></ProtectedRoute>} />

    {/* ============================================= */}
    {/* PAINEL DO USUÁRIO — Sidebar normal             */}
    {/* ============================================= */}
    <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route index element={<Index />} />
      <Route path="instancias" element={<Instances />} />
      <Route path="sessoes" element={<Sessions />} />
      <Route path="contatos" element={<Contacts />} />
      <Route path="chats" element={<Chats />} />
      <Route path="campanhas" element={<Campaigns />} />
      <Route path="fluxos" element={<Flows />} />
      <Route path="auto-respostas" element={<AutoReplies />} />
      <Route path="webhooks" element={<Webhooks />} />
      <Route path="api" element={<ApiIntegrations />} />
      <Route path="configuracoes" element={<Settings />} />
      <Route path="logs" element={<SystemLogs />} />
      <Route path="usuarios" element={<Users />} />
      <Route path="backups" element={<Backups />} />
      <Route path="ajuda" element={<HelpSupport />} />
      <Route path="financeiro" element={<Financial />} />
    </Route>

    {/* ============================================= */}
    {/* PAINEL ADMIN — Protegido por Role              */}
    {/* ============================================= */}
    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
      {/* Admin-only pages */}
      <Route index element={<AdminDashboard />} />
      <Route path="clientes" element={<AdminClients />} />
      <Route path="planos" element={<AdminPlans />} />
      <Route path="usuarios" element={<AdminUsers />} />
      <Route path="logs" element={<AdminLogs />} />
      <Route path="monitoramento" element={<AdminMonitoring />} />
      <Route path="configuracoes" element={<AdminSettings />} />
      <Route path="financeiro" element={<Financial />} />

      {/* Reused user pages with admin wrapper */}
      <Route path="conexoes" element={<AdminConnections />} />
      <Route path="chats" element={<AdminChats />} />
      <Route path="contatos" element={<AdminContacts />} />
      <Route path="campanhas" element={<AdminCampaigns />} />
      <Route path="auto-respostas" element={<AdminAutoReplies />} />
      <Route path="fluxos" element={<AdminFlows />} />
      <Route path="webhooks" element={<AdminWebhooks />} />
      <Route path="api" element={<AdminApi />} />
      <Route path="sessoes" element={<AdminSessions />} />
      <Route path="backups" element={<AdminBackups />} />
      <Route path="cofre" element={<AdminCofreLovable />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
