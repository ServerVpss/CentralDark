import { useEffect } from "react";
import { HubPage } from "./HubPage";
import { LoginPage } from "./LoginPage";

function useRoute() {
  const get = () => window.location.pathname || "/";
  const [path, setPath] = (require("react") as typeof import("react")).useState(get());
  useEffect(() => {
    const onPop = () => setPath(get());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}

export default function App() {
  // Tema claro — idêntico à home CentralDark / TelePainel
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const path = useRoute();
  const page = path.startsWith("/login") ? <LoginPage /> : <HubPage />;

  return page;
}
