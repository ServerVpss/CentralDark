import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { InboxLayout } from "@/components/inbox/InboxLayout";
import { NexInboxLayout } from "@/components/nexchat/NexInboxLayout";
import { useActiveTheme } from "@/hooks/use-active-theme";
import { listAllWorkspaces } from "@/lib/admin.functions";
import { logAdminInboxModeToggle } from "@/lib/admin-inbox-audit.functions";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";


function AdminInboxPage() {
  const fnWs = useServerFn(listAllWorkspaces);
  const fnLog = useServerFn(logAdminInboxModeToggle);
  const wsQ = useQuery({
    queryKey: ["admin-inbox-workspaces"],
    queryFn: () => fnWs(),
    staleTime: 60_000,
  });
  const workspaces = wsQ.data ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(true);

  // Seleciona o primeiro workspace automaticamente
  useEffect(() => {
    if (!selectedId && workspaces.length > 0) setSelectedId(workspaces[0].id);
  }, [workspaces, selectedId]);

  const selected = useMemo(
    () => workspaces.find((w: any) => w.id === selectedId) ?? null,
    [workspaces, selectedId],
  );

  async function handleToggleMode(checked: boolean) {
    const previous = readOnly ? "readonly" : "intervention";
    const next = checked ? "readonly" : "intervention";
    setReadOnly(checked);
    if (!selected) return;
    if (previous === next) return;
    try {
      await fnLog({
        data: {
          workspace_id: selected.id,
          workspace_name: selected.name,
          mode: next,
          previous_mode: previous,
        },
      });
      if (next === "intervention") {
        toast.warning("Modo intervenção ativado — ações ficam auditadas.");
      }
    } catch (e: any) {
      toast.error("Falha ao registrar auditoria: " + (e?.message ?? "erro"));
    }
  }


  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Barra master */}
      <div className="flex flex-wrap items-center gap-3 border-b bg-amber-500/10 px-4 py-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4" />
          Painel Master · Inbox de qualquer workspace
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Workspace:</Label>
            <Select value={selectedId ?? undefined} onValueChange={(v) => setSelectedId(v)}>
              <SelectTrigger className="h-8 w-[260px] bg-background text-xs">
                <SelectValue placeholder={wsQ.isLoading ? "Carregando…" : "Selecione um workspace"} />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} <span className="ml-2 text-muted-foreground">· {w.tickets} tickets</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="admin-inbox-readonly"
              checked={readOnly}
              onCheckedChange={handleToggleMode}
            />
            <Label htmlFor="admin-inbox-readonly" className="flex items-center gap-1.5 text-xs">
              {readOnly ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {readOnly ? "Somente leitura" : "Modo intervenção"}
            </Label>
          </div>
        </div>
      </div>

      {/* Inbox */}
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <AdminInboxBody selected={selected} readOnly={readOnly} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {wsQ.isLoading ? "Carregando workspaces…" : "Nenhum workspace disponível"}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminInboxBody({
  selected,
  readOnly,
}: {
  selected: { id: string; name: string };
  readOnly: boolean;
}) {
  const { mode, enabled, isLoading } = useActiveTheme();
  // Loading do tema: usa layout antigo para evitar flash.
  if (isLoading) {
    return (
      <InboxLayout
        key={selected.id}
        scope="admin"
        workspaceOverride={{ id: selected.id, name: selected.name }}
        readOnly={readOnly}
      />
    );
  }
  // Fallback total: erro/desligado → layout antigo intacto.
  try {
    if (enabled && mode === "nexchat") {
      return (
        <NexInboxLayout
          key={selected.id}
          scope="admin"
          workspaceOverride={{ id: selected.id, name: selected.name }}
          readOnly={readOnly}
        />
      );
    }
  } catch {
    return (
      <InboxLayout
        key={selected.id}
        scope="admin"
        workspaceOverride={{ id: selected.id, name: selected.name }}
        readOnly={readOnly}
      />
    );
  }
  return (
    <InboxLayout
      key={selected.id}
      scope="admin"
      workspaceOverride={{ id: selected.id, name: selected.name }}
      readOnly={readOnly}
    />
  );
}

export const Route = createFileRoute("/admin/inbox")({
  component: AdminInboxPage,
});
