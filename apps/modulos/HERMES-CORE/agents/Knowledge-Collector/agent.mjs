#!/usr/bin/env node
// 📚 Agente Knowledge-Collector — coleta e consulta o ledger de aprendizados do ARSENAL.
// (migrado de cerebro.mjs — mesma API: consultar/registrar/resumir; path agora absoluto)
import { readFileSync, existsSync, appendFileSync } from 'node:fs';

const APRENDIZADOS_PATH = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/APRENDIZADOS.md';

export function consultar(tipo) {
  if (!existsSync(APRENDIZADOS_PATH)) return [];
  const conteudo = readFileSync(APRENDIZADOS_PATH, 'utf-8');
  const linhas = conteudo.split('\n').filter(l => l.startsWith('-'));
  const relevantes = linhas.filter(l => l.includes(`TIPO: ${tipo}`)).slice(-5);
  const erros = linhas.filter(l => l.includes('TIPO: erro'));
  const erros_repetidos = {};
  erros.forEach(e => {
    const causa = e.match(/CAUSA: (.+?)\|/);
    if (causa) erros_repetidos[causa[1]] = (erros_repetidos[causa[1]] || 0) + 1;
  });
  const alertas = Object.entries(erros_repetidos)
    .filter(([, count]) => count >= 2)
    .map(([causa, count]) => `⚠️ Erro recorrente (${count}x): ${causa}`);
  return { aprendizados: relevantes, alertas };
}

export function registrar(tipo, contexto, causa, acaoCorretiva, confirmadoPor) {
  if (!confirmadoPor) return;
  const entrada = `- ${new Date().toISOString().slice(0,10)} | TIPO: ${tipo} | CONTEXTO: ${contexto} | CAUSA: ${causa} | ACAO_CORRETIVA: ${acaoCorretiva} | CONFIRMADO_POR: ${confirmadoPor}\n`;
  appendFileSync(APRENDIZADOS_PATH, entrada);
}

export function resumir() {
  if (!existsSync(APRENDIZADOS_PATH)) return 'Nenhum aprendizado ainda.';
  const conteudo = readFileSync(APRENDIZADOS_PATH, 'utf-8');
  const entradas = conteudo.split('\n').filter(l => l.startsWith('-'));
  return `📚 Total de aprendizados: ${entradas.length} | Último: ${entradas[entradas.length-1] || 'nenhum'}`;
}
