/**
 * Utilitário para a animação "Menu Reveal".
 * - Salva a coordenada do clique em CSS vars no <html>.
 * - Single source of truth pra a origem do efeito.
 * Nenhum estado React é alterado aqui — só DOM cru, sem re-render.
 */

const ROOT_ATTR = "data-menu-reveal-origin";

export function setRevealOrigin(e?: { clientX?: number; clientY?: number } | null) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
    x = e.clientX;
    y = e.clientY;
  }
  root.style.setProperty("--reveal-x", `${x}px`);
  root.style.setProperty("--reveal-y", `${y}px`);
  root.setAttribute(ROOT_ATTR, "1");
}

/**
 * Captura o centro de um elemento (botão de menu) e usa como origem.
 * Útil para navegação por teclado.
 */
export function setRevealOriginFromElement(el: Element | null) {
  if (!el) return setRevealOrigin(null);
  const r = el.getBoundingClientRect();
  setRevealOrigin({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
}
