// Presets de animação Motion (motion.dev / framer-motion).
// Padrão único para todo o MultiZap. Use sempre que possível em vez de inventar
// transição/easing novo.

import type { Transition, Variants } from "framer-motion";

// --- Transições base ----------------------------------------------------------

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeInOutSoft: Transition["ease"] = [0.65, 0, 0.35, 1];

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 22,
  mass: 0.9,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

export const springBar: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 24,
  mass: 1,
};

// --- Variants ----------------------------------------------------------------

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: easeOutExpo } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: springSnappy },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOutExpo } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// Stagger pra listas
export const staggerContainer = (stagger = 0.06, delayChildren = 0.05): Variants => ({
  initial: {},
  animate: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOutExpo } },
};

// Loop sutil de "respiração" (heartbeat) para indicar atividade
export const heartbeatLoop = {
  scale: [1, 1.06, 1],
  transition: { duration: 1.8, repeat: Infinity, ease: easeInOutSoft },
};

// Shimmer pra barras de progresso
export const shimmerLoop = {
  x: ["-100%", "320%"],
  transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const },
};
