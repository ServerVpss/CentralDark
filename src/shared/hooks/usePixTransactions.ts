import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/shared/auth/AuthProvider";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

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

type PaymentGatewaySettingsCost = {
  monthly_fixed_cost?: number | string | null;
};

/**
 * ============================================================
 *  TIMEZONE OFICIAL: America/Sao_Paulo (IANA)
 * ============================================================
 *  Usamos `date-fns-tz` para respeitar a regra real do fuso,
 *  incluindo qualquer mudança futura (horário de verão, etc).
 *  Nada de offset fixo hardcoded.
 *
 *  Fluxo:
 *   1. Pegamos "agora" em SP via toZonedTime.
 *   2. Calculamos o início do período no relógio de SP
 *      manipulando os campos da Date "zonada".
 *   3. Convertemos de volta para UTC com fromZonedTime
 *      antes de consultar o banco.
 *
 *  Query usa intervalo seguro:
 *    created_at >= startUtc AND created_at < endUtc
 * ============================================================
 */
const TZ = "America/Sao_Paulo";

/**
 * Calcula [startUtc, endUtc) para o filtro escolhido,
 * sempre baseado no horário oficial de São Paulo.
 */
function getPeriodRange(period: "today" | "week" | "month") {
  const nowUtc = new Date();
  const nowSP = toZonedTime(nowUtc, TZ);

  // Início do período em "horário local de SP"
  const startSP = new Date(nowSP);
  startSP.setHours(0, 0, 0, 0);

  if (period === "week") {
    // Segunda-feira como início da semana
    const dow = startSP.getDay(); // 0=dom, 1=seg, ...
    const diff = (dow + 6) % 7;
    startSP.setDate(startSP.getDate() - diff);
  } else if (period === "month") {
    startSP.setDate(1);
  }

  // Converte início SP -> UTC (respeitando regras IANA)
  const startUtc = fromZonedTime(startSP, TZ);
  const endUtc = nowUtc;

  // Período anterior, mesmo tamanho, terminando em startUtc (exclusivo)
  const periodLengthMs = endUtc.getTime() - startUtc.getTime();
  const previousEndUtc = new Date(startUtc.getTime());
  const previousStartUtc = new Date(startUtc.getTime() - periodLengthMs);

  return { startUtc, endUtc, previousStartUtc, previousEndUtc, startSP, nowSP };
}

/** Chave YYYY-MM-DD do timestamp ISO, no fuso de São Paulo. */
function spDateKey(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "yyyy-MM-dd");
}

/** Hora (00-23) do timestamp ISO, no fuso de São Paulo. */
function spHour(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "HH");
}

export function usePixTransactions(period: "today" | "week" | "month") {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Realtime: invalida a query a cada mudança em pix_transactions do usuário
  // e atualiza também a cada 30s como fallback (timezone/cron seguro).
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`pix-tx-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pix_transactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pix-transactions"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ["pix-transactions", period, user?.id],
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    // Mantém os dados anteriores enquanto recarrega em segundo plano,
    // evitando flicker/skeleton ao receber updates em tempo real.
    placeholderData: keepPreviousData,
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
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      const monthlyFixedCost = Number((settingsRow as unknown as PaymentGatewaySettingsCost | null)?.monthly_fixed_cost ?? 500);

      const { startUtc, endUtc, previousStartUtc, previousEndUtc, startSP, nowSP } =
        getPeriodRange(period);

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
       *  Regra explícita: cobramos o custo por DIAS INTEIROS do
       *  período selecionado (não por horas decorridas).
       *
       *  - Hoje: 1 dia inteiro do mês atual.
       *    Ex.: dia 30 às 10h já cobra o dia 30 todo.
       *  - Semana: nº de dias decorridos da semana (seg→hoje).
       *    Ex.: sábado cobra 6 dias inteiros.
       *  - Mês: custo cheio do mês (R$ monthlyFixedCost).
       *
       *  Custo/dia = monthlyFixedCost ÷ DIAS REAIS DO MÊS ATUAL:
       *   - Maio (31 dias): R$ 500 / 31 ≈ R$ 16,13/dia
       *   - Junho (30 dias): R$ 500 / 30 ≈ R$ 16,67/dia
       *   - Fevereiro (28/29): R$ 500 / 28 ≈ R$ 17,86/dia
       * ============================================================
       */
      const daysInMonth = new Date(
        nowSP.getFullYear(),
        nowSP.getMonth() + 1,
        0
      ).getDate();
      const dailyCost = monthlyFixedCost / daysInMonth;

      // Dias decorridos do período (inteiros, mínimo 1)
      const msPerDay = 24 * 60 * 60 * 1000;
      const periodDays = Math.max(
        1,
        Math.ceil((nowSP.getTime() - startSP.getTime()) / msPerDay)
      );

      const proratedCost = period === "month" ? monthlyFixedCost : dailyCost * periodDays;

      const totalProfit = totalRevenue - proratedCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      const previousPeriodComparison = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : totalRevenue > 0 ? 100 : 0;

      // Gráfico: agrupa por dia/hora no fuso de SP
      const chartData: ChartDataPoint[] = [];
      if (period === "today") {
        const buckets = new Map<string, { revenue: number; paid: number; pending: number }>();
        const currentHour = nowSP.getHours();
        for (let h = 0; h <= currentHour; h++) {
          buckets.set(String(h).padStart(2, "0"), { revenue: 0, paid: 0, pending: 0 });
        }
        for (const t of transactions) {
          const key = spHour(t.created_at);
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
        const dayKeys: string[] = [];
        const cursor = new Date(startSP);
        const todayKey = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
        while (true) {
          const key = format(cursor, "yyyy-MM-dd");
          dayKeys.push(key);
          if (key >= todayKey) break;
          cursor.setDate(cursor.getDate() + 1);
        }
        for (const dayKey of dayKeys) {
          const dayAll = transactions.filter((t) => spDateKey(t.created_at) === dayKey);
          const dayPaid = dayAll.filter((t) => t.status === "paid");
          const dayPending = dayAll.filter((t) => t.status !== "paid");
          chartData.push({
            date: format(new Date(`${dayKey}T12:00:00`), "EEE dd/MM", { locale: ptBR }),
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
