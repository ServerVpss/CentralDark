import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfDay, startOfWeek, startOfMonth, format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PixTransaction {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  telegram_user_id: number | null;
  gateway: string;
  external_id: string | null;
  e2e_id: string | null;
}

export interface PixSummary {
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  paidCount: number;
  pendingCount: number;
  averageValue: number;
  profitMargin: number;
  previousPeriodComparison: number;
  operationalCostRate: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  count: number;
}

export function usePixTransactions(period: "today" | "week" | "month") {
  const { user } = useAuth();

  const getStartDate = () => {
    const now = new Date();
    switch (period) {
      case "today":
        return startOfDay(now);
      case "week":
        return startOfWeek(now, { weekStartsOn: 1 });
      case "month":
        return startOfMonth(now);
      default:
        return startOfWeek(now, { weekStartsOn: 1 });
    }
  };

  const getPreviousPeriodDates = () => {
    const startDate = getStartDate();
    const now = new Date();
    const periodLength = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const previousEnd = subDays(startDate, 1);
    const previousStart = subDays(previousEnd, periodLength - 1);
    return { previousStart, previousEnd };
  };

  return useQuery({
    queryKey: ["pix-transactions", period, user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          transactions: [],
          summary: {
            totalRevenue: 0,
            totalProfit: 0,
            transactionCount: 0,
            paidCount: 0,
            pendingCount: 0,
            averageValue: 0,
            profitMargin: 0,
            previousPeriodComparison: 0,
            operationalCostRate: 0.03,
          } as PixSummary,
          chartData: [] as ChartDataPoint[],
        };
      }

      // Buscar taxa de custo operacional configurada (fallback 3%)
      const { data: settingsRow } = await supabase
        .from("payment_gateway_settings")
        .select("operational_cost_rate" as any)
        .eq("user_id", user.id)
        .maybeSingle();
      const operationalCostRate = Number((settingsRow as any)?.operational_cost_rate ?? 0.03);

      const startDate = getStartDate();
      const { previousStart, previousEnd } = getPreviousPeriodDates();

      // Fetch current period transactions
      const { data: transactions, error } = await supabase
        .from("pix_transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch previous period for comparison
      const { data: previousTransactions } = await supabase
        .from("pix_transactions")
        .select("amount, status")
        .eq("user_id", user.id)
        .gte("created_at", previousStart.toISOString())
        .lte("created_at", previousEnd.toISOString())
        .eq("status", "paid");

      // Calculate summary
      const paidTransactions = (transactions || []).filter((t) => t.status === "paid");
      const pendingTransactions = (transactions || []).filter((t) => t.status === "pending");

      const totalRevenue = paidTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const previousRevenue = (previousTransactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

      const totalProfit = totalRevenue * (1 - operationalCostRate);
      const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

      const previousPeriodComparison = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : totalRevenue > 0 ? 100 : 0;

      // Generate chart data
      const days = eachDayOfInterval({ start: startDate, end: new Date() });
      const chartData: ChartDataPoint[] = days.map((day) => {
        const dayTransactions = paidTransactions.filter(
          (t) => format(new Date(t.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
        );
        return {
          date: format(day, period === "today" ? "HH:mm" : "EEE", { locale: ptBR }),
          revenue: dayTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
          count: dayTransactions.length,
        };
      });

      const summary: PixSummary = {
        totalRevenue,
        totalProfit,
        transactionCount: (transactions || []).length,
        paidCount: paidTransactions.length,
        pendingCount: pendingTransactions.length,
        averageValue: paidTransactions.length > 0 ? totalRevenue / paidTransactions.length : 0,
        profitMargin,
        previousPeriodComparison,
        operationalCostRate,
      };

      return {
        transactions: transactions || [],
        summary,
        chartData,
      };
    },
    enabled: !!user?.id,
  });
}
