import type { Easing, Variants } from "framer-motion";

// Animation constants and presets for Framer Motion

// Spring transitions
export const SPRING_BOUNCE = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

export const SPRING_SNAPPY = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export const SPRING_GENTLE = {
  type: "spring" as const,
  stiffness: 200,
  damping: 30,
};

// Ease presets
const easeOut: Easing = [0.33, 1, 0.68, 1];

// Page transition variants
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Card variants
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.85 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRING_BOUNCE,
  },
};

// List stagger variants
export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRING_SNAPPY,
  },
};

// Hover effects
export const hoverScale = {
  scale: 1.02,
  y: -2,
  transition: SPRING_SNAPPY,
};

export const hoverTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// Fade variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// Scale variants
export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: SPRING_BOUNCE,
  },
};

// Confetti colors
export const CONFETTI_COLORS = [
  "#FFD700", // Gold
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Light Gold
  "#BB8FCE", // Purple
];
