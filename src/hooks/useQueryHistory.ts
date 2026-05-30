import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import type { Json } from "@/integrations/supabase/types";

export interface QueryHistoryItem {
  id: string;
  query_type: string;
  query_input: string;
  query_result: Json;
  status: string | null;
  created_at: string;
}

interface UseQueryHistoryReturn {
  history: QueryHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addToHistory: (item: Omit<QueryHistoryItem, 'id' | 'created_at'>) => void;
}

export function useQueryHistory(limit: number = 50): UseQueryHistoryReturn {
  const { user } = useAuthContext();
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("query_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (queryError) {
        throw queryError;
      }

      setHistory(data || []);
    } catch (err) {
      console.error("Error fetching query history:", err);
      setError("Erro ao carregar histórico");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addToHistory = useCallback((item: Omit<QueryHistoryItem, 'id' | 'created_at'>) => {
    // Optimistically add to local state
    const newItem: QueryHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    
    setHistory((prev) => [newItem, ...prev.slice(0, limit - 1)]);
  }, [limit]);

  return {
    history,
    isLoading,
    error,
    refresh: fetchHistory,
    addToHistory,
  };
}
