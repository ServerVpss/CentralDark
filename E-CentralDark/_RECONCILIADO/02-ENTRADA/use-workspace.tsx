import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { assertSameEpoch, getSessionEpoch } from "@/lib/session-epoch";
import { useAuth } from "./use-auth";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
};

export type Membership = Workspace & { role: "admin" | "agent" };

export function useCurrentWorkspace() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.currentWorkspace(user?.id),
    enabled: !!user,
    retry: (failureCount, err) =>
      (err as Error)?.name !== "StaleSessionError" && failureCount < 2,
    queryFn: async (): Promise<Membership | null> => {
      // Race guard: descarta resposta se o usuário trocou no meio da request.
      const startEpoch = getSessionEpoch();

      // !inner garante que memberships órfãs (workspace deletado) sejam ignoradas.
      const { data, error } = await supabase
        .from("workspace_members")
        .select("role, created_at, workspace:workspaces!inner(id, name, slug, owner_id)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      assertSameEpoch(startEpoch);

      if (error) throw error;
      const valid = (data ?? []).filter((r: any) => r.workspace);
      if (valid.length === 0) return null;
      const first = valid[0] as any;
      const ws = first.workspace as Workspace;
      return { ...ws, role: first.role as "admin" | "agent" };
    },
  });
}
