import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/hub-client";

export interface McpConnector {
  name: string;
  level: "ok" | "warn" | "error" | string;
  detail?: string;
  latencyMs?: number;
}

export interface McpToolGroup {
  name: string;
  count: number;
}

export interface McpOAuthToken {
  id: string;
  type?: string;
  clientId?: string;
  login?: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface McpStatus {
  ok: boolean;
  service?: string;
  version?: string;
  uptimeSec?: number;
  time?: string;
  catalog?: { toolCount: number; catalogVersion: string; groups?: McpToolGroup[] };
  catalogDiff?: { level: string; detail: string };
  connectors?: McpConnector[];
  auth?: {
    clients?: number | any[];
    accessTokens?: number | any[];
    refreshTokens?: number | any[];
    authCodes?: number | any[];
    sessions?: number | any[];
    uniqueGhLogins?: string[];
    tokens?: McpOAuthToken[];
  };
  // raw passthrough
  [key: string]: any;
}

const STATUS_URL = "https://mcp.centralldark.com/status.json";

export function useMcpStatus(intervalMs = 30_000) {
  const [data, setData] = useState<McpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setError(null);
    try {
      // Tenta fetch direto (CORS deve estar liberado conforme briefing)
      let json: any | null = null;
      try {
        const r = await fetch(STATUS_URL, { cache: "no-store" });
        if (r.ok) json = await r.json();
      } catch {
        /* cai no proxy */
      }
      // Fallback via edge proxy (resolve CORS se bloqueado)
      if (!json) {
        const { data: proxied, error: pErr } = await supabase.functions.invoke("mcp-status-proxy");
        if (pErr) throw pErr;
        json = proxied;
      }
      setData(json as McpStatus);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, intervalMs);
    return () => clearInterval(t);
  }, [fetchStatus, intervalMs]);

  return { data, loading, error, lastUpdated, refresh: fetchStatus };
}
