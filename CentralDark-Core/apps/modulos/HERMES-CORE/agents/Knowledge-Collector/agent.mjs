#!/usr/bin/env node
// 📚 Agente Knowledge-Collector — memória operacional única do HERMES-CORE.
// REUSE_BEFORE_CREATE: não mantém segunda memória paralela; o ledger existente
// alimenta tanto persistência quanto recuperação contextual do decisor.
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const APRENDIZADOS_PATH = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/APRENDIZADOS.md';

function linhasLedger() {
  if (!existsSync(APRENDIZADOS_PATH)) return [];
  return readFileSync(APRENDIZADOS_PATH, 'utf-8')
    .split('\n')
    .filter((linha) => linha.startsWith('- '));
}

function oneLine(value, max = 500) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, max);
}

function tokens(value) {
  const stop = new Set([
    'para','com','sem','uma','uns','umas','que','por','dos','das','the','and','from',
    'isso','essa','esse','esta','este','mais','menos','como','quando','onde','true','false',
  ]);
  return new Set(
    oneLine(value, 4000)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9_/-]+/)
      .filter((t) => t.length >= 4 && !stop.has(t))
      .slice(0, 120)
  );
}

function refFromPayload(payload) {
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

export function consultar(tipo) {
  const linhas = linhasLedger();
  const relevantes = linhas.filter((l) => l.includes(`TIPO: ${tipo}`)).slice(-5);
  const erros = linhas.filter((l) => l.includes('TIPO: erro'));
  const erros_repetidos = {};
  erros.forEach((e) => {
    const causa = e.match(/CAUSA: (.+?)\|/);
    if (causa) erros_repetidos[causa[1]] = (erros_repetidos[causa[1]] || 0) + 1;
  });
  const alertas = Object.entries(erros_repetidos)
    .filter(([, count]) => count >= 2)
    .map(([causa, count]) => `⚠️ Erro recorrente (${count}x): ${causa}`);
  return { aprendizados: relevantes, alertas };
}

export function consultarContexto(contexto, limite = 14) {
  const query = tokens(contexto);
  if (!query.size) return [];

  const scored = linhasLedger()
    .slice(-1200)
    .map((linha, index) => {
      const row = tokens(linha);
      let score = 0;
      for (const token of query) if (row.has(token)) score += 1;
      if (/TIPO: (licao|correcao|tecnica|runtime)/.test(linha)) score += 0.25;
      return { linha, score, index };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => (b.score - a.score) || (b.index - a.index));

  const seen = new Set();
  const out = [];
  for (const item of scored) {
    const normalized = item.linha.replace(/^-[^|]+\|\s*/, '');
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(item.linha);
    if (out.length >= Math.max(1, Math.min(Number(limite) || 14, 30))) break;
  }
  return out;
}

export function registrar(tipo, contexto, causa, acaoCorretiva, confirmadoPor) {
  if (!confirmadoPor) return { written: false, reason: 'CONFIRMACAO_AUSENTE', ref: null };

  const safeTipo = oneLine(tipo || 'geral', 80);
  const safeContexto = oneLine(contexto || '-', 320);
  const safeCausa = oneLine(causa || '-', 320);
  const safeAcao = oneLine(acaoCorretiva || '-', 500);
  const safeConfirmado = oneLine(confirmadoPor, 120);
  const payload = `TIPO: ${safeTipo} | CONTEXTO: ${safeContexto} | CAUSA: ${safeCausa} | ACAO_CORRETIVA: ${safeAcao} | CONFIRMADO_POR: ${safeConfirmado}`;
  const ref = refFromPayload(payload);

  const existentes = linhasLedger();
  if (existentes.some((linha) => linha.includes(payload))) {
    return { written: false, deduped: true, ref };
  }

  const entrada = `- ${new Date().toISOString().slice(0,10)} | ${payload}\n`;
  appendFileSync(APRENDIZADOS_PATH, entrada);
  return { written: true, deduped: false, ref };
}

export function resumir() {
  const entradas = linhasLedger();
  if (!entradas.length) return 'Nenhum aprendizado ainda.';
  return `📚 Total de aprendizados: ${entradas.length} | Último: ${entradas[entradas.length - 1]}`;
}
