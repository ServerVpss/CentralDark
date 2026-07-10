import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import { api } from "@/lib/api";

// Gate de autenticação: o backend guarda a sessão num cookie HttpOnly (cd_admin),
// então não dá pra "ler" se está logado direto — a forma correta é tentar uma
// chamada protegida (/admin/api/tools) e ver se cai em 401.
export default function App() {
  const [status, setStatus] = useState<"checando" | "logado" | "deslogado">("checando");

  async function checar() {
    try {
      await api.tools();
      setStatus("logado");
    } catch {
      setStatus("deslogado");
    }
  }

  useEffect(() => {
    checar();
  }, []);

  if (status === "checando") {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando painel…</div>
      </div>
    );
  }

  if (status === "deslogado") {
    return <LoginPage onLogin={() => setStatus("logado")} />;
  }

  return <AdminPage onLogout={() => setStatus("deslogado")} />;
}
