import { useState, useEffect } from 'react';
import { hubClient } from '@/integrations/supabase/hub-client';

export function useAudit(page = 0, pageSize = 20) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await hubClient
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (!error) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, [page, pageSize]);

  return { logs, loading };
}