import { useEffect, useMemo, useState } from "react";
import { Newspaper } from "lucide-react";

// Manchetes/exemplos exibidos no ticker. No futuro dá pra trocar por um fetch
// das últimas consultas reais. Mantidos aqui pra não bloquear o efeito visual.
const SAMPLE_NEWS = [
  "🔥 João fez uma consulta de CPF agora há pouco",
  "✨ Maria indicou o bot e ganhou 7 dias grátis",
  "📊 Mais de 12.000 consultas processadas nas últimas 24h",
  "🛰️ Carlos consultou uma placa e recebeu em 3s",
  "💎 Ana assinou o plano VIP e liberou todos os módulos",
  "⚡ Pedro fez 5 consultas de telefone em sequência",
  "🆕 Novo módulo de FOTO DETRAN disponível",
  "🎯 Lucas indicou 3 amigos e ganhou plano vitalício",
];

interface Props {
  items?: string[];
}

export function NewsTicker({ items }: Props) {
  const [news, setNews] = useState<string[]>(items ?? SAMPLE_NEWS);

  useEffect(() => {
    if (items && items.length > 0) setNews(items);
  }, [items]);

  // Duplica a lista pra fazer loop infinito sem corte visual
  const looped = useMemo(() => [...news, ...news], [news]);

  return (
    <div
      className="relative mb-3 overflow-hidden rounded-md border border-amber-500/30 bg-gradient-to-r from-zinc-950 via-amber-950/30 to-zinc-950"
      style={{ height: 56 }}
    >
      {/* Selo NEWS fixo à esquerda */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1.5 px-3 bg-amber-500 text-black font-mono text-[11px] font-extrabold tracking-wider shadow-[2px_0_8px_rgba(0,0,0,0.5)]">
        <Newspaper className="h-3.5 w-3.5" strokeWidth={2.5} />
        NEWS
      </div>

      {/* Faixa diagonal correndo da direita → esquerda */}
      <div className="absolute inset-0 pl-[72px] pr-2 flex items-center overflow-hidden">
        <div className="news-ticker-track flex items-center gap-10 whitespace-nowrap will-change-transform">
          {looped.map((msg, i) => (
            <span
              key={i}
              className="font-mono text-[12px] text-amber-100 inline-flex items-center gap-2"
              style={{ transform: "skewX(-12deg)" }}
            >
              <span className="text-amber-400">▸</span>
              <span style={{ transform: "skewX(12deg)", display: "inline-block" }}>
                {msg}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Fade nas bordas pra dar profundidade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

      <style>{`
        @keyframes newsTickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .news-ticker-track {
          animation: newsTickerScroll 28s linear infinite;
        }
      `}</style>
    </div>
  );
}
