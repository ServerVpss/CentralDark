import { useEffect, useRef, useState } from "react";

export type VersionInfo = {
  version: string;
  enabled: boolean;
  intervalSeconds: number;
  forceToken: string;
};

/** Pergunta ao servidor se há nova versão. Compara com a versão original e dispara updateAvailable. */
export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const initialVersion = useRef<string | null>(null);
  const initialForceToken = useRef<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/public/version", { cache: "no-store" });
        if (!res.ok) return scheduleNext(60);
        const info = (await res.json()) as VersionInfo;
        if (cancelled) return;

        if (initialVersion.current == null) {
          initialVersion.current = info.version;
          initialForceToken.current = info.forceToken;
        } else if (info.enabled) {
          if (info.version !== initialVersion.current) setUpdateAvailable(true);
          if (info.forceToken && info.forceToken !== initialForceToken.current) {
            setForceUpdate(true);
            setUpdateAvailable(true);
          }
        }
        scheduleNext(Math.max(15, Math.min(600, info.intervalSeconds || 60)));
      } catch {
        scheduleNext(60);
      }
    };

    const scheduleNext = (sec: number) => {
      if (cancelled) return;
      timer = setTimeout(check, sec * 1000);
    };

    void check();

    const onVisibility = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { updateAvailable, forceUpdate };
}
