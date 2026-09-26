import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/page-scaffold";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/app/planos/adicional")({
  component: () => (
    <PageScaffold
      title="Comprar Adicional"
      description="Mensagens, conexões e usuários extras sem trocar de plano."
      icon={ShoppingCart}
      adminHref="/admin/planos"
    />
  ),
});
