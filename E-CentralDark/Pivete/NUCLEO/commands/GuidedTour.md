# COMANDO - GuidedTour.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\onboarding\GuidedTour.tsx
**SHA:** 2ee0bc2b987386ce
**Timestamp:** 2026-08-26T19:31:08.831156
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
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
    } else if (placement === "le
```