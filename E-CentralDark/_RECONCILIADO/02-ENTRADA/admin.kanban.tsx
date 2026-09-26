import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trello } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listAllWorkspaces } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/kanban")({
  component: AdminKanbanPage,
});

function AdminKanbanPage() {
  const [workspace, setWorkspace] = useState<string>("");

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["admin", "workspaces", "for-kanban"],
    queryFn: () => listAllWorkspaces(),
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Trello className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Master · Kanban</h1>
            <p className="text-xs text-muted-foreground">Visão global de tickets em kanban por empresa.</p>
          </div>
        </div>
        <Select
          value={workspace || undefined}
          onValueChange={setWorkspace}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder={isLoading ? "Carregando empresas…" : "Selecione uma empresa"} />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden">
        {workspace ? (
          <KanbanBoard workspaceId={workspace} chatPath="/admin/chat" />
        ) : (
          <div className="flex h-full items-center justify-center p-10 text-center text-sm text-muted-foreground">
            Selecione uma empresa no topo para visualizar o kanban.
          </div>
        )}
      </div>
    </div>
  );
}
