// Rotas do Admin CentralDark — administra o ECOSSISTEMA (portal, módulos, usuários).
// Protegidas por AdminRoute (login + papel admin).
import { Route } from "react-router-dom";
import { AdminRoute } from "@/compartilhado/auth/AdminRoute";
import LayoutAdmin from "@/paginas/centraldark-admin/LayoutAdmin";
import DashboardAdmin from "@/paginas/centraldark-admin/pages/DashboardAdmin";
import ModulosAdmin from "@/paginas/centraldark-admin/pages/ModulosAdmin";
import UsuariosAdmin from "@/paginas/centraldark-admin/pages/UsuariosAdmin";

export function rotasCentraldarkAdmin() {
  return (
    <Route
      path="/centraldark/admin"
      element={
        <AdminRoute>
          <LayoutAdmin />
        </AdminRoute>
      }
    >
      <Route index element={<DashboardAdmin />} />
      <Route path="modulos" element={<ModulosAdmin />} />
      <Route path="usuarios" element={<UsuariosAdmin />} />
    </Route>
  );
}
