import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/page-scaffold";
import { Settings2 } from "lucide-react";

export const Route = createFileRoute("/app/planos/gerenciar")({
  component: () => (
    <PageScaffold
      title="Gerenciar Plano"
      description="Veja sua assinatura atual, faturas e próximos vencimentos."
      icon={Settings2}
      adminHref="/admin/planos"
    />
  ),
});
