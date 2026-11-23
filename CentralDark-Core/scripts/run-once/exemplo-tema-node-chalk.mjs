#!/usr/bin/env node
import path from 'node:path';
import {
  getDefaultRevisoesDir,
  netflixDone,
  netflixHeader,
  netflixInfo,
  netflixStep,
  netflixSuccess,
  runWithSpinner,
  sanitizeLog,
  writeLog,
} from '../lib/theme-node.mjs';

const taskName = 'exemplo-tema-node-chalk';
const revisionDir = getDefaultRevisoesDir(taskName);
const logPath = path.join(revisionDir, 'full.log');

netflixHeader('Exemplo seguro - Tema Node Chalk');
netflixStep(1, 3, 'Validando modo exemplo');
netflixInfo('Este script nao toca VPS, PM2, Caddy, Docker, WuzAPI, WhatsApp, CRM, banco ou secrets.');

netflixStep(2, 3, 'Rodando loading animado');
await runWithSpinner('Simulando validacao read-only', async () => {
  await new Promise((resolve) => setTimeout(resolve, 700));
});

netflixStep(3, 3, 'Salvando log sanitizado');
const fullLog = [
  'Exemplo do Tema Netflix Node com Chalk.',
  'Modo: read-only demonstrativo.',
  'authorization: Bearer token_de_exemplo_nao_real_123456789',
  'SECRET=valor_de_exemplo_nao_real',
  'Resultado: OK',
].join('\n');

const savedLog = await writeLog(logPath, fullLog);
netflixSuccess(`Log salvo em ${savedLog}`);
netflixDone();

console.log('\nCOPIE-E-MANDE');
console.log(sanitizeLog(`STATUS=OK\nLOG=${savedLog}\nPROXIMO=usar theme-node.mjs em scripts Node novos`));
