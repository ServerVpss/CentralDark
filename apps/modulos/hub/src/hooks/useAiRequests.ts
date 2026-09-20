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

export interface UseAiRequestsOptions {
  pageSize?: number;
}

export function useAiRequests({ pageSize = 25 }: UseAiRequestsOptions = {}) {
  const [rows, setRows] = useState<AiRequest[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<AiRequestFilter>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [page, setPage] = useState(0);

  // reset page ao mudar filtros
  useEffect(() => {
    setPage(0);
  }, [filter, modelFilter]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      let q = hubClient
        .from('ai_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filter === 'success') q = q.eq('status', 'success').eq('fallback_used', false);
      else if (filter === 'fallback') q = q.eq('fallback_used', true);
      else if (filter === 'error') q = q.eq('status', 'error');
      if (modelFilter !== 'all') q = q.eq('model', modelFilter);

      const { data, error: err, count } = await q;
      if (err) throw err;
      setRows((data || []) as AiRequest[]);
      setTotal(count ?? 0);
    } catch (e: any) {
      setError(e.message || 'Falha ao buscar ai_requests');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, modelFilter, page, pageSize]);

  const fetchModels = useCallback(async () => {
    // pega distinct dos últimos 500 registros — barato e suficiente pra popular select
    const { data } = await hubClient
      .from('ai_requests')
      .select('model')
      .order('created_at', { ascending: false })
      .limit(500);
    const uniq = Array.from(
      new Set(((data || []) as { model: string | null }[]).map((r) => r.model).filter(Boolean) as string[]),
    ).sort();
    setModels(uniq);
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows,
    total,
    models,
    loading,
    error,
    filter,
    setFilter,
    modelFilter,
    setModelFilter,
    page,
    setPage,
    pageSize,
    totalPages,
    refresh: () => {
      fetchRows();
      fetchModels();
    },
  };
}
