// Teste automatizado /v1/models — Arsenal Adapter (Gateway CentralDark)
//
// Invariantes CRÍTICOS (falha 🔴 quebra CI):
//   1. HTTP 200 no gateway (/v1/models público)
//   2. Shape OpenAI-compat ({ object: 'list', data: [...] })
//   3. Aliases Arsenal presentes (arsenal-router/parallel/debate/hermes)
//
// Warnings 🟡 (não quebram CI):
//   - Família Grok-4 (só existe quando catálogo dinâmico Abacus está ativo)
//   - Aliases Claude/GPT (fase discovery — reintroduzidos em PR dedicado)
//   - Prova autenticada com CENTRALDARK_API_KEY (requer secret cadastrado)

import assert from 'node:assert/strict';

const GATEWAY = (process.env.GATEWAY_URL || 'https://api.centralldark.com').replace(/\/+$/, '');
const CENTRALDARK_KEY = process.env.CENTRALDARK_API_KEY || '';

const ARSENAL_OBRIGATORIOS = ['arsenal-router', 'arsenal-parallel', 'arsenal-debate', 'arsenal-hermes'];
const CLAUDE_ESPERADOS   = ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'];
const GPT_ESPERADOS      = ['gpt-4o', 'gpt-4o-mini'];

const resultados = [];
const ok   = (n, d = '') => resultados.push({ n, s: '🟢', d });
const warn = (n, d = '') => resultados.push({ n, s: '🟡', d });
const fail = (n, d = '') => resultados.push({ n, s: '🔴', d });

async function fetchJson(url, headers = {}) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
  return { status: r.status, body: await r.json() };
}

async function main() {
  console.log(`🚀 Testando ${GATEWAY}/v1/models ...`);

  let gw;
  try {
    gw = await fetchJson(`${GATEWAY}/v1/models`);
    assert.equal(gw.status, 200, 'status HTTP');
    assert.equal(gw.body?.object, 'list', 'shape object=list');
    assert.ok(Array.isArray(gw.body?.data), 'shape data=[]');
    ok('CRÍTICO — GET /v1/models 200 + shape OpenAI', `total=${gw.body.data.length}`);
  } catch (e) {
    fail('CRÍTICO — GET /v1/models', e.message);
    imprimirPlacar();
    process.exit(1);
  }

  const ids = gw.body.data.map((m) => m.id);
  const idsSet = new Set(ids);

  const faltamArsenal = ARSENAL_OBRIGATORIOS.filter((a) => !idsSet.has(a));
  faltamArsenal.length === 0
    ? ok('CRÍTICO — Aliases Arsenal presentes', ARSENAL_OBRIGATORIOS.join(', '))
    : fail('CRÍTICO — Aliases Arsenal ausentes', faltamArsenal.join(', '));

  const grok4Any = ids.filter((i) => /^grok-4(\.\d+)?$/i.test(i));
  grok4Any.length > 0
    ? ok('Família Grok-4 presente', grok4Any.join(', '))
    : warn('Família Grok-4 ausente', 'esperado quando catálogo dinâmico Abacus ativo');

  const faltamClaude = CLAUDE_ESPERADOS.filter((a) => !idsSet.has(a));
  faltamClaude.length === 0
    ? ok('Aliases Claude presentes', CLAUDE_ESPERADOS.join(', '))
    : warn('Aliases Claude ausentes (não crítico)', faltamClaude.join(', '));

  const faltamGPT = GPT_ESPERADOS.filter((a) => !idsSet.has(a));
  faltamGPT.length === 0
    ? ok('Aliases GPT presentes', GPT_ESPERADOS.join(', '))
    : warn('Aliases GPT ausentes (não crítico)', faltamGPT.join(', '));

  if (CENTRALDARK_KEY) {
    const tentativas = [
      { nome: 'Authorization: Bearer', headers: { Authorization: `Bearer ${CENTRALDARK_KEY}` } },
      { nome: 'x-api-key',             headers: { 'x-api-key': CENTRALDARK_KEY } },
    ];
    for (const t of tentativas) {
      try {
        const r = await fetchJson(`${GATEWAY}/v1/models`, t.headers);
        assert.equal(r.status, 200);
        assert.ok(Array.isArray(r.body?.data), 'data array');
        ok(`Auth CentralDark (${t.nome})`, `total=${r.body.data.length}`);
      } catch (e) {
        warn(`Auth CentralDark falhou (${t.nome})`, e.message);
      }
    }
  } else {
    warn('CENTRALDARK_API_KEY não setada', 'pulando prova autenticada — cadastre em Settings → Secrets → Actions');
  }

  imprimirPlacar();
  const falhou = resultados.some((r) => r.s === '🔴');
  process.exit(falhou ? 1 : 0);
}

function imprimirPlacar() {
  console.log('\n📊 Placar do teste /v1/models');
  for (const r of resultados) {
    console.log(`  ${r.s} ${r.n}${r.d ? ' — ' + r.d : ''}`);
  }
  const g = resultados.filter((r) => r.s === '🟢').length;
  const y = resultados.filter((r) => r.s === '🟡').length;
  const rd = resultados.filter((r) => r.s === '🔴').length;
  console.log(`\nResumo: 🟢 ${g} · 🟡 ${y} · 🔴 ${rd}`);
}

main().catch((e) => {
  console.error('💥 Erro fatal:', e);
  process.exit(1);
});
