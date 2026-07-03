import { useState, useEffect, useCallback } from 'react';
import { hubClient as supabase } from '@/integrations/supabase/hub-client';
import type { Policy } from '@/types/policies';

export type { Policy };

const CACHE_KEY = 'hub_policies_cache';
const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry {
  data: Policy[];
  timestamp: number;
}

function getCached(): Policy[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch { return null; }
}

function setCached(data: Policy[]) {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { }
}

export function usePolicies() {
  const [policies, setPolicies] = useState<Policy[]>(() => getCached() || []);
  const [loading, setLoading] = useState(!getCached());
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setPolicies(data || []);
      setCached(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPolicy = async (policy: Partial<Policy>) => {
    const { data, error: err } = await supabase.from('policies').insert([policy]).select().single();
    if (err) throw err;
    await fetchPolicies();
    return data;
  };

  const updatePolicy = async (id: string, updates: Partial<Policy>) => {
    const { error: err } = await supabase.from('policies').update(updates).eq('id', id);
    if (err) throw err;
    await fetchPolicies();
  };

  const deletePolicy = async (id: string) => {
    const { error: err } = await supabase.from('policies').delete().eq('id', id);
    if (err) throw err;
    await fetchPolicies();
  };

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    loading,
    error,
    addPolicy,
    updatePolicy,
    deletePolicy,
    refresh: fetchPolicies
  };
}