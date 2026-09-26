import { createFileRoute } from "@tanstack/react-router";
import { TemplatesPanel } from "@/components/templates/TemplatesPanel";
import { PageScaffold } from "@/components/page-scaffold";

export const Route = createFileRoute("/admin/templates")({ component: Page });

function Page() {
  return (
    <PageScaffold title="Templates Meta — Todos" description="Visão master de todos os templates de todas as empresas">
      <TemplatesPanel scope="admin" />
    </PageScaffold>
  );
}
