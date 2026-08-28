import { useState } from "react";
import { DashboardLayout } from "@/compartilhado/layout/DashboardLayout";
import { PixTransactionsTable } from "@/funcionalidades/telepainel/components/pix/PixTransactionsTable";
import { PixFinancialSummary } from "@/funcionalidades/telepainel/components/pix/PixFinancialSummary";
import { PixCharts } from "@/funcionalidades/telepainel/components/pix/PixCharts";
import { OperationalCostConfig } from "@/funcionalidades/telepainel/components/pix/OperationalCostConfig";
import { BreakEvenGoal } from "@/funcionalidades/telepainel/components/pix/BreakEvenGoal";
import { Tabs, TabsList, TabsTrigger } from "@/compartilhado/ui/tabs";
import { usePixTransactions } from "@/compartilhado/hooks/usePixTransactions";
import { TrendingUp } from "lucide-react";

export default function PixTransactions() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const { data, isLoading } = usePixTransactions(period);
  const transactions = data?.transactions;
  const summary = data?.summary;
  const chartData = data?.chartData;

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Relatório de Lucros</h1>
            <p className="text-sm text-muted-foreground">Acompanhe seus ganhos em tempo real</p>
          </div>
          
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList className="bg-card/50 border border-border/50 backdrop-blur">
              <TabsTrigger 
                value="today"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:text-primary"
              >
                Hoje
              </TabsTrigger>
              <TabsTrigger 
                value="week"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:text-primary"
              >
                Semana
              </TabsTrigger>
              <TabsTrigger 
                value="month"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:text-primary"
              >
                Mês
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Break-even Goal */}
        <BreakEvenGoal summary={summary} isLoading={isLoading} />

        {/* Summary Cards */}
        <PixFinancialSummary summary={summary} isLoading={isLoading} />

        {/* Operational Cost Config */}
        <OperationalCostConfig />

        {/* Charts */}
        <PixCharts chartData={chartData} isLoading={isLoading} />

        {/* Transactions Table */}
        <PixTransactionsTable transactions={transactions} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
