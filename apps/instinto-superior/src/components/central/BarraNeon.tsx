import { useEffect, useRef } from "react";

// Cada tom aponta para tokens da página. Quando o tema muda, a barra muda junto.
export const TONS_BARRA = {
  neon: { inicio: "--neon-blue", fim: "--neon-green" },
  primario: { inicio: "--primary", fim: "--accent" },
  sucesso: { inicio: "--neon-green", fim: "--neon-green" },
  ouro: { inicio: "--gold", fim: "--gold-soft" },
  roxo: { inicio: "--neon-purple", fim: "--neon-blue" },
  perigo: { inicio: "--destructive", fim: "--gold-soft" },
} as const;

export type TomBarra = keyof typeof TONS_BARRA;

export type BarraNeonProps = {
  percentual: number;
  tom?: TomBarra;
  altura?: "sm" | "md";
  densidade?: number;
  velocidade?: number;
  particulas?: boolean;
  rotulo?: string;
  className?: string;
};

type Particula = { x: number; y: number; v: number; r: number; fase: number };

const ALTURA = { sm: "h-2", md: "h-3" } as const;

export function BarraNeon({
  percentual,
  tom = "neon",
  altura = "md",
  densidade = 14,
  velocidade = 1,
  particulas = true,
  rotulo,
  className = "",
}: BarraNeonProps) {
  const pct = Math.min(100, Math.max(0, percentual));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pctRef = useRef(pct);
  pctRef.current = pct;
  const { inicio, fim } = TONS_BARRA[tom];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!particulas || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let largura = 0;
    let altura = 0;
    let lista: Particula[] = [];
    let frame = 0;
    let corAtual = "";
    let quadro = 0;

    // canvas não entende var(); lê o valor resolvido do token do tema atual.
    const corDoToken = () => {
      const valor = getComputedStyle(canvas).getPropertyValue(inicio).trim();
      return valor || "currentColor";
    };

    const ajustar = () => {
      const dpr = window.devicePixelRatio || 1;
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(largura * dpr));
      canvas.height = Math.max(1, Math.floor(altura * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const quantidade = Math.max(8, Math.floor((largura / 100) * densidade));
      lista = Array.from({ length: quantidade }, () => ({
        x: Math.random() * largura,
        y: altura / 2 + (Math.random() - 0.5) * altura * 0.8,
        v: (0.4 + Math.random() * 0.9) * velocidade,
        r: 0.6 + Math.random() * 1.2,
        fase: Math.random() * Math.PI * 2,
      }));
    };

    const desenhar = (t: number) => {
      if (quadro++ % 30 === 0) corAtual = corDoToken();
      ctx.clearRect(0, 0, largura, altura);
      const preenchido = (largura * pctRef.current) / 100;
      for (const p of lista) {
        if (!reduzir) {
          p.x += p.v;
          p.fase += 0.04;
        }
        if (p.x > preenchido) p.x = 0;
        const y = p.y + Math.sin(p.fase + t / 900) * altura * 0.18;
        ctx.globalAlpha = 0.45 + 0.4 * Math.sin(p.fase);
        ctx.beginPath();
        ctx.fillStyle = corAtual;
        ctx.shadowColor = corAtual;
        ctx.shadowBlur = 6;
        ctx.arc(p.x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      frame = requestAnimationFrame(desenhar);
    };

    ajustar();
    window.addEventListener("resize", ajustar);
    frame = requestAnimationFrame(desenhar);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", ajustar);
    };
  }, [particulas, densidade, velocidade, inicio]);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={rotulo}
      className={`relative ${ALTURA[altura]} overflow-hidden rounded-full bg-muted ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          backgroundImage: `linear-gradient(to right, var(${inicio}), var(${fim}))`,
          boxShadow: `0 0 10px 2px color-mix(in oklab, var(${inicio}) 70%, transparent), 0 0 2px 0 color-mix(in oklab, var(${fim}) 90%, transparent)`,
        }}
      />
      {particulas ? (
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      ) : null}
    </div>
  );
}
