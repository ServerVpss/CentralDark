import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/page-scaffold";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/admin/planos/adicional")({
  component: () => (
    <PageScaffold
      title="Master · Vendas de Adicional"
      description="Compras avulsas de mensagens/conexões feitas pelos workspaces."
      icon={ShoppingCart}
    />
  ),
});
