import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/hub-client";

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
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq("entity_type", entityType);
      }

      if (action) {
        query = query.eq("action", action);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLog[];
    },
  });

  return {
    logs: logs || [],
    isLoading,
    refetch,
  };
}

export async function createAuditLog(log: Partial<AuditLog>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from("audit_logs")
    .insert({
      user_id: user?.id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      details: log.details,
    });

  if (error) {
    console.error("Error creating audit log:", error);
  }
}
