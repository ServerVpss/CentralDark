import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/page-scaffold";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin/chat")({
  component: () => (
    <PageScaffold
      title="Master · Chat"
      description="Visão global de conversas em andamento em todos os workspaces."
      icon={MessageCircle}
    />
  ),
});
