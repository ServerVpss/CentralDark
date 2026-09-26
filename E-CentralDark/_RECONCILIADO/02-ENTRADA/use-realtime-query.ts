import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Liga uma queryKey do React Query a mudanças realtime de uma ou mais tabelas.
 *
 * Convenção de nomes de canal (segurança multi-tenant):
 *  - scope: "workspace"  → canal vira `ws:${workspaceId}:${channelName}` (workspaceId obrigatório)
 *  - scope: "admin"      → canal vira `admin:${channelName}` (só master)
 *  - scope: "public"     → canal vira `public:${channelName}` (somente dados realmente públicos, ex.: landing)
 *
 * Nunca usar canal sem prefixo pra dados de workspace.
 */
type Scope =
  | { scope: "workspace"; workspaceId: string | null | undefined }
  | { scope: "admin" }
  | { scope: "public" };

export function useRealtimeInvalidate(
  channelName: string,
  tables: { table: string; schema?: string }[],
  queryKeys: unknown[][],
  scope: Scope = { scope: "public" },
) {
  const qc = useQueryClient();

  // monta o nome final do canal de acordo com o escopo
  let fullName: string | null = null;
  if (scope.scope === "workspace") {
    fullName = scope.workspaceId ? `ws:${scope.workspaceId}:${channelName}` : null;
  } else if (scope.scope === "admin") {
    fullName = `admin:${channelName}`;
  } else {
    fullName = `public:${channelName}`;
  }

  useEffect(() => {
    if (!fullName) return; // sem workspace ainda → não assina nada
    const channel = supabase.channel(fullName);
    for (const t of tables) {
      (channel as unknown as {
        on: (e: string, f: Record<string, string>, cb: () => void) => unknown;
      }).on(
        "postgres_changes",
        { event: "*", schema: t.schema ?? "public", table: t.table },
        () => { for (const k of queryKeys) qc.invalidateQueries({ queryKey: k }); },
      );
    }
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName]);
}
