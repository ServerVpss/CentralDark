import { useEffect, useState } from "react";

// Relógio vivo global: um único setInterval de 1s compartilhado por toda a
// árvore de componentes, em vez de cada card criar o seu. Ele só recalcula
// APRESENTAÇÃO (tempo decorrido, contagem regressiva, horário atual) — nunca
// reescreve o timestamp real recebido da fonte. Datas históricas continuam
// históricas mesmo com o contador girando.
let intervaloGlobal: ReturnType<typeof setInterval> | null = null;
const assinantes = new Set<() => void>();
let agoraAtual = Date.now();

function tick() {
  agoraAtual = Date.now();
  assinantes.forEach((ouvinte) => ouvinte());
}

function garantirIntervalo() {
  if (intervaloGlobal) return;
  intervaloGlobal = setInterval(tick, 1000);
}

function liberarIntervaloSeVazio() {
  if (assinantes.size === 0 && intervaloGlobal) {
    clearInterval(intervaloGlobal);
    intervaloGlobal = null;
  }
}

/**
 * Timestamp atual (ms), atualizado a cada 1s por um único timer compartilhado.
 * Retorna `null` até montar no cliente — igual ao guard de hidratação já usado
 * no StatusPanel: servidor e o primeiro render do cliente não podem depender
 * de Date.now(), senão o React acusa divergência de hidratação. Depois de
 * montado, nunca mais volta a `null`.
 */
export function useRelogioVivo(): number | null {
  const [valor, definirValor] = useState<number | null>(null);
  useEffect(() => {
    definirValor(agoraAtual);
    const ouvinte = () => definirValor(agoraAtual);
    assinantes.add(ouvinte);
    garantirIntervalo();
    return () => {
      assinantes.delete(ouvinte);
      liberarIntervaloSeVazio();
    };
  }, []);
  return valor;
}

/** Tempo decorrido legível desde um timestamp ISO/epoch real. Não altera a data original. */
export function tempoDecorrido(desde: string | number | null | undefined, agora: number | null): string {
  if (desde === null || desde === undefined || desde === "") return "sem medição";
  if (agora === null) return "…";
  const ts = typeof desde === "number" ? desde : Date.parse(desde);
  if (!Number.isFinite(ts)) return "data inválida";
  const diffMs = Math.max(0, agora - ts);
  const s = Math.floor(diffMs / 1000);
  if (s < 5) return "agora mesmo";
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

/** Contagem regressiva MM:SS até um alvo (epoch ms). Nunca fica negativa na tela. */
export function contagemRegressiva(alvoMs: number, agora: number | null): string {
  if (agora === null) return "--:--";
  const restanteMs = Math.max(0, alvoMs - agora);
  const totalS = Math.ceil(restanteMs / 1000);
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
