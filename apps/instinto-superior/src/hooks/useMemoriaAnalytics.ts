import { useCallback, useEffect, useRef, useState } from "react";

export type AmostraMemoria = {
  ts: number;
  usadoMB: number;
  totalMB: number;
};

export type CategoriaMemoria = {
  nome: string;
  mb: number;
  cor: string;
};

export type MemoriaStats = {
  agoraMB: number;
  picoMB: number;
  mediaMB: number;
  tendenciaMB: number;
  totalSistemaMB: number | null;
  historico: AmostraMemoria[];
  categorias: CategoriaMemoria[];
  gargalos: string[];
  fonte: string;
  ativo: boolean;
};

const MAX_AMOSTRAS = 720;
const INTERVALO_MS = 5_000;
const MB = 1024 * 1024;

function lerMemoriaNavegador(): { usadoMB: number; totalMB: number; limiteMB: number } | null {
  const perf = performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
  if (!perf.memory) return null;
  return {
    usadoMB: Math.round((perf.memory.usedJSHeapSize / MB) * 10) / 10,
    totalMB: Math.round((perf.memory.totalJSHeapSize / MB) * 10) / 10,
    limiteMB: Math.round((perf.memory.jsHeapSizeLimit / MB) * 10) / 10,
  };
}

function calcularTendencia(amostras: AmostraMemoria[], janela = 30): number {
  if (amostras.length < 2) return 0;
  const recentes = amostras.slice(-janela);
  if (recentes.length < 2) return 0;
  const primeiro = recentes[0]!.usadoMB;
  const ultimo = recentes[recentes.length - 1]!.usadoMB;
  return Math.round((ultimo - primeiro) * 10) / 10;
}

export function useMemoriaAnalytics(ativo = true) {
  const [stats, setStats] = useState<MemoriaStats>({
    agoraMB: 0,
    picoMB: 0,
    mediaMB: 0,
    tendenciaMB: 0,
    totalSistemaMB: null,
    historico: [],
    categorias: [],
    gargalos: [],
    fonte: "Verificando…",
    ativo: false,
  });
  const bufferRef = useRef<AmostraMemoria[]>([]);
  const picoRef = useRef(0);

  const limparHistorico = useCallback(() => {
    bufferRef.current = [];
    picoRef.current = 0;
    setStats((prev) => ({
      ...prev,
      historico: [],
      picoMB: 0,
      mediaMB: 0,
      tendenciaMB: 0,
    }));
  }, []);

  useEffect(() => {
    if (!ativo) return;

    const mem = lerMemoriaNavegador();
    if (!mem) {
      setStats((prev) => ({
        ...prev,
        fonte: "performance.memory indisponível neste navegador",
        ativo: false,
      }));
      return;
    }

    const deviceMemGB = (navigator as { deviceMemory?: number }).deviceMemory;
    const totalSistemaMB = deviceMemGB ? Math.round(deviceMemGB * 1024) : null;

    const coletar = () => {
      const leitura = lerMemoriaNavegador();
      if (!leitura) return;

      const amostra: AmostraMemoria = {
        ts: Date.now(),
        usadoMB: leitura.usadoMB,
        totalMB: leitura.totalMB,
      };

      const buffer = bufferRef.current;
      buffer.push(amostra);
      if (buffer.length > MAX_AMOSTRAS) buffer.splice(0, buffer.length - MAX_AMOSTRAS);

      if (leitura.usadoMB > picoRef.current) picoRef.current = leitura.usadoMB;

      const soma = buffer.reduce((acc, a) => acc + a.usadoMB, 0);
      const media = Math.round((soma / buffer.length) * 10) / 10;
      const tendencia = calcularTendencia(buffer);

      const heapAlocado = leitura.totalMB;
      const heapUsado = leitura.usadoMB;
      const heapLivre = Math.round((heapAlocado - heapUsado) * 10) / 10;

      const categorias: CategoriaMemoria[] = [
        { nome: "Heap usado", mb: heapUsado, cor: "var(--neon-blue)" },
        { nome: "Heap alocado", mb: heapAlocado, cor: "var(--neon-purple)" },
      ];

      const gargalos: string[] = [];
      if (heapUsado > heapAlocado * 0.85) {
        gargalos.push(`Heap JS acima de 85% da alocação (${heapUsado} / ${heapAlocado} MB).`);
      }
      if (heapLivre < 20) {
        gargalos.push(`Apenas ${heapLivre} MB livres no heap JS.`);
      }
      if (tendencia > 5) {
        gargalos.push(`Tendência de crescimento: +${tendencia} MB nas últimas amostras.`);
      }
      if (leitura.limiteMB && heapUsado > leitura.limiteMB * 0.7) {
        gargalos.push(`Uso acima de 70% do limite do heap (${leitura.limiteMB} MB).`);
      }

      setStats({
        agoraMB: heapUsado,
        picoMB: picoRef.current,
        mediaMB: media,
        tendenciaMB: tendencia,
        totalSistemaMB,
        historico: [...buffer],
        categorias,
        gargalos,
        fonte: "performance.memory (Chrome)",
        ativo: true,
      });
    };

    coletar();
    const id = setInterval(coletar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [ativo]);

  return { stats, limparHistorico };
}
