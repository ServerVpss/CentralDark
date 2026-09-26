import { createFileRoute, Link } from "@tanstack/react-router";
import { PageScaffold } from "@/components/page-scaffold";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/canais")({
  component: () => (
    <PageScaffold
      title="Master · Canais"
      description="Conexões WhatsApp e outros canais por workspace."
      icon={Radio}
    >
      <div className="p-6">
        <p className="mb-3 text-sm text-muted-foreground">
          Use a página de WhatsApp do painel master para gerenciar conexões em detalhe.
        </p>
        <Button asChild><Link to="/admin/whatsapp">Abrir WhatsApp Master</Link></Button>
      </div>
    </PageScaffold>
  ),
});
