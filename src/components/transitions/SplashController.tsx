import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { playSplash, SplashStyle } from "@/components/transitions/PageSplash";

/**
 * Configuração por rota/menu. Salva em system_settings.key = 'splash_config'.
 *
 * Formato:
 * {
 *   "default":            { "style": "flash", "duration": 750 },
 *   "/telepainel/dashboard": { "style": "fade", "duration": 500 },
 *   "menu:logout":        { "style": "wipe", "duration": 600 }
 * }
 *
 * Chave de lookup (em ordem de prioridade):
 *  1. data-splash-key no elemento clicado (ex.: "menu:logout")
 *  2. pathname exato (ex.: "/telepainel/bots")
 *  3. "default"
 */

export interface SplashEntry {
  style?: SplashStyle;
  duration?: number;
}
export type SplashConfigMap = Record<string, SplashEntry>;

const DEFAULT_FALLBACK: SplashEntry = { style: "flash", duration: 750 };

// Cache em módulo — evita re-fetch a cada render.
let cachedConfig: SplashConfigMap = { default: DEFAULT_FALLBACK };
const subscribers = new Set<(cfg: SplashConfigMap) => void>();

function notify() {
  subscribers.forEach((cb) => cb(cachedConfig));
}

async function loadConfig() {
  try {
    const { data } = await supabase
      .from("system_settings" as any)
      .select("value")
      .eq("key", "splash_config")
      .maybeSingle();
    if (data && (data as any).value) {
      cachedConfig = { default: DEFAULT_FALLBACK, ...((data as any).value as SplashConfigMap) };
      notify();
    }
  } catch {
    /* silencioso — usa fallback */
  }
}

export async function saveSplashConfig(next: SplashConfigMap) {
  cachedConfig = { default: DEFAULT_FALLBACK, ...next };
  notify();
  await supabase
    .from("system_settings" as any)
    .upsert({ key: "splash_config", value: next as any }, { onConflict: "key" });
}

export function getSplashConfig(): SplashConfigMap {
  return cachedConfig;
}

export function subscribeSplashConfig(cb: (cfg: SplashConfigMap) => void) {
  subscribers.add(cb);
  cb(cachedConfig);
  return () => {
    subscribers.delete(cb);
  };
}

function resolveEntry(lookupKey: string | null, pathname: string): SplashEntry {
  const cfg = cachedConfig;
  if (lookupKey && cfg[lookupKey]) return cfg[lookupKey];
  if (cfg[pathname]) return cfg[pathname];
  return cfg.default ?? DEFAULT_FALLBACK;
}

/**
 * Detecta se o clique foi dentro de uma área "de menu" — Sidebar, BottomNav, Header,
 * ou qualquer elemento marcado com data-splash="true".
 *
 * Retorna { key } pra lookup, ou null se não deve disparar.
 */
function detectMenuClick(target: EventTarget | null): { key: string | null } | null {
  if (!(target instanceof Element)) return null;

  // 1) Atributo explícito
  const explicit = target.closest("[data-splash]");
  if (explicit) {
    const val = explicit.getAttribute("data-splash");
    if (val === "false") return null;
    const key = explicit.getAttribute("data-splash-key");
    return { key };
  }

  // 2) Detecção automática: dentro de <aside>, <nav>, <header>, ou data-splash-zone
  const zone = target.closest(
    "aside, nav, header, [data-splash-zone], [data-sidebar], [data-bottom-nav]",
  );
  if (!zone) return null;

  // Só dispara se o clique foi num botão/link (evita disparar em qualquer pixel da nav).
  const interactive = target.closest("a, button, [role='button'], [role='menuitem']");
  if (!interactive) return null;

  const key = interactive.getAttribute("data-splash-key");
  return { key };
}

/**
 * Componente sem UI — apenas instala listeners globais.
 * Monte uma vez no App (logo abaixo do PageSplash).
 */
export function SplashController() {
  const location = useLocation();
  const lastPath = useRef(location.pathname);
  const firstRender = useRef(true);

  // Carrega config 1x + escuta realtime do system_settings.
  useEffect(() => {
    loadConfig();
    const ch = supabase
      .channel("splash_config_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: "key=eq.splash_config" },
        () => loadConfig(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  // Dispara splash ao trocar de rota.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;
    const entry = resolveEntry(null, location.pathname);
    playSplash({ style: entry.style, duration: entry.duration, key: `route:${location.pathname}` });
  }, [location.pathname]);

  // Dispara splash em cliques de menu (mesmo sem trocar de rota).
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Ignora cliques com modificadores (abrir em nova aba etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const hit = detectMenuClick(e.target);
      if (!hit) return;
      const entry = resolveEntry(hit.key, location.pathname);
      playSplash({ style: entry.style, duration: entry.duration, key: hit.key ?? "menu-click" });
    };
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true } as any);
  }, [location.pathname]);

  return null;
}
