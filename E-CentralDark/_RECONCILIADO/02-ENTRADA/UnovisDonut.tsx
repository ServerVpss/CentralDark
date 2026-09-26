import { VisDonut, VisSingleContainer } from "@unovis/react";

type Datum = { name: string; value: number; color?: string | null };

const PALETTE = [
  "hsl(217 91% 60%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(280 75% 60%)",
  "hsl(0 84% 60%)",
  "hsl(199 89% 48%)",
];

export function UnovisDonut({ data, height = 260 }: { data: Datum[]; height?: number }) {
  const filtered = data.filter((d) => d.value > 0);
  if (!filtered.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-muted-foreground">
        Sem dados no período
      </div>
    );
  }
  return (
    <VisSingleContainer data={filtered} height={height}>
      <VisDonut
        value={(d: Datum) => d.value}
        color={(d: Datum, i: number) => d.color || PALETTE[i % PALETTE.length]}
        arcWidth={28}
        showEmptySegments={false}
      />
    </VisSingleContainer>
  );
}
