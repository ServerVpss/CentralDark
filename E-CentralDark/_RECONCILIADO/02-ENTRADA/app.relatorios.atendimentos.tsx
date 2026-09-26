import { createFileRoute } from "@tanstack/react-router";
import { TicketsReport } from "@/components/reports/ReportsCharts";

export const Route = createFileRoute("/app/relatorios/atendimentos")({
  component: () => <div className="p-6"><TicketsReport scope="workspace" /></div>,
});
