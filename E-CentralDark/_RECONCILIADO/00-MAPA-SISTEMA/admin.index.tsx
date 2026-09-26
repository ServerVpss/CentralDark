import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminHome } from "@/lib/dashboard.functions";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export const Route = createFileRoute("/admin/")({ component: AdminHomePage });

function AdminHomePage() {
  const fn = useServerFn(getAdminHome);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-home"],
    staleTime: 60_000,
    queryFn: () => fn(),
  });
  return <HomeDashboard data={data} isLoading={isLoading} title="Início" subtitle="Visão consolidada de todos os workspaces" />;
}
