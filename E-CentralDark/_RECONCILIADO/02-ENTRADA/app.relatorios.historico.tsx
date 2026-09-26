import { createFileRoute } from "@tanstack/react-router";
import { HistoryReport } from "@/components/reports/ReportsCharts";

export const Route = createFileRoute("/app/relatorios/historico")({
  component: () => <div className="p-6"><HistoryReport scope="workspace" /></div>,
});
