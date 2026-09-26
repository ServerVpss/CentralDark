import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const datasets = {
  "Mensagens Enviadas": [600, 900, 1500, 1100, 1300, 850, 1700],
  "Sessões Conectadas": [12, 18, 22, 19, 25, 28, 35],
  "Novos Contatos": [40, 65, 80, 55, 90, 110, 145],
  "Mensagens Recebidas": [400, 700, 1200, 950, 1100, 700, 1450],
} as const;

type Metric = keyof typeof datasets;
const labels = ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Hoje"];

export function ChartPanel() {
  const [metric, setMetric] = useState<Metric>("Mensagens Enviadas");
  const data = datasets[metric].map((value, i) => ({ name: labels[i], value }));
  const max = Math.max(...datasets[metric]);
  const step = max > 1000 ? 500 : max > 100 ? 50 : 10;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round((top * i) / 4));

  return (
    <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm border-glow overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="font-display font-bold text-sm tracking-wide">Estatísticas (Últimos 7 dias)</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-border text-foreground text-xs hover:border-primary/40 transition">
              {metric} <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card/95 border-border backdrop-blur-xl">
            {(Object.keys(datasets) as Metric[]).map((m) => (
              <DropdownMenuItem key={m} onClick={() => setMetric(m)} className="text-xs">
                <Check className={`w-3 h-3 mr-2 ${m === metric ? "opacity-100 text-primary" : "opacity-0"}`} />
                {m}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="p-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.08)" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={ticks}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : `${v}`)}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--primary) / 0.4)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--primary))" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, index } = props;
                const isLast = index === data.length - 1;
                if (isLast) {
                  return (
                    <g key={`dot-${index}`} style={{ pointerEvents: "none" }}>
                      {/* anel fino expandindo — limpo, sem elástico */}
                      <circle cx={cx} cy={cy} r={4} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.2} opacity={0}>
                        <animate attributeName="r" from="4" to="11" dur="1.8s" repeatCount="indefinite" calcMode="linear" />
                        <animate attributeName="opacity" values="0.55;0" dur="1.8s" repeatCount="indefinite" calcMode="linear" />
                        <animate attributeName="stroke-width" values="1.4;0.4" dur="1.8s" repeatCount="indefinite" calcMode="linear" />
                      </circle>
                      {/* núcleo fixo, sem respiração */}
                      <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
                    </g>
                  );
                }
                return <circle key={`dot-${index}`} cx={cx} cy={cy} r={3.5} fill="hsl(var(--primary))" />;
              }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              filter="drop-shadow(0 0 6px hsl(var(--primary) / 0.6))"
              isAnimationActive
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
