// Rotas do TelePainel (área logada + admin). Todas passam por guarda.
// Cada rota tem versão canônica (/telepainel/*) e um alias legado (/*)
// pra não quebrar links antigos enquanto a base migra.
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/compartilhado/auth/ProtectedRoute";
import { AdminRoute } from "@/compartilhado/auth/AdminRoute";

import Portal from "@/paginas/portal-publico/pages/Portal";
import Status from "@/paginas/portal-publico/pages/Status";
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
import Security from "@/funcionalidades/telepainel/pages/Security";
import SubscriptionAudit from "@/funcionalidades/telepainel/pages/SubscriptionAudit";
import MenuTips from "@/funcionalidades/telepainel/pages/MenuTips";
import DatabaseInfo from "@/funcionalidades/telepainel/pages/DatabaseInfo";
import TesteModulos from "@/funcionalidades/telepainel/pages/TesteModulos";
import UsuariosPainel from "@/funcionalidades/telepainel/pages/UsuariosPainel";
import UsuarioPerfil from "@/funcionalidades/telepainel/pages/UsuarioPerfil";
import PonteMCP from "@/funcionalidades/telepainel/pages/PonteMCP";
import MegaPainel from "@/funcionalidades/telepainel/pages/MegaPainel";
import Cofre from "@/funcionalidades/telepainel/pages/Cofre";
import MapaSite from "@/funcionalidades/telepainel/pages/MapaSite";
import AiProxyConfig from "@/funcionalidades/telepainel/pages/AiProxyConfig";
import HermesPanel from "@/funcionalidades/hermes-panel/pages/HermesPanel";

type RotaTP = { path: string; element: JSX.Element; adminOnly?: boolean };

const rotas: RotaTP[] = [
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

const wrap = (el: JSX.Element, adminOnly?: boolean) =>
  adminOnly ? <AdminRoute>{el}</AdminRoute> : <ProtectedRoute>{el}</ProtectedRoute>;

export function rotasTelepainel() {
  return (
    <>
      <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
      {rotas.map((r) => (
        <Route key={`legacy-${r.path}`} path={`/${r.path}`} element={wrap(r.element, r.adminOnly)} />
      ))}
      {rotas.map((r) => (
        <Route key={`tp-${r.path}`} path={`/telepainel/${r.path}`} element={wrap(r.element, r.adminOnly)} />
      ))}
    </>
  );
}
