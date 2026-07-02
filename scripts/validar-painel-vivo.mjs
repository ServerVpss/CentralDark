#!/usr/bin/env node
// Valida painel-data.json (campos, enums, ranges) e endpoints públicos.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const FILE = 'CentralDark/apps/modulos/status/painel-data.json';
const OUT_DIR = 'docs/RELATORIOS/painel-vivo-validacao';

mkdirSync(OUT_DIR, { recursive: true });
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const erros = [];
const ok = [];

function v(cond, msg) { (cond ? ok : erros).push(msg); }

v(typeof data.project?.overallProgress === 'number' && data.project.overallProgress >= 0 && data.project.overallProgress <= 100, 'project.overallProgress 0..100');
v(Array.isArray(data.maturity) && data.maturity.length > 0, 'maturity[] presente');
for (const m of data.maturity || []) {
  v(typeof m.value === 'number' && m.value >= 0 && m.value <= 100, `maturity ${m.name}: value 0..100`);
}
for (const ms of data.milestones || []) {
  v(['done', 'doing', 'next', 'later'].includes(ms.status), `milestone ${ms.title}: status enum`);
  v(typeof ms.percent === 'number' && ms.percent >= 0 && ms.percent <= 100, `milestone ${ms.title}: percent 0..100`);
}

// Endpoints
const endpoints = data.liveStatus || [
  { name: 'MCP Health', url: 'https://mcp.centralldark.com/health' },
  { name: 'MCP Status', url: 'https://mcp.centralldark.com/status.json' },
  { name: 'Install Status', url: 'https://install.centralldark.com/status.json' },
  { name: 'Painel', url: 'https://status.centralldark.com/' },
];

const live = await Promise.all(endpoints.map(async (ep) => {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(ep.url, { signal: ctrl.signal });
    clearTimeout(to);
    return { ...ep, status: r.status, ms: Date.now() - t0, cors: r.headers.get('access-control-allow-origin') };
  } catch (e) {
    return { ...ep, status: 0, ms: Date.now() - t0, error: String(e.message || e) };
  }
}));

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const md = `# Validação do Mega Painel — ${stamp}

## Estrutura
- ✅ ok: ${ok.length}
- ❌ erros: ${erros.length}

${erros.length ? '### Erros\n' + erros.map((e) => `- ❌ ${e}`).join('\n') : '_Estrutura limpa._'}

## Endpoints ao vivo
| Endpoint | Status | Latência | CORS |
|---|---|---|---|
${live.map((l) => `| ${l.name} | ${l.status === 0 ? '🔴 down' : l.status < 400 ? '🟢 ' + l.status : '🟠 ' + l.status} | ${l.ms}ms | ${l.cors || '—'} |`).join('\n')}
`;

writeFileSync(path.join(OUT_DIR, `${stamp}.md`), md);
writeFileSync(path.join(OUT_DIR, 'latest.md'), md);
console.log(`Validação: ${ok.length} ok, ${erros.length} erros, ${live.filter(l => l.status >= 200 && l.status < 400).length}/${live.length} endpoints OK.`);
if (erros.length > 0) process.exitCode = 1;
