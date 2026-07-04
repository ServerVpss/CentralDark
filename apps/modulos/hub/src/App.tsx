import { useEffect, useState } from "react";
import HubPage from "./HubPage";
import LoginPage from "./pages/LoginPage";
import { ToastProvider } from "./components/Toast";

// Router minimal (sem instalar react-router) — HUB é enxuto
function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  return path;
}

export default function App() {
  // Dark mode padrão — mesmo DNA visual da home CentralDark
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const path = useRoute();
  const page = path.startsWith("/login") ? <LoginPage /> : <HubPage />;

  return <ToastProvider>{page}</ToastProvider>;
}
