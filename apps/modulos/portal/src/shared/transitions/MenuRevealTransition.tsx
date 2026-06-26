import { ReactNode } from "react";

/**
 * NO-OP intencional.
 *
 * Antes esse wrapper aplicava uma animação "ink reveal" (clip-path + blur +
 * opacity) a cada troca de rota. Como o `SplashController` já dispara o
 * `PageSplash` no mesmo evento de navegação, as duas animações rodavam
 * sobrepostas — o usuário via o splash terminar e logo em seguida o conteúdo
 * "piscar" (opacity 0 → 1 + blur) por mais ~600ms.
 *
 * Mantido como passthrough pra não quebrar imports existentes
 * (DashboardLayout etc.). Se quiser reintroduzir, fazer com `prefers-reduced-
 * motion` e SEM começar em opacity:0.
 */
export function MenuRevealTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
