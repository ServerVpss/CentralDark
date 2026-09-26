import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/page-scaffold";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/admin/utilidades")({
  component: () => (
    <PageScaffold
      title="Master · Utilidades"
      description="Etiquetas, mensagens rápidas/aleatórias, agendamentos e Voice IA por workspace."
      icon={Wrench}
    />
  ),
});
