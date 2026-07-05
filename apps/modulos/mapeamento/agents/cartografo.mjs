// 🗺️ Cartógrafo — 1 agente, roda a cada 30min via cron
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { escanear, diff } from '../core/scanner.mjs';
import { notificar } from '../../grupo-evolucao/core/notificador.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, '..');
const MAPA_ATUAL = path.join(RAIZ, 'logs', 'mapa-atual.json');
const HISTORICO = path.join(RAIZ, 'logs', 'historico');
const MISSOES_EVOLUCAO = '/root/CentralDark/apps/modulos/grupo-evolucao/missions';

async function lerAnterior() {
  try { return JSON.parse(await fs.readFile(MAPA_ATUAL, 'utf8')); }
  catch { return null; }
}

async function dispararDebate(driftList) {
  await fs.mkdir(MISSOES_EVOLUCAO, { recursive: true });
  const id = `drift-${Date.now()}`;
  const missao = {
    id,
    tema: `Drift detectado (${driftList.length} mudanças)`,
    contexto: { drift: driftList },
    origem: 'cartografo',
  };
  const arquivo = path.join(MISSOES_EVOLUCAO, `${id}.json`);
  await fs.writeFile(arquivo, JSON.stringify(missao, null, 2));
  const orq = '/root/CentralDark/apps/modulos/grupo-evolucao/core/orquestrador.mjs';
  const p = spawn('node', [orq, arquivo], { detached: true, stdio: 'ignore' });
  p.unref();
  return id;
}

async function main() {
  console.log('[cartografo] 🗺️ escaneando...');
  const anterior = await lerAnterior();
  const atual = await escanear();

  await fs.mkdir(path.dirname(MAPA_ATUAL), { recursive: true });
  await fs.mkdir(HISTORICO, { recursive: true });

  const drifts = diff(anterior, atual);
  const houveDrift = drifts.length > 0 && !(drifts.length === 1 && drifts[0].tipo === 'primeiro-mapa');

  await fs.writeFile(MAPA_ATUAL, JSON.stringify(atual, null, 2));

  if (houveDrift) {
    const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(path.join(HISTORICO, `${carimbo}.json`), JSON.stringify({ atual, drifts }, null, 2));
    const debateId = await dispararDebate(drifts);
    console.log(`[cartografo] 🚨 drift → debate ${debateId}`);
    await notificar({
      modulo: 'MAPEAMENTO',
      status: '⚠️',
      acao: `Drift detectado (${drifts.length})`,
      prova: drifts.slice(0, 3).map(d => `${d.tipo}:${d.detalhe}`).join(' | ').slice(0, 60),
      proxima: `Debate ${debateId} disparado`,
    });
  } else {
    console.log('[cartografo] ✅ sem drift');
  }
}

main().catch(async (e) => {
  console.error('[cartografo] ❌', e);
  try {
    await notificar({
      modulo: 'MAPEAMENTO',
      status: '❌',
      acao: 'Cartografo falhou',
      prova: String(e?.message || e).slice(0, 60),
      proxima: 'ver logs cron',
    });
  } catch {}
  process.exit(1);
});
