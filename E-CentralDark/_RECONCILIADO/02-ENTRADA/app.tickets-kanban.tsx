import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/tickets-kanban")({
  component: KanbanPage,
});

function KanbanPage() {
  const { data: ws } = useCurrentWorkspace();
  if (!ws) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground"><LoadingDots size="sm" label="Carregando workspace" /></div>
    );
  }
  return <KanbanBoard workspaceId={ws.id} chatPath="/app/chat" />;
}
