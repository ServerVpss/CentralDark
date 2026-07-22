// Rotas de admin/dev do CentralDark (cockpit, transições, etc).
// Coisas internas do time — separadas do portal e do TelePainel.
import { Route, Navigate } from "react-router-dom";
import DevTransitions from "@/funcionalidades/telepainel/pages/DevTransitions";
import SalaControle from "@/paginas/admin-cockpit/SalaControle";
import CockpitOverclock from "@/admin/cockpit";

export function rotasAdmin() {
  return (
    <>
      <Route path="/dev/transitions" element={<DevTransitions />} />
      <Route path="/admin/cockpit" element={<SalaControle />} />
      <Route path="/admin/cockpit-overclock" element={<CockpitOverclock />} />
      <Route path="/preview/cockpit" element={<Navigate to="/admin/cockpit" replace />} />
    </>
  );
}
