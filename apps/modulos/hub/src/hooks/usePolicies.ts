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

  // api.policies é uma VIEW somente leitura de hub.policies (sistema PDP oficial).
  // Não existe RPC de escrita publicada para o schema api — edição real é feita
  // diretamente em hub.policies pelo banco. Lançamos erro amigável em vez de
  // deixar o INSERT/UPDATE/DELETE falhar silenciosamente contra a view.
  const addPolicy = async (_policy: Partial<Policy>) => {
    throw new Error('Edição de políticas ainda não disponível nesta versão — sistema PDP é gerenciado via hub.policies diretamente');
  };

  const updatePolicy = async (_id: string, _updates: Partial<Policy>) => {
    throw new Error('Edição de políticas ainda não disponível nesta versão — sistema PDP é gerenciado via hub.policies diretamente');
  };

  const deletePolicy = async (_id: string) => {
    throw new Error('Edição de políticas ainda não disponível nesta versão — sistema PDP é gerenciado via hub.policies diretamente');
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