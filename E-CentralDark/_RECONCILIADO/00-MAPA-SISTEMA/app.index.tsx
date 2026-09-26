import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { getWorkspaceHome } from "@/lib/dashboard.functions";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/")({
  component: HomePage,
});

function HomePage() {
  const { data: ws } = useCurrentWorkspace();
  const fn = useServerFn(getWorkspaceHome);
  const { data, isLoading } = useQuery({
    queryKey: ["home", ws?.id],
    enabled: !!ws?.id,
    staleTime: 60_000,
    queryFn: () => fn({ data: { workspaceId: ws!.id } }),
  });

  if (!ws) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando workspace" /></div>;
  }
  return <HomeDashboard data={data} isLoading={isLoading} title="Início" subtitle={ws.name} />;
}
