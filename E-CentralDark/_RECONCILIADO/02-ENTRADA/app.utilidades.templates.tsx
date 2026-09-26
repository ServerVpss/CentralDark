import { createFileRoute } from "@tanstack/react-router";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { TemplatesPanel } from "@/components/templates/TemplatesPanel";
import { PageScaffold } from "@/components/page-scaffold";

export const Route = createFileRoute("/app/utilidades/templates")({ component: Page });

function Page() {
  const { data: ws } = useCurrentWorkspace();
  return (
    <PageScaffold title="Templates Meta" description="Modelos aprovados para mensagens fora da janela de 24h">
      <TemplatesPanel workspaceId={ws?.id} scope="workspace" />
    </PageScaffold>
  );
}
