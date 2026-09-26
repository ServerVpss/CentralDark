import { useEffect, useState } from "react";

type Series = { name: string; data: Array<{ x: string; y: number }> };

export function ApexAreaChart({ series, height = 280 }: { series: Series[]; height?: number }) {
  const [Chart, setChart] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    import("react-apexcharts").then((m) => {
      if (mounted) setChart(() => m.default);
    });
    return () => { mounted = false; };
  }, []);

  if (!Chart) {
    return <div style={{ height }} className="animate-pulse rounded-lg bg-muted/40" />;
  }

  const options: any = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "inherit", background: "transparent" },
    theme: { mode: typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light" },
    colors: ["hsl(217 91% 60%)", "hsl(142 71% 45%)"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    grid: { borderColor: "hsl(var(--border))", strokeDashArray: 4 },
    xaxis: { type: "category", labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } } },
    yaxis: { labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } } },
    tooltip: { theme: "dark" },
    legend: { labels: { colors: "hsl(var(--muted-foreground))" } },
  };

  const apexSeries = series.map((s) => ({
    name: s.name,
    data: s.data.map((d) => ({ x: d.x, y: d.y })),
  }));

  return <Chart options={options} series={apexSeries} type="area" height={height} />;
}
