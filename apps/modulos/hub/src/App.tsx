import { useEffect } from "react";
import HubPage from "./HubPage";

export default function App() {
  // Ativa dark mode por padrão — mesmo DNA visual da home CentralDark
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <HubPage />;
}
