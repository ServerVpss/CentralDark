import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PixTransactionsTable } from "@/components/pix/PixTransactionsTable";
import { PixFinancialSummary } from "@/components/pix/PixFinancialSummary";
import { PixCharts } from "@/components/pix/PixCharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePixTransactions } from "@/hooks/usePixTransactions";
import { TrendingUp } from "lucide-react";

export default function PixTransactions() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const { data, isLoading } = usePixTransactions(period);
  const transactions = data?.transactions;
  const summary = data?.summary;
  const chartData = data?.chartData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Premium Style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Relatório de Lucros
              </h1>
              <p className="text-sm text-muted-foreground">Acompanhe seus ganhos em tempo real</p>
            </div>
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

        {/* Summary Cards */}
        <PixFinancialSummary summary={summary} isLoading={isLoading} />

        {/* Charts */}
        <PixCharts chartData={chartData} isLoading={isLoading} />

        {/* Transactions Table */}
        <PixTransactionsTable transactions={transactions} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
