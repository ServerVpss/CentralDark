import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
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
  daysInMonth: number;
  conversionRate: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  count: number;
  paidCount: number;
  pendingCount: number;
}

/**
 * ============================================================
 *  TIMEZONE FIXO: America/Sao_Paulo (UTC-3, sem horário de verão)
 * ============================================================
 *  Independente do timezone do navegador, todos os filtros
 *  (Hoje / Semana / Mês) são calculados no horário de Brasília
 *  e convertidos para UTC antes da consulta ao banco.
 *  Intervalo seguro: created_at >= startUtc AND created_at < endUtc
 */
const BR_OFFSET_MS = -3 * 60 * 60 * 1000;

/** Retorna um Date cujos campos UTC representam o relógio em São Paulo. */
function nowInBR(): Date {
  return new Date(Date.now() + BR_OFFSET_MS);
}

/** Converte um Date (com campos UTC representando horário BR) para o instante UTC real. */
function brWallToUtc(d: Date): Date {
  return new Date(d.getTime() - BR_OFFSET_MS);
}

/** Retorna a chave YYYY-MM-DD do timestamp ISO no fuso de São Paulo. */
function brDateKey(iso: string): string {
  const d = new Date(new Date(iso).getTime() + BR_OFFSET_MS);
  return d.toISOString().slice(0, 10);
}

export function usePixTransactions(period: "today" | "week" | "month") {
  const { user } = useAuth();

  /**
   * Calcula [startUtc, endUtc) para o período selecionado,
   * sempre baseado no horário de São Paulo.
   */
  const getPeriodRange = () => {
    const nowBR = nowInBR();

    // início do período em "horário BR"
    const startBR = new Date(nowBR);
    startBR.setUTCHours(0, 0, 0, 0);

    if (period === "week") {
      // segunda-feira como início
      const dow = startBR.getUTCDay(); // 0=dom, 1=seg ...
      const diff = (dow + 6) % 7; // dias desde a última segunda
      startBR.setUTCDate(startBR.getUTCDate() - diff);
    } else if (period === "month") {
      startBR.setUTCDate(1);
    }

    // fim do período = agora (exclusivo, mas usamos "agora" como upper bound)
    const startUtc = brWallToUtc(startBR);
    const endUtc = new Date(); // instante atual real

    // período anterior do mesmo tamanho, terminando em startUtc (exclusivo)
    const periodLengthMs = endUtc.getTime() - startUtc.getTime();
    const previousEndUtc = new Date(startUtc.getTime()); // < startUtc
    const previousStartUtc = new Date(startUtc.getTime() - periodLengthMs);

    return { startUtc, endUtc, previousStartUtc, previousEndUtc, startBR };
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
            daysInMonth: 30,
            conversionRate: 0,
          } as PixSummary,
          chartData: [] as ChartDataPoint[],
        };
      }

      // Custo fixo mensal configurado (fallback R$ 500)
      const { data: settingsRow } = await supabase
        .from("payment_gateway_settings")
        .select("monthly_fixed_cost" as any)
        .eq("user_id", user.id)
        .maybeSingle();
      const monthlyFixedCost = Number((settingsRow as any)?.monthly_fixed_cost ?? 500);

      const { startUtc, endUtc, previousStartUtc, previousEndUtc, startBR } = getPeriodRange();

      // Período atual: created_at >= startUtc AND created_at < endUtc
      const { data: transactionsRaw, error } = await supabase
        .from("pix_transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startUtc.toISOString())
        .lt("created_at", endUtc.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enriquecer com username/first_name do Telegram
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

      // Período anterior (apenas pagas, para comparação de receita)
      const { data: previousTransactions } = await supabase
        .from("pix_transactions")
        .select("amount, status")
        .eq("user_id", user.id)
        .gte("created_at", previousStartUtc.toISOString())
        .lt("created_at", previousEndUtc.toISOString())
        .eq("status", "paid");

      const paidTransactions = transactions.filter((t) => t.status === "paid");
      const pendingTransactions = transactions.filter((t) => t.status === "pending");

      const totalRevenue = paidTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const previousRevenue = (previousTransactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

      /**
       * ============================================================
       *  RATEIO DO CUSTO FIXO MENSAL
       * ============================================================
       *  Regra: usa a QUANTIDADE REAL DE DIAS do mês atual (BR),
       *  não 30 dias fixos. Mais justo:
       *    - Maio (31 dias): R$ 500 / 31 ≈ R$ 16,13/dia
       *    - Junho (30 dias): R$ 500 / 30 ≈ R$ 16,67/dia
       *    - Fevereiro (28/29): R$ 500 / 28 ≈ R$ 17,86/dia
       *
       *  - Hoje: 1 dia × custo/dia
       *  - Semana: nº de dias decorridos da semana × custo/dia
       *  - Mês: custo cheio (R$ 500), independente do dia atual
       */
      const nowBR = nowInBR();
      const daysInMonth = new Date(
        Date.UTC(nowBR.getUTCFullYear(), nowBR.getUTCMonth() + 1, 0)
      ).getUTCDate();
      const dailyCost = monthlyFixedCost / daysInMonth;

      // dias decorridos no período (mínimo 1)
      const msPerDay = 24 * 60 * 60 * 1000;
      const periodDays = Math.max(
        1,
        Math.ceil((nowBR.getTime() - startBR.getTime()) / msPerDay)
      );

      const proratedCost = period === "month" ? monthlyFixedCost : dailyCost * periodDays;

      const totalProfit = totalRevenue - proratedCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      const previousPeriodComparison = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : totalRevenue > 0 ? 100 : 0;

      // Gráfico: agrupa por dia em horário BR
      const chartData: ChartDataPoint[] = [];
      if (period === "today") {
        // Para "hoje", agrupa por hora cheia em BR
        const buckets = new Map<string, { revenue: number; paid: number; pending: number }>();
        for (let h = 0; h <= nowBR.getUTCHours(); h++) {
          buckets.set(String(h).padStart(2, "0"), { revenue: 0, paid: 0, pending: 0 });
        }
        for (const t of transactions) {
          const d = new Date(new Date(t.created_at).getTime() + BR_OFFSET_MS);
          const key = String(d.getUTCHours()).padStart(2, "0");
          const b = buckets.get(key) ?? { revenue: 0, paid: 0, pending: 0 };
          if (t.status === "paid") {
            b.paid += 1;
            b.revenue += Number(t.amount);
          } else {
            b.pending += 1;
          }
          buckets.set(key, b);
        }
        for (const [hour, b] of buckets) {
          chartData.push({
            date: `${hour}:00`,
            revenue: b.revenue,
            count: b.paid,
            paidCount: b.paid,
            pendingCount: b.pending,
          });
        }
      } else {
        // Itera por dia em horário BR de startBR até hoje (BR)
        const dayKeys: string[] = [];
        const cursor = new Date(startBR);
        const todayKey = nowBR.toISOString().slice(0, 10);
        while (cursor.toISOString().slice(0, 10) <= todayKey) {
          dayKeys.push(cursor.toISOString().slice(0, 10));
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        for (const dayKey of dayKeys) {
          const dayAll = transactions.filter((t) => brDateKey(t.created_at) === dayKey);
          const dayPaid = dayAll.filter((t) => t.status === "paid");
          const dayPending = dayAll.filter((t) => t.status !== "paid");
          chartData.push({
            date: format(new Date(`${dayKey}T12:00:00Z`), "EEE dd/MM", { locale: ptBR }),
            revenue: dayPaid.reduce((sum, t) => sum + Number(t.amount), 0),
            count: dayPaid.length,
            paidCount: dayPaid.length,
            pendingCount: dayPending.length,
          });
        }
      }

      const totalGenerated = transactions.length;
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
        daysInMonth,
        conversionRate,
      };

      return {
        transactions,
        summary,
        chartData,
      };
    },
    enabled: !!user?.id,
  });
}
