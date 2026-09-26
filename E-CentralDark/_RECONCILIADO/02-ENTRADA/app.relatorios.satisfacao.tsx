import { createFileRoute } from "@tanstack/react-router";
import { SatisfactionReport } from "@/components/reports/ReportsCharts";

export const Route = createFileRoute("/app/relatorios/satisfacao")({
  component: () => <div className="p-6"><SatisfactionReport scope="workspace" /></div>,
});
