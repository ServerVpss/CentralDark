import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { useCurrentWorkspace } from "@/hooks/use-workspace";

export type WorkspaceControls = {
  workspace_id: string;
  is_paused: boolean;
  paused_reason: string | null;
  block_whatsapp_send: boolean;
  block_ai: boolean;
  block_campaigns: boolean;
  block_new_signups: boolean;
  banner_enabled: boolean;
  banner_text: string | null;
  banner_level: "info" | "warning" | "danger";
  subscription_status: "active" | "past_due" | "expired" | "suspended" | "trialing";
};

export function useWorkspaceControls() {
  const { data: ws } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.workspaceControls(ws?.id),
    enabled: !!ws?.id,
    refetchInterval: 30_000,
    queryFn: async (): Promise<WorkspaceControls | null> => {
      const { data } = await supabase
        .from("workspace_controls")
        .select("*")
        .eq("workspace_id", ws!.id)
        .maybeSingle();
      return (data as WorkspaceControls) ?? null;
    },
  });
}
