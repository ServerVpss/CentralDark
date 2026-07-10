// Teste automatizado da rota /v1/models do Arsenal Adapter (Gateway CentralDark).
// Verifica:
//   - status 200 e formato OpenAI-compat ({ object: 'list', data: [...] })
//   - aliases internos presentes (arsenal-router/parallel/debate/hermes)
//   - familia Grok-4 presente (grok-4.5 canonico + qualquer grok-4.x)
//   - aliases Claude/GPT presentes
//   - total >= total do catalogo Abacus (upstream), quando alcancavel
//
// Uso:
//   GATEWAY_URL=https://api.centralldark.com node tests/models.test.mjs
//   npm test
//
// Saida: exit 0 se todos passarem, exit 1 se qualquer falhar. Log placar padrao.

import assert from 'node:assert/strict';

const GATEWAY = (process.env.GATEWAY_URL || 'https://api.centralldark.com').replace(/\/+$/, '');
const ABACUS_UPSTREAM = process.env.ABACUS_UPSTREAM || 'https://routellm.abacus.ai/v1/models';
const ABACUS_KEY = process.env.ABACUS_API_KEY || '';

const OBRIGATORIOS = {
  aliasesArsenal: ['arsenal-router', 'arsenal-parallel', 'arsenal-debate', 'arsenal-hermes'],
  aliasesClaude:  ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
  aliasesGPT:     ['gpt-4o', 'gpt-4o-mini'],
  grokCanonicos:  ['grok-4.5'],
};

const resultados = [];
function ok(nome, detalhe = '')  { resultados.push({ nome, status: '🟢', detalhe }); }
function warn(nome, detalhe = ''){ resultados.push({ nome, status: '🟡', detalhe }); }
function fail(nome, detalhe = ''){ resultados.push({ nome, status: '🔴', detalhe }); }

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
    ok('GET /v1/models 200 + shape OpenAI', `total=${gw.body.data.length}`);
  } catch (e) {
    fail('GET /v1/models', e.message);
    imprimirPlacar();
    process.exit(1);
  }

  const ids = gw.body.data.map((m) => m.id);
  const idsSet = new Set(ids);

  const faltamArsenal = OBRIGATORIOS.aliasesArsenal.filter((a) => !idsSet.has(a));
  faltamArsenal.length === 0
    ? ok('Aliases Arsenal presentes', OBRIGATORIOS.aliasesArsenal.join(', '))
    : fail('Aliases Arsenal ausentes', faltamArsenal.join(', '));

  const grok4Any = ids.filter((i) => /^grok-4(\.\d+)?$/i.test(i));
  grok4Any.length > 0
    ? ok('Familia Grok-4 presente', grok4Any.join(', '))
    : fail('Familia Grok-4 ausente', 'nenhum grok-4.x encontrado');

  const canonicosGrokFaltando = OBRIGATORIOS.grokCanonicos.filter((g) => !idsSet.has(g));
  canonicosGrokFaltando.length === 0
    ? ok('Grok canonico esperado (grok-4.5)', 'ok')
    : fail('Grok canonico ausente', canonicosGrokFaltando.join(', '));

  const faltamClaude = OBRIGATORIOS.aliasesClaude.filter((a) => !idsSet.has(a));
  faltamClaude.length === 0
    ? ok('Aliases Claude presentes', OBRIGATORIOS.aliasesClaude.join(', '))
    : fail('Aliases Claude ausentes', faltamClaude.join(', '));

  const faltamGPT = OBRIGATORIOS.aliasesGPT.filter((a) => !idsSet.has(a));
  faltamGPT.length === 0
    ? ok('Aliases GPT presentes', OBRIGATORIOS.aliasesGPT.join(', '))
    : fail('Aliases GPT ausentes', faltamGPT.join(', '));

  if (ABACUS_KEY) {
    try {
      const up = await fetchJson(ABACUS_UPSTREAM, { Authorization: `Bearer ${ABACUS_KEY}` });
      const totalUpstream = Array.isArray(up.body?.data) ? up.body.data.length : 0;
      const totalGateway = ids.length;
      const diff = totalGateway - totalUpstream;
      if (totalGateway >= totalUpstream) {
        ok('Total gateway >= Abacus upstream', `gateway=${totalGateway} · abacus=${totalUpstream} · delta=+${diff}`);
      } else {
        fail('Total gateway < Abacus upstream', `gateway=${totalGateway} · abacus=${totalUpstream} · delta=${diff}`);
      }
    } catch (e) {
      warn('Comparacao com Abacus upstream falhou', e.message);
    }
  } else {
    warn('ABACUS_API_KEY nao setada', `pulando comparacao com ${ABACUS_UPSTREAM}`);
  }

  imprimirPlacar();
  const falhou = resultados.some((r) => r.status === '🔴');
  process.exit(falhou ? 1 : 0);
}

function imprimirPlacar() {
  console.log('\n📊 Placar do teste /v1/models');
  for (const r of resultados) {
    console.log(`  ${r.status} ${r.nome}${r.detalhe ? ' — ' + r.detalhe : ''}`);
  }
  const okN = resultados.filter((r) => r.status === '🟢').length;
  const wrN = resultados.filter((r) => r.status === '🟡').length;
  const flN = resultados.filter((r) => r.status === '🔴').length;
  console.log(`\nResumo: 🟢 ${okN} · 🟡 ${wrN} · 🔴 ${flN}`);
}

main().catch((e) => {
  console.error('💥 Erro fatal:', e);
  process.exit(1);
});
