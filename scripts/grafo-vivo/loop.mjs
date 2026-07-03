#!/usr/bin/env node
/**
 * Loop do Grafo Vivo — regenera graph-data.json a cada 5min pra ser tempo-real contínuo.
 * Roda como processo PM2 (CentralDark-GrafoVivo). Sobrevive a reboot via dump.pm2.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const GERADOR = '/root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs';
const INTERVALO = 5 * 60 * 1000;

async function girar() {
  try {
    const { stdout } = await pexec('node', [GERADOR], { timeout: 60_000, maxBuffer: 10 * 1024 * 1024 });
    console.log(`[${new Date().toISOString()}] ${stdout.trim()}`);
  } catch (e) {
    console.error(`[${new Date().toISOString()}] ⚠️ regeneração falhou: ${(e.message || '').slice(0, 160)}`);
  }
}

console.log(`[${new Date().toISOString()}] 🕸️ Grafo Vivo loop online — regen a cada ${INTERVALO / 60000}min`);
girar();
setInterval(girar, INTERVALO);
