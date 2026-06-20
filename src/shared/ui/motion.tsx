import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  SPRING_SNAPPY,
  CONFETTI_COLORS,
} from "@/lib/animations";

// Page transition variants
const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
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
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.85 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

// List stagger variants
const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

// Hover effects
const hoverScale = {
  scale: 1.02,
  y: -2,
  transition: SPRING_SNAPPY,
};

const hoverTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// MotionPage - Wrapper for page transitions
interface MotionPageProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export const MotionPage = forwardRef<HTMLDivElement, MotionPageProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionPage.displayName = "MotionPage";

// MotionCard - Card with animated entry and hover
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, delay = 0, ...props }, ref) => {
    const delayedVariants: Variants = {
      hidden: { opacity: 0, y: 30, scale: 0.85 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={delayedVariants}
        whileHover={hoverScale}
        whileTap={hoverTap}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

// MotionList - Container with staggered children
interface MotionListProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export const MotionList = forwardRef<HTMLDivElement, MotionListProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={listVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionList.displayName = "MotionList";

// MotionItem - List item with animation
interface MotionItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export const MotionItem = forwardRef<HTMLDivElement, MotionItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={listItemVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionItem.displayName = "MotionItem";

// MotionHover - Wrapper for hover and tap effects
interface MotionHoverProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export const MotionHover = forwardRef<HTMLDivElement, MotionHoverProps>(
  ({ children, className, scale = 1.02, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale, y: -2, transition: SPRING_SNAPPY }}
        whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionHover.displayName = "MotionHover";

// MotionFadeIn - Simple fade in animation
interface MotionFadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const MotionFadeIn = forwardRef<HTMLDivElement, MotionFadeInProps>(
  ({ children, className, delay = 0, ...props }, ref) => {
    const fadeVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1], delay },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionFadeIn.displayName = "MotionFadeIn";

// MotionSuccess - For success states with bounce
interface MotionSuccessProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export const MotionSuccess = forwardRef<HTMLDivElement, MotionSuccessProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 15,
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionSuccess.displayName = "MotionSuccess";

// Re-export for convenience
export { CONFETTI_COLORS };
