import { createFileRoute } from "@tanstack/react-router";
import { CampaignsPanel } from "@/components/campaigns/CampaignsPanel";

export const Route = createFileRoute("/admin/campanhas")({
  component: () => <CampaignsPanel scope="admin" />,
});
