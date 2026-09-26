import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOUR_STEPS, TOUR_STEPS_MOBILE, type TourStep } from "./tour-steps";

const STORAGE_KEY = "multizap-guided-tour-v1";

// Eventos globais pra abrir/refazer o tour de qualquer tela.
export const GUIDED_TOUR_EVENT = "multizap:guided-tour:open";

export function openGuidedTour() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(GUIDED_TOUR_EVENT));
}

type Rect = { top: number; left: number; width: number; height: number };

function getRect(target: string | null): Rect | null {
  if (!target || typeof document === "undefined") return null;
  const el = document.querySelector(target) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function GuidedTour() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta primeiro acesso: se nada no localStorage, abre sozinho.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Pequeno delay pra dar tempo do layout montar.
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Escuta evento global pra reabrir.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => { setIndex(0); setOpen(true); };
    window.addEventListener(GUIDED_TOUR_EVENT, handler);
    return () => window.removeEventListener(GUIDED_TOUR_EVENT, handler);
  }, []);

  // Detecta mobile.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mobile usa um roteiro reduzido que navega de verdade entre as rotas
  // (sem depender de seletores da sidebar, que fica escondida no celular).
  const steps = isMobile ? TOUR_STEPS_MOBILE : TOUR_STEPS;
  const step: TourStep | undefined = steps[index];

  // Navega pra rota do passo (se tiver).
  useEffect(() => {
    if (!open || !step?.route) return;
    if (loc.pathname !== step.route) {
      navigate({ to: step.route });
    }
  }, [open, step?.route]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recalcula posição do alvo (com retry caso o elemento ainda não exista).
  useLayoutEffect(() => {
    if (!open || !step) return;
    let cancelled = false;
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      const r = getRect(step.target);
      setRect(r);
      // Se alvo ainda não apareceu, tenta de novo até 20x.
      if (!r && step.target && tries < 20) {
        tries++;
        setTimeout(tick, 100);
      }
    };
    tick();

    const onChange = () => setRect(getRect(step.target));
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [open, step, index, loc.pathname]);

  const total = steps.length;

  // Se trocar entre mobile/desktop no meio do tour, garante que o índice não passa do fim.
  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [total, index]);

  function finish() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }
    setOpen(false);
    setIndex(0);
  }

  function next() {
    if (index >= total - 1) return finish();
    setIndex((i) => i + 1);
  }
  function prev() {
    if (index === 0) return;
    setIndex((i) => i - 1);
  }

  // Calcula posição do popover relativo ao alvo.
  const popoverStyle = useMemo<React.CSSProperties>(() => {
    if (!step || step.placement === "center" || !rect || isMobile) {
      return {};
    }
    const margin = 14;
    const popW = 320;
    const popH = 170;
    let top = rect.top;
    let left = rect.left + rect.width + margin;
    let placement = step.placement ?? "right";

    if (placement === "right") {
      top = rect.top + rect.height / 2 - popH / 2;
      left = rect.left + rect.width + margin;
      // Se sair da tela à direita, joga pra esquerda.
      if (left + popW > window.innerWidth - 8) {
        left = rect.left - popW - margin;
      }
    } else if (placement === "left") {
      top = rect.top + rect.height / 2 - popH / 2;
      left = rect.left - popW - margin;
    } else if (placement === "bottom") {
      top = rect.top + rect.height + margin;
      left = rect.left + rect.width / 2 - popW / 2;
    } else if (placement === "top") {
      top = rect.top - popH - margin;
      left = rect.left + rect.width / 2 - popW / 2;
    }

    // Garante que não sai da tela.
    top = Math.max(8, Math.min(top, window.innerHeight - popH - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));

    return { top, left, width: popW };
  }, [rect, step, isMobile]);

  if (!open || !step) return null;

  const isCenter = step.placement === "center" || !rect || isMobile;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
        aria-live="polite"
      >
        {/* Overlay escurecido + spotlight */}
        {rect && !isCenter ? (
          <motion.div
            key={`spot-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute rounded-xl pointer-events-auto"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
              transition: "all 250ms cubic-bezier(0.4,0,0.2,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          // Sem alvo (welcome/done/mobile): fundo escuro inteiro.
          <div className="absolute inset-0 bg-black/65 pointer-events-auto" />
        )}

        {/* Popover (card do tour) */}
        <motion.div
          key={`pop-${index}`}
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "absolute pointer-events-auto rounded-2xl bg-card text-card-foreground border shadow-2xl ring-1 ring-black/5",
            isCenter
              ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,360px)]"
              : "",
            isMobile && !isCenter ? "left-3 right-3 bottom-4 w-auto" : "",
          )}
          style={!isCenter && !isMobile ? popoverStyle : undefined}
        >
          <div className="p-5">
            <h3 className="text-base font-bold tracking-tight">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>

          <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-muted-foreground">
                {index + 1} de {total}
              </span>
              <button
                type="button"
                onClick={finish}
                className="rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition active:bg-muted"
              >
                Pular tour
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size={isMobile ? "default" : "sm"}
                variant="outline"
                onClick={prev}
                disabled={index === 0}
                className={isMobile ? "min-h-11" : ""}
              >
                Anterior
              </Button>
              <Button
                size={isMobile ? "default" : "sm"}
                onClick={next}
                className={isMobile ? "min-h-11" : ""}
              >
                {index >= total - 1 ? "Concluir" : "Próximo"}
              </Button>
            </div>
          </div>

          {/* Barrinha de progresso */}
          <div className="h-1 w-full overflow-hidden rounded-b-2xl bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${((index + 1) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
