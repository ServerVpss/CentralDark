/**
 * Preferencias VISUAIS de montagem do Cockpit. O owner dos processos permanece
 * no gateway Hermes/AionUI da VPS; este arquivo jamais gerencia systemd ou auth.
 */
import { useEffect, useState } from "react";

export type ModuloCockpit = "hermes" | "aionui";
export type ModoModuloCockpit = "ativo" | "sob-demanda" | "desativado";

const STORE = "centraldark.cockpit.modulos.v1";
const EVENT = "centraldark:modulos-preferencias";
export const MODULOS_PADRAO: Readonly<Record<ModuloCockpit, ModoModuloCockpit>> = {
  hermes: "sob-demanda",
  aionui: "sob-demanda",
};

function modoValido(valor: unknown): valor is ModoModuloCockpit {
  return valor === "ativo" || valor === "sob-demanda" || valor === "desativado";
}

export function lerModulosCockpit(): Record<ModuloCockpit, ModoModuloCockpit> {
  const padrao = { ...MODULOS_PADRAO };
  if (typeof window === "undefined") return padrao;
  try {
    const bruto: unknown = JSON.parse(window.localStorage.getItem(STORE) || "{}");
    if (!bruto || typeof bruto !== "object") return padrao;
    const valores = bruto as Record<string, unknown>;
    for (const id of ["hermes", "aionui"] as const) {
      if (modoValido(valores[id])) padrao[id] = valores[id];
    }
  } catch { /* Storage indisponivel: comportamento padrao seguro. */ }
  return padrao;
}

export function definirModoModuloCockpit(id: ModuloCockpit, modo: ModoModuloCockpit) {
  if (typeof window === "undefined") return;
  const estado = lerModulosCockpit();
  estado[id] = modo;
  try { window.localStorage.setItem(STORE, JSON.stringify(estado)); }
  catch { /* Preferencia de sessao ainda pode ser observada pelos listeners. */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id, modo } }));
}

export function useModulosCockpit(): Readonly<Record<ModuloCockpit, ModoModuloCockpit>> {
  // SSR e primeira montagem identicos, sem hydration mismatch.
  const [modulos, definirModulos] = useState<Record<ModuloCockpit, ModoModuloCockpit>>(
    () => ({ ...MODULOS_PADRAO }),
  );
  useEffect(() => {
    const atualizar = () => definirModulos(lerModulosCockpit());
    atualizar();
    window.addEventListener(EVENT, atualizar);
    window.addEventListener("storage", atualizar);
    return () => {
      window.removeEventListener(EVENT, atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);
  return modulos;
}
