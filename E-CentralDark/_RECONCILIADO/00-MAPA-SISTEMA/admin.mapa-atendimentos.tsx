import { createFileRoute } from "@tanstack/react-router";
import { GeoMap } from "@/components/map/GeoMap";

export const Route = createFileRoute("/admin/mapa-atendimentos")({
  component: () => <GeoMap scope="admin" />,
});
