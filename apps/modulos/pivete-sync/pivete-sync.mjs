#!/usr/bin/env node
/**
 * pivete-sync.mjs — heartbeat de compatibilidade do sync legado.
 *
 * O antigo processo fazia HUB ↔ docs/CONSCIENCIA/PIVETE-IA e podia escrever
 * memória histórica de volta no Git. Isso criava uma segunda fonte da verdade.
 *
 * Estado atual:
 *   GIT_CANONICAL=true
 *   HUB_TO_GIT=false
 *   GIT_TO_LEGACY_PIVETE_HUB=false
 *   LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY=true
 *
 * O processo permanece temporariamente como heartbeat para não transformar
 * saneamento de contexto em mudança de PM2/runtime. Remoção do processo exige
 * medição causal do runtime em missão própria.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const LOG_MARKER = '/root/CentralDark/logs/pivete-sync-last.txt';
const INTERVALO_MS = Number.parseInt(process.env.PIVETE_SYNC_INTERVALO_MS || '300000', 10);
const MODE = 'LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY';

if (!Number.isFinite(INTERVALO_MS) || INTERVALO_MS < 1000) {
  console.error('PIVETE_SYNC_CONFIG_ERROR intervalo_invalido');
  process.exit(1);
}

function heartbeat() {
  const linha = [
    new Date().toISOString(),
    `MODE=${MODE}`,
    'GIT_CANONICAL=true',
    'HUB_TO_GIT=false',
    'GIT_TO_LEGACY_PIVETE_HUB=false',
  ].join(' ');

  console.log(linha);
  try {
    mkdirSync(dirname(LOG_MARKER), { recursive: true });
    writeFileSync(LOG_MARKER, linha, { flag: 'w' });
  } catch (error) {
    console.error(`PIVETE_SYNC_HEARTBEAT_ERROR=${error?.name || 'Error'}`);
  }
}

async function loop() {
  while (true) {
    heartbeat();
    await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS));
  }
}

loop().catch((error) => {
  console.error(`PIVETE_SYNC_FATAL=${error?.name || 'Error'}`);
  process.exitCode = 1;
});
