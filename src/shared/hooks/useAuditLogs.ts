import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/hub-client";

// Mapeado pra view `api.audit_log` do HUB (lyoig).
// Colunas reais: id, ts, tool, agent_identity, decision, approval_id, args_hash.
// Adaptamos pro shape antigo (AuditLog) pra não quebrar o viewer.
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface UseAuditLogsOptions {
  entityType?: string;
  action?: string;
  limit?: number;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const { entityType, action, limit = 50 } = options;

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", entityType, action, limit],
    queryFn: async () => {
      // HUB expõe a view no schema `api` (default do PostgREST do projeto).
      const client: any = supabase;
      let query = client
        .from("audit_log")
        .select("id,ts,tool,agent_identity,decision,approval_id,args_hash")
        .order("ts", { ascending: false })
        .limit(limit);

      if (entityType) query = query.eq("tool", entityType);
      if (action) query = query.eq("decision", action);

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((r: any): AuditLog => ({
        id: r.id,
        user_id: r.agent_identity ?? null,
        action: r.decision ?? "info",
        entity_type: r.tool ?? "tool",
        entity_id: r.approval_id ?? null,
        details: r.args_hash ? { args_hash: r.args_hash } : null,
        ip_address: null,
        user_agent: null,
        created_at: r.ts,
      }));
    },
  });

  return {
    logs: logs || [],
    isLoading,
    refetch,
  };
}

// Escrita de audit_log no HUB fica por conta do broker/edge; no cliente é no-op seguro.
export async function createAuditLog(_log: Partial<AuditLog>) {
  // intencionalmente vazio — a view `api.audit_log` é read-only pelo anon.
}
