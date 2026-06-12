// Banner global que aparece no topo quando o admin está em modo espelho.
import { useEffect, useState } from "react";
import { getViewAs, stopViewAs, ViewAsState } from "@/lib/viewAsMode";
import { Eye, X } from "lucide-react";
import { clearAdminCache } from "@/hooks/useIsAdmin";

export function ViewAsBanner() {
  const [state, setState] = useState<ViewAsState | null>(getViewAs());

  useEffect(() => {
    const sync = () => setState(getViewAs());
    window.addEventListener("viewas-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("viewas-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!state) return null;

  const exit = () => {
    stopViewAs();
    clearAdminCache(); // força revalidar admin de novo
    // Recarrega pra restaurar todos os menus/rotas admin
    window.location.href = "/usuarios-painel";
  };

  return (
    <div className="sticky top-0 z-[100] bg-amber-500 text-amber-950 shadow-3d">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="h-4 w-4 shrink-0" />
          <span className="truncate">
            Você está vendo o painel como{" "}
            <strong className="font-mono">{state.email ?? state.userId}</strong>
            {" "}— modo somente leitura.
          </span>
        </div>
        <button
          onClick={exit}
          className="flex items-center gap-1 bg-amber-950 text-amber-50 px-3 py-1 rounded-lg hover:bg-amber-900 active:translate-y-[1px] shadow-3d-soft shrink-0"
        >
          <X className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </div>
  );
}
