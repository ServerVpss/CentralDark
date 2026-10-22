import { useEffect } from "react";

/** Marca a pagina como "ativa" por 1.5s apos mouse/scroll; o CSS faz o pulso neon uma vez por rajada. */
export function AtividadeNeon() {
  useEffect(() => {
    const root = document.documentElement;
    let t: number | undefined;
    const ligar = () => {
      root.dataset.activity = "on";
      window.clearTimeout(t);
      t = window.setTimeout(() => { delete root.dataset.activity; }, 1500);
    };
    const eventos = ["mousemove", "wheel", "scroll"] as const;
    eventos.forEach((e) => window.addEventListener(e, ligar, { passive: true }));
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, ligar));
      window.clearTimeout(t);
      delete root.dataset.activity;
    };
  }, []);
  return null;
}