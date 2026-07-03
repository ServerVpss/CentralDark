import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PENDENCIAS_PATH = join(import.meta.dirname, '../../docs/PENDENCIAS.md');
const LOG_PATH = join(import.meta.dirname, 'logs/vigia.log');
const ULTIMA_PERGUNTA_PATH = join(import.meta.dirname, 'logs/ultima_pergunta.json');

function log(mensagem) {
  const linha = `${new Date().toISOString()} | ${mensagem}\n`;
  appendFileSync(LOG_PATH, linha);
  console.log('[VIGIA]', mensagem);
}

function horarioPermitido() {
  const hora = new Date().getHours();
  return hora >= 7 && hora <= 23;
}

function podePerguntar() {
  if (!existsSync(ULTIMA_PERGUNTA_PATH)) return true;
  const ultima = JSON.parse(readFileSync(ULTIMA_PERGUNTA_PATH, 'utf-8'));
  const diffMin = (Date.now() - ultima.timestamp) / 1000 / 60;
  if (ultima.ignorada && diffMin < 60) return false;
  return diffMin > 30;
}

function getPrioridade(item) {
  if (item.includes('P0')) return 0;
  if (item.includes('P1')) return 1;
  if (item.includes('P2')) return 2;
  return 3;
}

export async function verificar() {
  log('Iniciando verificação...');
  if (!horarioPermitido()) { log('Horário 00-07. Dormindo.'); return; }
  if (!podePerguntar()) { log('Intervalo/ignorada. Dormindo.'); return; }
  if (!existsSync(PENDENCIAS_PATH)) { log('PENDENCIAS.md ausente.'); return; }
  const pendencias = readFileSync(PENDENCIAS_PATH, 'utf-8');
  const itens = pendencias.split('\n').filter(l => l.startsWith('- [ ]') || l.startsWith('- [x]'));
  const abertos = itens.filter(l => l.startsWith('- [ ]'));
  if (abertos.length === 0) { log('Sem pendencias.'); return; }
  abertos.sort((a, b) => getPrioridade(a) - getPrioridade(b));
  const item = abertos[0];
  const prioridade = getPrioridade(item) === 0 ? 'P0' : getPrioridade(item) === 1 ? 'P1' : 'P2';
  log(`Prioritário: ${item.trim().slice(0, 80)}`);
  const urgente = prioridade === 'P0';
  writeFileSync(ULTIMA_PERGUNTA_PATH, JSON.stringify({
    timestamp: Date.now(), item: item.trim(), prioridade, ignorada: false
  }));
  return { pergunta: `🔔 PENDENCIAS: ${item.trim().slice(0, 100)}`, prioridade, urgente };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verificar().then(r => { if (r) console.log(JSON.stringify(r, null, 2)); process.exit(0); });
}
