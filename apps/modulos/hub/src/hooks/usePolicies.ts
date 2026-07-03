import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/hub-client';
import type { Policy } from '@/types/policies';

const CACHE_KEY = 'hub_policies_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
  data: Policy[];
  timestamp: number;
}

function getCached(): Policy[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(data: Policy[]) {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* quota excedida, ignora */ }
}

export function usePolicies() {
  const [policies, setPolicies] = useState<Policy[]>(() => getCached() || []);
  const [loading, setLoading] = useState(!getCached());
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw new Error(err.message);
      const typed = (data || []) as Policy[];
      setPolicies(typed);
      setCache(typed);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar políticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getCached()) fetchPolicies();
  }, [fetchPolicies]);

  return { policies, loading, error, refetch: fetchPolicies };
}
