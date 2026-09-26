import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceAnnouncementsTabs } from "@/components/announcements/WorkspaceAnnouncementsTabs";

export const Route = createFileRoute("/app/notificacoes")({
  component: WorkspaceAnnouncementsTabs,
});
