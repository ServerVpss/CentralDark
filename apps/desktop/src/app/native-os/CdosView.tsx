import { Navigate } from "react-router";

// /cdos is an older bookmark. The NativeShell is now mounted once by
// the original Hermes layout controller, never nested within a page.
export function CdosView() {
  return <Navigate to="/" replace />;
}
