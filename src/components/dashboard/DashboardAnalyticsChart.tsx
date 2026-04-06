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

      // Aggregate by date
      const byDate: Record<string, number> = {};
      if (rows) {
        for (const r of rows) {
          byDate[r.date] = (byDate[r.date] || 0) + (r.messages_received || 0);
        }
      }

      // Fill 7 days
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

  if (loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-4">
          <Skeleton className="h-[180px] w-full" />
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-primary">{payload[0].value} consultas</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground">Consultas — Últimos 7 dias</h3>
      </div>
      <div className="p-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="consultas"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#dashGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
