import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AccessGroupsPanel } from "@/components/access-groups/AccessGroupsPanel";

export const Route = createFileRoute("/app/grupos-acesso")({
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Grupos de Acesso</h1>
          <p className="text-sm text-muted-foreground">
            Defina cargos e permissões granulares para os atendentes da sua empresa.
          </p>
        </div>
      </div>
      <AccessGroupsPanel />
    </div>
  );
}
