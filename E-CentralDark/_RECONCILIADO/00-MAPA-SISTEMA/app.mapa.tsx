import { createFileRoute } from "@tanstack/react-router";
import { GeoMap } from "@/components/map/GeoMap";

export const Route = createFileRoute("/app/mapa")({
  component: () => <GeoMap scope="workspace" />,
});
