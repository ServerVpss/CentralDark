import { useState, useEffect, useCallback } from 'react';
import { hubClient } from '@/integrations/supabase/hub-client';
import type { AuditLog } from '@/types/audit';

const PAGE_SIZE = 20;

export function useAudit(pageSize = PAGE_SIZE) {
  const [entries, setEntries] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); // 1-based (a UI mostra "Página X de Y")
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = (page - 1) * pageSize;
    const { data, error: err, count } = await hubClient
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (err) {
      setError(err.message);
    } else {
      setEntries((data || []) as AuditLog[]);
      setTotalPages(Math.max(1, Math.ceil((count || 0) / pageSize)));
    }
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    entries,
    logs: entries, // alias de compatibilidade
    loading,
    error,
    page,
    totalPages,
    setPage,
    refresh: fetchLogs,
  };
}
