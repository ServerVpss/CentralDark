import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfDay, startOfWeek, startOfMonth, format, subDays, eachDayOfInterval, differenceInCalendarDays } from "date-fns";
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
  telegram_username?: string | null;
  telegram_first_name?: string | null;
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
  monthlyFixedCost: number;
  proratedCost: number;
  periodDays: number;
  conversionRate: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  count: number;
  paidCount: number;
  pendingCount: number;
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
            monthlyFixedCost: 500,
            proratedCost: 0,
            periodDays: 0,
            conversionRate: 0,
          } as PixSummary,
          chartData: [] as ChartDataPoint[],
        };
      }

      // Buscar custo fixo mensal configurado (fallback R$ 500)
      const { data: settingsRow } = await supabase
        .from("payment_gateway_settings")
        .select("monthly_fixed_cost" as any)
        .eq("user_id", user.id)
        .maybeSingle();
      const monthlyFixedCost = Number((settingsRow as any)?.monthly_fixed_cost ?? 500);

      const startDate = getStartDate();
      const { previousStart, previousEnd } = getPreviousPeriodDates();

      // Fetch current period transactions
      const { data: transactionsRaw, error } = await supabase
        .from("pix_transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with telegram username/first name
      const tgIds = Array.from(
        new Set((transactionsRaw || []).map((t) => t.telegram_user_id).filter((v): v is number => v != null))
      );
      const userMap = new Map<number, { username: string | null; first_name: string | null }>();
      if (tgIds.length > 0) {
        const { data: msgs } = await supabase
          .from("telegram_messages")
          .select("from_user_id, from_username, from_first_name")
          .in("from_user_id", tgIds)
          .order("created_at", { ascending: false });
        for (const m of msgs || []) {
          if (m.from_user_id == null) continue;
          if (!userMap.has(m.from_user_id)) {
            userMap.set(m.from_user_id, {
              username: m.from_username ?? null,
              first_name: m.from_first_name ?? null,
            });
          }
        }
      }
      const transactions = (transactionsRaw || []).map((t) => ({
        ...t,
        telegram_username: t.telegram_user_id ? userMap.get(t.telegram_user_id)?.username ?? null : null,
        telegram_first_name: t.telegram_user_id ? userMap.get(t.telegram_user_id)?.first_name ?? null : null,
      }));

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

      // Custo proporcional ao período selecionado (mês cheio, semana ~7/30, hoje 1/30)
      const periodDays = Math.max(1, differenceInCalendarDays(new Date(), startDate) + 1);
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const proratedCost = period === "month"
        ? monthlyFixedCost
        : (monthlyFixedCost / daysInMonth) * periodDays;

      const totalProfit = totalRevenue - proratedCost;
      const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

      const previousPeriodComparison = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : totalRevenue > 0 ? 100 : 0;

      // Generate chart data
      const days = eachDayOfInterval({ start: startDate, end: new Date() });
      const chartData: ChartDataPoint[] = days.map((day) => {
        const dayKey = format(day, "yyyy-MM-dd");
        const dayAll = (transactions || []).filter(
          (t) => format(new Date(t.created_at), "yyyy-MM-dd") === dayKey
        );
        const dayPaid = dayAll.filter((t) => t.status === "paid");
        const dayPending = dayAll.filter((t) => t.status !== "paid");
        return {
          date: format(day, period === "today" ? "HH:mm" : "EEE", { locale: ptBR }),
          revenue: dayPaid.reduce((sum, t) => sum + Number(t.amount), 0),
          count: dayPaid.length,
          paidCount: dayPaid.length,
          pendingCount: dayPending.length,
        };
      });

      const totalGenerated = (transactions || []).length;
      const conversionRate = totalGenerated > 0 ? (paidTransactions.length / totalGenerated) * 100 : 0;

      const summary: PixSummary = {
        totalRevenue,
        totalProfit,
        transactionCount: totalGenerated,
        paidCount: paidTransactions.length,
        pendingCount: pendingTransactions.length,
        averageValue: paidTransactions.length > 0 ? totalRevenue / paidTransactions.length : 0,
        profitMargin,
        previousPeriodComparison,
        monthlyFixedCost,
        proratedCost,
        periodDays,
        conversionRate,
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
