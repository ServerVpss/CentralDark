import { useState, useEffect, useRef } from 'react';

interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  is_deprecated: boolean;
  health_status?: 'healthy' | 'degraded' | 'down';
  last_health_check?: string;
}

interface MCPSyncRun {
  id: string;
  status: string;
  started_at: string;
  finished_at: string;
  tools_found: number;
  tools_added: number;
  tools_updated: number;
}

interface UseMCPReturn {
  tools: MCPTool[];
  syncRuns: MCPSyncRun[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

let cache: { tools: MCPTool[]; syncRuns: MCPSyncRun[]; timestamp: number } | null = null;

export function useMCP(): UseMCPReturn {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [syncRuns, setSyncRuns] = useState<MCPSyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const mountedRef = useRef(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        setTools(cache.tools);
        setSyncRuns(cache.syncRuns);
        setLoading(false);
        return;
      }

      const [toolsRes, syncRes] = await Promise.all([
        fetch('/api/hub/tools'),
        fetch('/api/hub/sync-runs?limit=10'),
      ]);

      if (!toolsRes.ok || !syncRes.ok) {
        throw new Error('Falha ao carregar dados do MCP');
      }

      const toolsData: MCPTool[] = await toolsRes.json();
      const syncData: MCPSyncRun[] = await syncRes.json();

      cache = { tools: toolsData, syncRuns: syncData, timestamp: Date.now() };

      if (mountedRef.current) {
        setTools(toolsData);
        setSyncRuns(syncData);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const syncNow = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/hub/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao iniciar sincronização');
      cache = null;
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, []);

  return { tools, syncRuns, loading, error, refetch: fetchData, syncNow, isSyncing };
}
