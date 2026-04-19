import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, MessageSquare } from "lucide-react";

interface DayData {
  date: string;
  label: string;
  consultas: number;
}

export function DashboardAnalyticsChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const { data: rows } = await supabase
        .from("bot_analytics")
        .select("date, messages_received")
        .gte("date", sevenDaysAgo.toISOString().split("T")[0])
        .lte("date", today.toISOString().split("T")[0])
        .order("date");

      const byDate: Record<string, number> = {};
      if (rows) {
        for (const r of rows) {
          byDate[r.date] = (byDate[r.date] || 0) + (r.messages_received || 0);
        }
      }

      const filled: DayData[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split("T")[0];
        filled.push({
          date: iso,
          label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          consultas: byDate[iso] || 0,
        });
      }

      setData(filled);
      setLoading(false);
    };
    fetchData();
  }, []);

  const total = data.reduce((sum, d) => sum + d.consultas, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;
  const last = data[data.length - 1]?.consultas ?? 0;
  const prev = data[data.length - 2]?.consultas ?? 0;
  const trend = prev > 0 ? ((last - prev) / prev) * 100 : 0;

  if (loading) {
    return (
      <div className="card-premium p-6 h-full">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-[180px] w-full" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass rounded-xl px-3 py-2 shadow-xl text-xs">
          <p className="font-semibold text-muted-foreground mb-1">{label}</p>
          <p className="text-primary font-bold tabular-nums">{payload[0].value} consultas</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-premium relative overflow-hidden p-6 h-full">
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" strokeWidth={2.25} />
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Consultas — 7 dias
              </p>
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tight text-gradient-money">
              {total.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              Média: <span className="text-foreground font-semibold">{avg}</span>/dia
            </p>
          </div>

          {trend !== 0 && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold tabular-nums border ${
                trend >= 0
                  ? "text-primary bg-primary/10 border-primary/20"
                  : "text-destructive bg-destructive/10 border-destructive/20"
              }`}
            >
              <TrendingUp className={`h-3 w-3 ${trend < 0 && "rotate-180"}`} />
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-[180px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={5}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Area
                type="monotone"
                dataKey="consultas"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#dashGrad)"
                strokeWidth={2.5}
                activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
