// Auto-atualização do HUB — dispara ao montar, em intervalo e ao voltar visível.
import { useEffect, useRef } from "react";
import { hubAuth } from "@/integrations/supabase/hub-client";
import { trackAction, logWarn } from "@/lib/buttonLog";
import { abacusApi } from "@/services/abacus-client";

export type HubDeployState = 'SENSOR_BLOCKED' | 'PENDING' | 'QUEUED' | 'RUNNING' | 'FAILED' | 'AWAIT_RUNTIME_PROOF';
export interface HubDeploySnapshot {
  state: HubDeployState;
  mainSha?: string;
  runId?: number | null;
  runStatus?: string;
  conclusion?: string | null;
  runUrl?: string | null;
  workflowUrl?: string;
  runtimeProof: false;
  verifiedAt: string;
  reason?: string | null;
}

export interface UseHubAutoRefreshOpts {
  intervalMs?: number;
  onDeploy?: (deploy: HubDeploySnapshot) => void;
  onStatus?: (s: Awaited<ReturnType<typeof abacusApi.status>>) => void;
  onModels?: (m: Awaited<ReturnType<typeof abacusApi.models>>) => void;
}

export function useHubAutoRefresh({ intervalMs = 60_000, onStatus, onModels, onDeploy }: UseHubAutoRefreshOpts = {}) {
  const running = useRef(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted || running.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      running.current = true;
      try {
        await trackAction("hub:auto:status", async () => {
          const s = await abacusApi.status();
          if (mounted) onStatus?.(s);
          return { status: 200, ok: true };
        }).catch(() => {});

        // hubAuth é o único client com persistSession: true — mesmo bug do useAuth.ts:
        // hubClient nunca hidrata sessão do storage, então getSession() sempre voltava null aqui.
        const { data: { session } } = await hubAuth.auth.getSession();
        if (!session?.access_token) {
          logWarn("hub:auto:models", "Pulado — sem sessão ativa. Faça login para carregar modelos.");
          if (mounted) onDeploy?.({ state: 'SENSOR_BLOCKED', reason: 'HUB_AUTH_REQUIRED', runtimeProof: false, verifiedAt: new Date().toISOString() });
        } else {
          // HUB deploy radar: mounted, every minute and on visibility regain.
          // Uses the existing hub-read authenticated function; no GitHub token in browser.
          try {
            const { data, error } = await hubAuth.functions.invoke('hub-read', {
              method: 'POST', body: { scope: 'deploy' },
            });
            if (error || !data?.deploy?.state) throw new Error('HUB_DEPLOY_READ_UNAVAILABLE');
            if (mounted) onDeploy?.(data.deploy as HubDeploySnapshot);
          } catch {
            if (mounted) onDeploy?.({ state: 'SENSOR_BLOCKED', reason: 'HUB_DEPLOY_READ_UNAVAILABLE', runtimeProof: false, verifiedAt: new Date().toISOString() });
          }
          await trackAction("hub:auto:models", async () => {
            const m = await abacusApi.models();
            if (mounted) onModels?.(m);
            return { status: 200, ok: true, count: m.length };
          }).catch(() => {});
        }
      } finally {
        running.current = false;
      }
    };

    void run();
    const iv = intervalMs > 0 ? setInterval(run, intervalMs) : null;
    const onVis = () => !document.hidden && void run();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mounted = false;
      if (iv) clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);
}
