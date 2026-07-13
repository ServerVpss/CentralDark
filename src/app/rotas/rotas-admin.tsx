// Rotas de admin/dev do CentralDark (cockpit, transições, etc).
// Coisas internas do time — separadas do portal e do TelePainel.
import { Route, Navigate } from "react-router-dom";
import DevTransitions from "@/funcionalidades/telepainel/pages/DevTransitions";
import CockpitPreview from "@/admin/cockpit";

export function rotasAdmin() {
  return (
    <>
      <Route path="/dev/transitions" element={<DevTransitions />} />
      <Route path="/admin/cockpit" element={<CockpitPreview />} />
      <Route path="/preview/cockpit" element={<Navigate to="/admin/cockpit" replace />} />
    </>
  );
}
