// Hook central de permissões: carrega o grupo de acesso do membro atual
// e expõe `can(key)`. Admin do workspace tem bypass total.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { assertSameEpoch, getSessionEpoch } from "@/lib/session-epoch";
import { useAuth } from "./use-auth";
import { useCurrentWorkspace } from "./use-workspace";

const EMPTY_KEYS: string[] = [];
const EMPTY_SECTORS: string[] = [];

export type PermissionState = {
  isLoading: boolean;
  isAdmin: boolean;
  accessGroupId: string | null;
  sectorIds: string[];
  permissionKeys: string[];
  permissions: Set<string>;
  can: (key: string) => boolean;
  canAny: (keys: string[]) => boolean;
};

export function usePermissions(): PermissionState {
  const { user, loading: authLoading } = useAuth();
  const { data: ws, isLoading: wsLoading } = useCurrentWorkspace();
  const userId = user?.id ?? null;
  const workspaceId = ws?.id ?? null;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.permissions(userId, workspaceId),
    enabled: !!userId && !!workspaceId,
    staleTime: 15_000,
    // retry: false em StaleSessionError pra não reentrar; React Query
    // descarta o resultado lançado e não atualiza o cache.
    retry: (failureCount, err) =>
      (err as Error)?.name !== "StaleSessionError" && failureCount < 2,
    queryFn: async () => {
      // Race guard: captura a época no início da request. Se trocar o
      // usuário no meio, qualquer await abaixo vai lançar StaleSessionError
      // e a resposta antiga é descartada (não vira data do hook).
      const startEpoch = getSessionEpoch();

      const { data: member } = await supabase
        .from("workspace_members")
        .select("role, access_group_id, sector_ids")
        .eq("user_id", userId!)
        .eq("workspace_id", workspaceId!)
        .maybeSingle();
      assertSameEpoch(startEpoch);

      const role = (member?.role ?? "agent") as "admin" | "agent";
      const accessGroupId = (member?.access_group_id ?? null) as string | null;
      const sectorIds = (member?.sector_ids ?? []) as string[];

      let keys: string[] = [];
      if (accessGroupId) {
        const { data: perms } = await supabase
          .from("access_group_permissions")
          .select("permission_key")
          .eq("group_id", accessGroupId);
        assertSameEpoch(startEpoch);
        keys = (perms ?? []).map((p: any) => p.permission_key as string);
      }
      return { role, accessGroupId, sectorIds, keys: Array.from(new Set(keys)).sort() };
    },
  });

  // Memoiza tudo a partir de `data` para evitar identidades novas a cada render
  // (que causavam loop de renderização — React error #185).
  return useMemo<PermissionState>(() => {
    const permissionKeys = data?.keys ?? EMPTY_KEYS;
    const isAdmin = data?.role === "admin";
    const permissions = new Set<string>(permissionKeys);
    // isFetching cobre o caso de reinvalidação (logout/login/USER_UPDATED):
    // mesmo com dado em cache, mantemos o skeleton até o refetch chegar.
    return {
      isLoading: authLoading || (!!userId && wsLoading) || isLoading || isFetching,
      isAdmin,
      accessGroupId: data?.accessGroupId ?? null,
      sectorIds: data?.sectorIds ?? EMPTY_SECTORS,
      permissionKeys,
      permissions,
      can: (key: string) => isAdmin || permissions.has(key),
      canAny: (keys: string[]) => isAdmin || keys.some((k) => permissions.has(k)),
    };
  }, [authLoading, data, isLoading, isFetching, userId, wsLoading]);
}
