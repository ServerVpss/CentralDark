import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Estado global por storageKey: garante que a intro NUNCA trave por
 * causa de re-render/re-mount. Uma vez fechada, fica fechada.
 */
const closedInThisLoad = new Set<string>();

/**
 * Intro estilo Jarvis.
 * - Mostra só na 1ª visita da sessão (sessionStorage) + 1 vez por carregamento.
 * - Auto-fecha em ~2.2s com salvaguarda absoluta (timer não é cancelado em re-mount).
 */
export function IntroAnimation({
  brandName = "MultiZap",
  durationMs = 2200,
  storageKey = "landing-intro-seen",
}: { brandName?: string; durationMs?: number; storageKey?: string }) {
  const [show, setShow] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Já foi fechada nesse carregamento — não reabre nunca.
    if (closedInThisLoad.has(storageKey)) return;

    const dur = Math.max(500, Math.min(15000, Number.isFinite(durationMs) ? durationMs : 2200));

    try {
      const seen = sessionStorage.getItem(storageKey);
      if (seen) {
        closedInThisLoad.add(storageKey);
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // ignora
    }

    setShow(true);
    // Timer NÃO cancelado no cleanup — garante fechamento mesmo se houver re-mount.
    window.setTimeout(() => {
      closedInThisLoad.add(storageKey);
      setShow(false);
    }, dur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se o componente remontar depois de fechar, mantém fechado.
  if (closedInThisLoad.has(storageKey) && !show) return null;



  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="landing-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          aria-hidden="true"
        >
          {/* Grade animada de fundo */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.18]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--primary) / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.6) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Anéis pulsantes */}
          <div className="relative flex h-44 w-44 items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.4, opacity: 0.55 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{
                  duration: 1.6,
                  ease: "easeOut",
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
                className="absolute inset-0 rounded-full border border-primary/60"
              />
            ))}
            {/* Núcleo */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_0_60px_-5px_hsl(var(--primary))]"
            >
              <Sparkles className="h-10 w-10" />
            </motion.div>
          </div>

          {/* Marca + barra de progresso */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <span className="text-2xl font-extrabold tracking-tight">{brandName}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Inicializando sistema
            </span>
            <div className="mt-2 h-[3px] w-44 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
                className="h-full w-1/2 rounded-full bg-primary"
              />
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
