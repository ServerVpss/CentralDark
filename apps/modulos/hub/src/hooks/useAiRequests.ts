import { useCallback, useEffect, useState } from 'react';
import { hubClient } from '@/integrations/supabase/hub-client';

export interface AiRequest {
  id: string;
  model: string | null;
  status: string | null;
  latency_ms: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  fallback_used: boolean | null;
  error: string | null;
  created_at: string;
}

export type AiRequestFilter = 'all' | 'success' | 'fallback' | 'error';

export function useAiRequests(limit = 100) {
  const [rows, setRows] = useState<AiRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AiRequestFilter>('all');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = hubClient
        .from('ai_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filter === 'success') q = q.eq('status', 'success').eq('fallback_used', false);
      else if (filter === 'fallback') q = q.eq('fallback_used', true);
      else if (filter === 'error') q = q.eq('status', 'error');

      const { data, error: err } = await q;
      if (err) throw err;
      setRows((data || []) as AiRequest[]);
    } catch (e: any) {
      setError(e.message || 'Falha ao buscar ai_requests');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter, limit]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return { rows, loading, error, filter, setFilter, refresh: fetchRows };
}
