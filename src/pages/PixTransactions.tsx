import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PixTransactionsTable } from "@/components/pix/PixTransactionsTable";
import { PixFinancialSummary } from "@/components/pix/PixFinancialSummary";
import { PixCharts } from "@/components/pix/PixCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePixTransactions } from "@/hooks/usePixTransactions";

export default function PixTransactions() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const { data, isLoading } = usePixTransactions(period);
  const transactions = data?.transactions;
  const summary = data?.summary;
  const chartData = data?.chartData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Relatório de Lucros</h1>
            <p className="text-muted-foreground">Acompanhe seus ganhos em tempo real</p>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList>
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
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
