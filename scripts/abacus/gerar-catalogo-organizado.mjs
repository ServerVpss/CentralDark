#!/usr/bin/env node
/**
 * Gera catálogo Abacus RouteLLM organizado:
 *   docs/GATEWAY/ABACUS-CATALOGO-ORGANIZADO.md
 *   docs/GATEWAY/abacus-catalog.json
 *
 * Fontes de chave (nesta ordem, sem imprimir secret):
 *   1) process.env.PROVIDER_KEY / ABACUS_API_KEY
 *   2) PM2 env do processo Arsenal*
 *   3) fallback string em arsenal-openai-adapter/ecosystem.config.cjs (só se existir)
 *
 * Uso:
 *   node scripts/abacus/gerar-catalogo-organizado.mjs
 *   PROVIDER_KEY=... node scripts/abacus/gerar-catalogo-organizado.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const OUT_DIR = join(ROOT, 'docs/GATEWAY');
const OUT_MD = join(OUT_DIR, 'ABACUS-CATALOGO-ORGANIZADO.md');
const OUT_JSON = join(OUT_DIR, 'abacus-catalog.json');
const REGRAS_PATH = join(ROOT, 'docs/CONSCIENCIA/ARSENAL/regras.json');
const ECO_PATH = join(ROOT, 'apps/modulos/arsenal-openai-adapter/ecosystem.config.cjs');

function loadProvider() {
  let base = process.env.PROVIDER_BASE || 'https://routellm.abacus.ai/v1';
  let key = process.env.PROVIDER_KEY || process.env.ABACUS_API_KEY || '';

  if (!key) {
    try {
      const j = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8', maxBuffer: 30e6 }));
      const p = j.find((x) => /Arsenal/i.test(x.name || ''));
      if (p?.pm2_env) {
        base = p.pm2_env.PROVIDER_BASE || base;
        key = p.pm2_env.PROVIDER_KEY || p.pm2_env.ABACUS_API_KEY || '';
      }
    } catch {
      /* pm2 opcional */
    }
  }

  if (!key) {
    try {
      const eco = readFileSync(ECO_PATH, 'utf8');
      const m = eco.match(/PROVIDER_KEY:\s*process\.env\.ABACUS_API_KEY\s*\|\|\s*'([^']+)'/);
      if (m) key = m[1];
      const b = eco.match(/PROVIDER_BASE:\s*'([^']+)'/);
      if (b) base = b[1];
    } catch {
      /* ignore */
    }
  }

  return { base, key };
}

function classify(id) {
  const x = id.toLowerCase();
  if (x === 'route-llm' || x.includes('route-llm'))
    return { key: '00-route', family: 'Route-LLM', kind: 'router', emoji: '🧭' };
  if (x.includes('claude') || x.includes('anthropic'))
    return { key: '01-claude', family: 'Claude (Anthropic)', kind: 'chat', emoji: '🟣' };
  if (/^o[0-9]/.test(x) || x.includes('gpt-oss'))
    return { key: '02-openai-reason', family: 'OpenAI Reasoning (o-series)', kind: 'chat', emoji: '🧠' };
  if (x.includes('codex'))
    return { key: '03-openai-code', family: 'OpenAI Codex / Code', kind: 'chat', emoji: '💻' };
  if (
    /^gpt-5|^gpt-4|^gpt-audio|^openai\//.test(x) &&
    !x.includes('image') &&
    !x.includes('tts')
  )
    return { key: '04-openai-chat', family: 'OpenAI Chat (GPT)', kind: 'chat', emoji: '🟢' };
  if (x.includes('gemini') || x.includes('gemma'))
    return {
      key: '05-gemini',
      family: 'Gemini / Gemma (Google)',
      kind: x.includes('image') || x.includes('tts') ? 'multimodal' : 'chat',
      emoji: '🔵',
    };
  if (x.includes('grok-') && !x.includes('imagine'))
    return { key: '06-grok', family: 'Grok (xAI) Chat', kind: 'chat', emoji: '⚫' };
  if (x.includes('deepseek'))
    return { key: '07-deepseek', family: 'DeepSeek', kind: 'chat', emoji: '🐋' };
  if (x.includes('llama') || x.includes('meta-llama'))
    return { key: '08-llama', family: 'Llama (Meta)', kind: 'chat', emoji: '🦙' };
  if (x.includes('qwen') && !x.includes('image'))
    return { key: '09-qwen', family: 'Qwen', kind: 'chat', emoji: '🔶' };
  if (x.includes('kimi') || x.includes('moonshot'))
    return { key: '10-kimi', family: 'Kimi (Moonshot)', kind: 'chat', emoji: '🌙' };
  if (x.includes('glm') || x.includes('zai-org'))
    return { key: '11-glm', family: 'GLM (Zhipu)', kind: 'chat', emoji: '🔷' };
  if (x.includes('minimax') && x.includes('/'))
    return { key: '12-minimax-chat', family: 'MiniMax Chat', kind: 'chat', emoji: '⚡' };
  if (x.includes('mimo'))
    return { key: '13-mimo', family: 'Mimo', kind: 'chat', emoji: '✨' };
  if (x.includes('mistral') || x.includes('mixtral') || x.includes('codestral'))
    return { key: '14-mistral', family: 'Mistral', kind: 'chat', emoji: '🟠' };
  if (
    x.includes('tts') ||
    x.includes('audio') ||
    x.includes('elevenlabs') ||
    x.includes('hume') ||
    x === 'openai_tts'
  )
    return { key: '20-audio', family: 'Áudio / TTS', kind: 'audio', emoji: '🔊' };
  if (
    x.includes('image') ||
    x.includes('dalle') ||
    x.includes('flux') ||
    x.includes('midjourney') ||
    x.includes('ideogram') ||
    x.includes('recraft') ||
    x.includes('seedream') ||
    x.includes('nano_banana') ||
    x.includes('dreamina') ||
    x.includes('hunyuan') ||
    x.includes('magnific') ||
    x.includes('topaz') ||
    x.includes('gpt_image') ||
    x.includes('grok_imagine_image') ||
    x.includes('imagine_art') ||
    x.includes('qwen_image')
  )
    return { key: '21-image', family: 'Imagem', kind: 'image', emoji: '🖼️' };
  if (
    x.includes('video') ||
    x.includes('veo') ||
    x.includes('kling') ||
    x.includes('sora') ||
    x.includes('seedance') ||
    x.includes('runway') ||
    x.includes('luma') ||
    x.includes('wan') ||
    x.includes('minimax') ||
    x.includes('muse-spark') ||
    x.includes('grok_imagine_video')
  )
    return { key: '22-video', family: 'Vídeo', kind: 'video', emoji: '🎬' };
  return { key: '99-outros', family: 'Outros', kind: 'other', emoji: '📦' };
}

async function main() {
  const { base, key } = loadProvider();
  if (!key) {
    console.error('🔴 Sem PROVIDER_KEY/ABACUS_API_KEY (env, PM2 Arsenal ou ecosystem). Abortando.');
    process.exit(1);
  }

  const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${key}` } });
  if (!r.ok) {
    console.error('🔴 GET /models falhou:', r.status, (await r.text()).slice(0, 200));
    process.exit(1);
  }
  const j = await r.json();
  const raw = (j.data || [])
    .map((m) => ({
      id: m.id,
      object: m.object || 'model',
      owned_by: m.owned_by || null,
      ...classify(m.id),
    }))
    .filter((m) => m.id)
    .sort((a, b) => a.id.localeCompare(b.id));

  let regras = {};
  try {
    regras = JSON.parse(readFileSync(REGRAS_PATH, 'utf8'));
  } catch {
    /* optional */
  }
  const council = regras.modelos || {};
  const disponiveis = regras.modelos_disponiveis || [];
  const tutores = Object.fromEntries(
    Object.entries(regras.conselho_tutores || {}).map(([k, v]) => [k, v.modelo]),
  );

  let adapterIds = [];
  try {
    const ar = await fetch('http://127.0.0.1:8090/v1/models');
    if (ar.ok) {
      const aj = await ar.json();
      adapterIds = (aj.data || []).map((m) => m.id);
    }
  } catch {
    /* adapter optional */
  }

  const groups = {};
  for (const m of raw) {
    (groups[m.key] ||= {
      family: m.family,
      emoji: m.emoji,
      kind: m.kind,
      models: [],
    }).models.push(m.id);
  }

  const ts = new Date().toISOString();
  const total = raw.length;
  const byKind = {};
  for (const m of raw) byKind[m.kind] = (byKind[m.kind] || 0) + 1;

  const catalog = {
    meta: {
      gerado_em: ts,
      fonte: `${base}/models`,
      total_abacus: total,
      total_adapter: adapterIds.length || null,
      billing_nota: 'Chat pode falhar com sem créditos mesmo com catálogo 200',
      hub_nota:
        'ModelsPanel do HUB lista plana ou fallback 10 — UI 🔒 não alterada por este script',
    },
    resumo_por_familia: Object.keys(groups)
      .sort()
      .map((k) => ({
        key: k,
        familia: groups[k].family,
        emoji: groups[k].emoji,
        kind: groups[k].kind,
        qtd: groups[k].models.length,
      })),
    resumo_por_tipo: byKind,
    council,
    modelos_disponiveis_regras: disponiveis,
    tutores,
    familias: Object.keys(groups)
      .sort()
      .map((k) => ({
        key: k,
        familia: groups[k].family,
        emoji: groups[k].emoji,
        kind: groups[k].kind,
        modelos: groups[k].models,
      })),
    todos_ids: raw.map((m) => m.id),
    adapter_extras: adapterIds.filter((id) => !raw.find((m) => m.id === id)),
  };

  const lines = [];
  lines.push('# Catálogo Abacus RouteLLM — organizado');
  lines.push('');
  lines.push(
    `> Snapshot **ao vivo** · \`${ts}\` · **${total}** modelos no Abacus · base \`${base}\``,
  );
  lines.push('>');
  lines.push('> Gerado por `scripts/abacus/gerar-catalogo-organizado.mjs` (regenerável).');
  lines.push('> JSON espelho: [`abacus-catalog.json`](./abacus-catalog.json)');
  lines.push('');
  lines.push('## 🧭 Como ler');
  lines.push('');
  lines.push('| Camada | Qtd | Onde |');
  lines.push('|--------|-----|------|');
  lines.push(`| Abacus RouteLLM (cru) | **${total}** | \`GET ${base}/models\` |`);
  lines.push(
    `| Adapter OpenAI-compat | **${adapterIds.length || '—'}** | \`GET /v1/models\` (Arsenal + aliases + catálogo) |`,
  );
  lines.push(
    `| Council (regras.json) | **${Object.keys(council).length}** papéis | só o default do Router/Parallel/Debate/Hermes |`,
  );
  lines.push(
    '| HUB aba Modelos | 140 ao vivo **ou** 10 fallback | `ModelsPanel` — lista ainda **plana** (UI 🔒) |',
  );
  lines.push('');
  lines.push('## 📊 Resumo por tipo');
  lines.push('');
  lines.push('| Tipo | Qtd |');
  lines.push('|------|-----|');
  for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${k} | **${v}** |`);
  }
  lines.push(`| **TOTAL** | **${total}** |`);
  lines.push('');
  lines.push('## 📊 Resumo por família');
  lines.push('');
  lines.push('| # | Família | Tipo | Qtd |');
  lines.push('|---|---------|------|-----|');
  let n = 1;
  for (const k of Object.keys(groups).sort()) {
    const g = groups[k];
    lines.push(`| ${n++} | ${g.emoji} ${g.family} | ${g.kind} | **${g.models.length}** |`);
  }
  lines.push('');
  lines.push('## 🎯 Council ativo (`regras.json`)');
  lines.push('');
  lines.push('| Papel | Modelo | No catálogo Abacus? |');
  lines.push('|-------|--------|---------------------|');
  for (const [papel, modelo] of Object.entries(council)) {
    const ok = raw.some((m) => m.id === modelo);
    lines.push(`| \`${papel}\` | \`${modelo}\` | ${ok ? '✅' : '❌'} |`);
  }
  lines.push('');
  lines.push('## 📦 Catálogo completo por família');
  lines.push('');
  for (const k of Object.keys(groups).sort()) {
    const g = groups[k];
    lines.push(`### ${g.emoji} ${g.family} (${g.models.length})`);
    lines.push('');
    lines.push(`_tipo: \`${g.kind}\`_`);
    lines.push('');
    for (const id of g.models) {
      const isCouncil = Object.values(council).includes(id);
      const isDisp = disponiveis.includes(id);
      const tags = [];
      if (isCouncil) tags.push('council');
      if (isDisp) tags.push('regras.disponiveis');
      lines.push(`- \`${id}\`${tags.length ? ` · _${tags.join(', ')}_` : ''}`);
    }
    lines.push('');
  }
  if (catalog.adapter_extras.length) {
    lines.push('## ➕ Só no Adapter (não vêm do /models Abacus)');
    lines.push('');
    for (const id of catalog.adapter_extras) lines.push(`- \`${id}\``);
    lines.push('');
  }
  lines.push('## 🛠️ Regenerar');
  lines.push('');
  lines.push('```bash');
  lines.push('node scripts/abacus/gerar-catalogo-organizado.mjs');
  lines.push('```');
  lines.push('');
  lines.push('## ⚠️ Notas operacionais');
  lines.push('');
  lines.push(
    '1. **Catálogo 200 ≠ chat liberado** — billing Abacus pode retornar “no remaining credits”.',
  );
  lines.push(
    '2. **IDs sem prefixo vendor** — Abacus rejeita `google/`, `openai/`, `anthropic/` em vários casos; IDs aqui são os oficiais do RouteLLM.',
  );
  lines.push(
    '3. **HUB** — fallback estático de 10 modelos antigos só aparece se a API falhar; não é o catálogo real.',
  );
  lines.push(
    '4. **Passthrough** — no Adapter, qualquer `id` deste catálogo pode ir em `model` (além dos modos `arsenal-*`).',
  );
  lines.push('');

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_MD, lines.join('\n'));
  writeFileSync(OUT_JSON, JSON.stringify(catalog, null, 2));

  console.log('🟢 Catálogo gerado');
  console.log(`   MD:   ${OUT_MD}`);
  console.log(`   JSON: ${OUT_JSON}`);
  console.log(`   Abacus: ${total} | Adapter: ${adapterIds.length || 0} | Famílias: ${Object.keys(groups).length}`);
  console.log(`   Tipos: ${JSON.stringify(byKind)}`);
}

main().catch((e) => {
  console.error('🔴', e.message);
  process.exit(1);
});
