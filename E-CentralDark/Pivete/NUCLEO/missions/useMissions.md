# MISSAO - useMissions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\hub\src\hooks\useMissions.ts
**SHA:** db2b621d12a5108c
**Timestamp:** 2026-08-28T02:56:29.026503
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- risk: 'R0' | 'R1' | 'R2' | 'R3' | 'R4';

### Ouro Bruto (primeiros 5000 chars)
```
import { useState, useEffect, useCallback } from 'react';
import { hubClient } from '@/integrations/supabase/hub-client';

export interface HubMission {
  id: string;
  title: string;
  creator?: string | null;
  agent: string;
  target?: string | null;
  state: 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
  authorization: 'pending' | 'approved' | 'denied';
  branch_sha?: string | null;
  risk: 'R0' | 'R1' | 'R2' | 'R3' | 'R4';
  rollback?: string | null;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 20;

export function useMissions(pageSize = PAGE_SIZE) {
  const [missions, setMissions] = useState<HubMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = (page - 1) * pageSize;
    const { data, error: err, count } = await hubClient
      .from('hub_missions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (err) {
      setError(err.message);
    } else {
      setMissions((data || []) as HubMission[]);
      setTotalPages(Math.max(1, Math.ceil((count || 0) / pageSize)));
    }
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    page,
    totalPages,
    setPage,
    refresh: fetchMissions,
  };
}

```