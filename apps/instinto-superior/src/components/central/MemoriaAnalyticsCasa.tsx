import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  MemoryStick,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemoriaAnalytics, type AmostraMemoria } from "@/hooks/useMemoriaAnalytics";
import { BarraNeon } from "@/components/central/BarraNeon";

function formatarMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

function MiniGrafico({ amostras, picoMB }: { amostras: AmostraMemoria[]; picoMB: number }) {
  if (amostras.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
        Aguardando amostras…
      </div>
    );
  }

  const W = 600;
  const H = 120;
  const pad = { t: 8, b: 20, l: 50, r: 8 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  const max = Math.max(picoMB * 1.1, 10);
  const pontos = amostras.map((a, i) => {
    const x = pad.l + (i / (amostras.length - 1)) * cw;
    const y = pad.t + ch - (a.usadoMB / max) * ch;
    return `${x},${y}`;
  });

  const areaPath = `M${pad.l},${pad.t + ch} L${pontos.join(" L")} L${pad.l + cw},${pad.t + ch} Z`;
  const linhas = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: pad.t + ch - f * ch,
    label: formatarMB(f * max),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full" aria-hidden="true">
      {linhas.map((l) => (
        <g key={l.y}>
          <line x1={pad.l} y1={l.y} x2={W - pad.r} y2={l.y} stroke="currentColor" strokeOpacity={0.08} />
          <text x={pad.l - 4} y={l.y + 3} textAnchor="end" fill="currentColor" opacity={0.35} fontSize={8}>
            {l.label}
          </text>
        </g>
      ))}
      <defs>
        <linearGradient id="mem-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--neon-purple)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--neon-purple)" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#mem-grad)" />
      <polyline points={pontos.join(" ")} fill="none" stroke="var(--neon-purple)" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

function CartaoStat({
  icone,
  titulo,
  valor,
}: {
  icone: React.ReactNode;
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <span className="shrink-0 text-muted-foreground">{icone}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{titulo}</p>
        <p className="font-mono text-lg font-semibold">{valor}</p>
      </div>
    </div>
  );
}

export function MemoriaAnalyticsCasa() {
  const [aberto, setAberto] = useState(true);
  const { stats, limparHistorico } = useMemoriaAnalytics(aberto);

  const temGargalo = stats.gargalos.length > 0;
  const heapPct = stats.categorias.length >= 2 && stats.categorias[1]!.mb > 0
    ? Math.round((stats.categorias[0]!.mb / stats.categorias[1]!.mb) * 100)
    : 0;

  return (
    <section className="mt-6 rounded-xl border border-neon-purple/30 bg-background/80" aria-label="Analytics de memória">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <h4 className="flex items-center gap-2 text-lg font-semibold">
          <MemoryStick className="size-5 text-neon-purple" />
          🧠 Analytics de memória
        </h4>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            {stats.ativo ? `${stats.historico.length} amostras` : stats.fonte}
          </span>
          {aberto ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>

      {aberto && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          {!stats.ativo && (
            <div className="rounded-lg border border-gold/40 bg-gold/5 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium text-gold">
                <AlertTriangle className="size-4" /> Sensor limitado
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stats.fonte}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Para memória do sistema Windows, integrar o coletor CENTRALDARK-AFTERBURNER-LIVE.js
                ou expor via rota do harness.
              </p>
            </div>
          )}

          {temGargalo && (
            <div className="mb-4 rounded-lg border border-gold/40 bg-gold/5 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-gold">
                <AlertTriangle className="size-4" /> Atenção
              </p>
              {stats.gargalos.map((g) => (
                <p key={g} className="mt-1 text-xs text-muted-foreground">{g}</p>
              ))}
            </div>
          )}

          {stats.ativo && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <CartaoStat
                  icone={<BarChart3 className="size-4" />}
                  titulo="Agora"
                  valor={formatarMB(stats.agoraMB)}
                />
                <CartaoStat
                  icone={<TrendingUp className="size-4" />}
                  titulo="Pico"
                  valor={formatarMB(stats.picoMB)}
                />
                <CartaoStat
                  icone={<Clock className="size-4" />}
                  titulo="Média recente"
                  valor={formatarMB(stats.mediaMB)}
                />
                <CartaoStat
                  icone={stats.tendenciaMB >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  titulo="Tendência"
                  valor={`${stats.tendenciaMB >= 0 ? "+" : ""}${stats.tendenciaMB} MB`}
                />
              </div>

              <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold">Histórico</h5>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date().toLocaleTimeString("pt-BR")}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {stats.historico.length} amostras, intervalo de {Math.round(5)} s.
                </p>
                <div className="mt-2">
                  <MiniGrafico amostras={stats.historico} picoMB={stats.picoMB} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{formatarMB(0)}</span>
                  <span>{formatarMB(stats.picoMB)}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold">Gargalos</h5>
                    {temGargalo && <AlertTriangle className="size-4 text-gold" />}
                  </div>
                  {temGargalo ? (
                    <ul className="mt-3 space-y-2">
                      {stats.gargalos.map((g) => (
                        <li key={g} className="rounded border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                          {g}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Nenhum gargalo detectado no momento.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold">Composição atual</h5>
                    <Cpu className="size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {stats.categorias.length} categorias rastreadas.
                  </p>
                  <div className="mt-3 space-y-3">
                    {stats.categorias.map((cat) => (
                      <div key={cat.nome}>
                        <div className="flex items-center justify-between text-xs">
                          <span>{cat.nome}</span>
                          <span className="font-mono font-semibold">{formatarMB(cat.mb)}</span>
                        </div>
                        <BarraNeon
                          percentual={stats.picoMB > 0 ? (cat.mb / stats.picoMB) * 100 : 0}
                          tom={cat.cor.includes("blue") ? "neon" : "roxo"}
                          altura="sm"
                          particulas={false}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                  {heapPct > 0 && (
                    <p className="mt-3 text-[10px] text-muted-foreground">
                      Heap usado ocupa {heapPct}% do heap alocado.
                    </p>
                  )}
                </div>
              </div>

              {stats.totalSistemaMB && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Memória do dispositivo reportada pelo navegador: ~{formatarMB(stats.totalSistemaMB)}
                </p>
              )}
            </>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              Fonte: {stats.fonte}
              {stats.totalSistemaMB ? ` · Device: ~${formatarMB(stats.totalSistemaMB)}` : ""}
            </p>
            <button
              type="button"
              onClick={limparHistorico}
              className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Trash2 className="size-3" /> Limpar histórico
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
