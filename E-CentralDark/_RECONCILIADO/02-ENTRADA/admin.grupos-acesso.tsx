import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AdminAccessGroupsPanel } from "@/components/access-groups/AdminAccessGroupsPanel";

export const Route = createFileRoute("/admin/grupos-acesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    ws: typeof s.ws === "string" ? s.ws : undefined,
  }),
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
          <h1 className="text-2xl font-semibold">Master · Grupos de Acesso</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie cargos, permissões e WhatsApps de qualquer empresa do sistema.
          </p>
        </div>
      </div>
      <AdminAccessGroupsPanel />
    </div>
  );
}
