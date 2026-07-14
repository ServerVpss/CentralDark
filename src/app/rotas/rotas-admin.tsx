// Rotas de admin/dev do CentralDark (cockpit, transições, etc).
// Coisas internas do time — separadas do portal e do TelePainel.
import { Route, Navigate } from "react-router-dom";
import DevTransitions from "@/funcionalidades/telepainel/pages/DevTransitions";
import SalaControle from "@/paginas/admin-cockpit/SalaControle";

export function rotasAdmin() {
  return (
    <>
      <Route path="/dev/transitions" element={<DevTransitions />} />
      <Route path="/admin/cockpit" element={<SalaControle />} />
      <Route path="/preview/cockpit" element={<Navigate to="/admin/cockpit" replace />} />
    </>
  );
}
