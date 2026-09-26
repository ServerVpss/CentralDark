import { createFileRoute } from "@tanstack/react-router";
import { CampaignsPanel } from "@/components/campaigns/CampaignsPanel";

export const Route = createFileRoute("/app/campanhas")({
  component: () => <CampaignsPanel scope="workspace" />,
});
