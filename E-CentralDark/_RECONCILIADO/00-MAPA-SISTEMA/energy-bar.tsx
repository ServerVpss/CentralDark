// Barra de energia animada (motion graphics) — efeito realista de carregamento.
// Uso: <EnergyBar /> ou <EnergyBar fullscreen label="Carregando backups" />
// Pode receber `value` (0-100) para mostrar progresso real; sem value, anima sozinho.

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type EnergyBarProps = {
  value?: number;            // 0-100. Se omitido, anima em loop estilo "carregando"
  label?: string;
  sublabel?: string;
  fullscreen?: boolean;
  className?: string;
  height?: number;           // px
};

export function EnergyBar({
  value,
  label = "Carregando",
  sublabel,
  fullscreen = false,
  className,
  height = 14,
}: EnergyBarProps) {
  const indeterminate = value === undefined;
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  // Modo determinado: anima até value com easing realista (acelera e desacelera).
  useEffect(() => {
    if (indeterminate) return;
    const controls = animate(mv, value!, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, indeterminate, mv]);

  // Modo indeterminado: simula carregamento orgânico (cresce devagar, dá "pulinhos").
  useEffect(() => {
    if (!indeterminate) return;
    let cancelled = false;
    let target = 0;
    const tick = async () => {
      while (!cancelled) {
        // Avança em saltos irregulares e desacelera perto de 92% (efeito real)
        const remaining = 95 - target;
        const step = Math.max(2, remaining * (0.05 + Math.random() * 0.1));
        target = Math.min(95, target + step);
        await animate(mv, target, {
          duration: 0.4 + Math.random() * 0.5,
          ease: "easeOut",
        }).finished;
        await new Promise((r) => setTimeout(r, 150 + Math.random() * 350));
        if (target >= 95) {
          // Recomeça pra dar sensação de "ciclo" sem nunca terminar
          await new Promise((r) => setTimeout(r, 600));
          target = 0;
          await animate(mv, 0, { duration: 0.2 }).finished;
        }
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [indeterminate, mv]);

  useEffect(() => mv.on("change", (v) => setDisplay(v)), [mv]);

  const widthPct = useTransform(mv, (v) => `${v}%`);

  const content = (
    <div className={cn("w-full max-w-md flex flex-col items-stretch gap-3", className)}>
      {/* Label superior */}
      <div className="flex items-baseline justify-between">
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-foreground tracking-wide"
        >
          {label}
          <motion.span
            aria-hidden
            className="inline-block ml-0.5"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
          >
            …
          </motion.span>
        </motion.span>
        <span className="text-xs font-mono tabular-nums text-muted-foreground">
          {Math.round(display)}%
        </span>
      </div>

      {/* Trilho da barra */}
      <div
        className="relative w-full overflow-hidden rounded-full bg-muted/60 ring-1 ring-border/60"
        style={{ height }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(display)}
        aria-label={label}
      >
        {/* Grade interna (textura "elétrica") */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0 6px, hsl(var(--border)) 6px 7px)",
          }}
        />

        {/* Preenchimento (gradiente verde com glow) */}
        <motion.div
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: widthPct,
            background:
              "linear-gradient(90deg, hsl(142 70% 35%) 0%, hsl(142 76% 50%) 50%, hsl(160 80% 55%) 100%)",
            boxShadow:
              "0 0 12px hsl(142 76% 50% / 0.65), inset 0 0 6px hsl(160 80% 70% / 0.45)",
          }}
        >
          {/* Shimmer percorrendo a barra */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 w-1/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
              mixBlendMode: "screen",
            }}
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* "Faísca" na ponta */}
          <motion.div
            aria-hidden
            className="absolute right-0 top-1/2 -translate-y-1/2 h-full aspect-square rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(167,243,208,0.6) 40%, transparent 70%)",
              filter: "blur(2px)",
            }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.25, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Pulsos verticais (efeito energia) */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(74,222,128,0.08) 50%, transparent 100%)",
          }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {sublabel && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-muted-foreground text-center"
        >
          {sublabel}
        </motion.p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-screen w-full items-center justify-center bg-background px-6"
      >
        {content}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex w-full items-center justify-center py-6 px-4">
      {content}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default EnergyBar;
