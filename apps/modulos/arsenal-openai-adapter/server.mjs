// Arsenal OpenAI Adapter — expõe o Council como modelos OpenAI-compatible.
// Consumido pelo Open WebUI (ui.centralldark.com) + posta AO VIVO no grupo
// "Central Dark - Grupo da Evolução" pelos bots individuais.

import http from 'node:http';
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync, existsSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { postarComoBot, postarPergunta } from './telegram-grupo.mjs';
import { authenticate, shouldBlock, audit, newRequestId, enforceMode } from './auth-audit.mjs';

// Rastro por request: qual upstream respondeu (seguro p/ concorrência)
const requestTrace = new AsyncLocalStorage();
function noteTrace(entry) {
  const store = requestTrace.getStore();
  if (store?.chain) store.chain.push({ ...entry, t: Date.now() });
}
function getTraceHeader() {
  const store = requestTrace.getStore();
  if (!store?.chain?.length) return null;
  // Só ASCII no header HTTP (Node rejeita seta unicode etc.)
  return store.chain
    .map((e) => {
      const st = e.ok ? 'ok' : 'fail';
      const m = e.model ? `:${String(e.model).replace(/[^\w./+-]/g, '').slice(0, 48)}` : '';
      return `${e.provider}:${st}${m}`;
    })
    .join('->');
}

const PORT = process.env.PORT || 8090;
const AUTH_KEY = process.env.ARSENAL_ADAPTER_KEY || 'arsenal-key-local';
const PROVIDER_BASE = process.env.PROVIDER_BASE || 'https://openrouter.ai/api/v1';
const PROVIDER_KEY = process.env.PROVIDER_KEY || '';
const REGRAS_PATH = process.env.REGRAS_PATH || '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/regras.json';
const DEBATES_DIR = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/DEBATES';
const EVOLUCAO_DIR = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/EVOLUCAO';
const PENDENCIAS_PATH = '/root/CentralDark/docs/PENDENCIAS.md';

// ── Secrets (VPS only) — TokenRouter e afins. Nunca commitar valores. ──
// Env do processo tem prioridade; fallback lê secrets/.env (fora do Git).
function loadSecretsFile(path = '/root/CentralDark/secrets/.env') {
  if (!existsSync(path)) return {};
  const out = {};
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[m[1]] = v;
    }
  } catch { /* silencioso */ }
  return out;
}
const SECRETS = loadSecretsFile();
const TOKENROUTER_BASE = (process.env.TOKENROUTER_BASE_URL || SECRETS.TOKENROUTER_BASE_URL || 'https://api.tokenrouter.com/v1').replace(/\/+$/, '');
const TOKENROUTER_KEY = process.env.TOKENROUTER_API_KEY || SECRETS.TOKENROUTER_API_KEY || '';
const TOKENROUTER_DEFAULT_MODEL = process.env.TOKENROUTER_MODEL || SECRETS.TOKENROUTER_MODEL || 'deepseek/deepseek-v4-pro';

const MODELS = [
  { id: 'arsenal-router',   name: '🎯 Arsenal Router (rápido)' },
  { id: 'arsenal-parallel', name: '⚡ Arsenal Parallel (3 IAs + juiz)' },
  { id: 'arsenal-debate',   name: '🔥 Arsenal Debate (2 rodadas + veredito)' },
  { id: 'arsenal-hermes',   name: '🤖 Hermes (proposta autônoma)' },
];

// Aliases para clientes que filtram modelos por famílias conhecidas.
// Mantém Arsenal como runtime real, mas deixa Claude Desktop/Cursor enxergarem modelos utilizáveis.
const MODEL_ALIASES = {
  'claude-3-5-sonnet-latest': 'arsenal-router',
  'claude-3-5-sonnet-20241022': 'arsenal-router',
  'claude-3-opus-latest': 'arsenal-parallel',
  'claude-3-opus-20240229': 'arsenal-parallel',
  'gpt-4o': 'arsenal-router',
  'gpt-4o-mini': 'arsenal-router',
};

const DISCOVERY_MODELS = [
  ...MODELS.map(m => ({ id: m.id, object: 'model', created: 0, owned_by: 'arsenal-council', name: m.name })),
  { id: 'claude-3-5-sonnet-latest', object: 'model', created: 1700000000, owned_by: 'anthropic', name: 'Claude 3.5 Sonnet → Arsenal Router' },
  { id: 'claude-3-5-sonnet-20241022', object: 'model', created: 1700000000, owned_by: 'anthropic', name: 'Claude 3.5 Sonnet 20241022 → Arsenal Router' },
  { id: 'claude-3-opus-latest', object: 'model', created: 1700000000, owned_by: 'anthropic', name: 'Claude 3 Opus → Arsenal Parallel' },
  { id: 'claude-3-opus-20240229', object: 'model', created: 1700000000, owned_by: 'anthropic', name: 'Claude 3 Opus 20240229 → Arsenal Parallel' },
  { id: 'gpt-4o', object: 'model', created: 1700000000, owned_by: 'openai', name: 'GPT-4o → Arsenal Router' },
  { id: 'gpt-4o-mini', object: 'model', created: 1700000000, owned_by: 'openai', name: 'GPT-4o Mini → Arsenal Router' },
];

// Mapeia modelo lógico -> bot Telegram (Gemini/Groq/Claude)
function botDoModelo(modelo) {
  const m = (modelo || '').toLowerCase();
  if (m.includes('gemini') && m.includes('flash')) return 'groq'; // voz rápida = Llama
  if (m.includes('gemini')) return 'gemini';
  if (m.includes('gpt') || m.includes('openai')) return 'claude'; // GPT vira Claude no grupo
  if (m.includes('claude')) return 'claude';
  return 'claude';
}

async function lerRegras() {
  try { return JSON.parse(await readFile(REGRAS_PATH, 'utf8')); }
  catch { return { modelos: { router:'gemini-3-flash-preview', voz1_pro:'gemini-3.1-pro-preview', voz2_gpt:'gpt-5', voz3_flash:'gemini-3-flash-preview', juiz:'gemini-3.1-pro-preview' } }; }
}

// Catálogo dinâmico do Abacus RouteLLM (os modelos "crus" por trás do Council).
// Cache de 5min pra não bater no upstream a cada /v1/models.
let abacusCatalogCache = { at: 0, models: [] };
const ABACUS_CATALOG_TTL_MS = 5 * 60 * 1000;

async function fetchAbacusCatalog() {
  if (Date.now() - abacusCatalogCache.at < ABACUS_CATALOG_TTL_MS && abacusCatalogCache.models.length) {
    return abacusCatalogCache.models;
  }
  try {
    const base = PROVIDER_BASE.includes('/functions/v1/') ? PROVIDER_BASE.replace(/\/chat\/completions$/, '') : PROVIDER_BASE;
    const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${PROVIDER_KEY}` } });
    if (!r.ok) return abacusCatalogCache.models;
    const data = await r.json();
    const models = Array.isArray(data?.data) ? data.data.map(m => m.id).filter(Boolean) : [];
    if (models.length) {
      abacusCatalogCache = { at: Date.now(), models };
      console.log(`[Catalog] Abacus loaded ${models.length} models`);
    }
    return abacusCatalogCache.models;
  } catch (e) {
    console.error('[Catalog] falhou:', e.message);
    return abacusCatalogCache.models;
  }
}

/** Chamada pura Abacus (sem fallback). Usada pela rota isolada e como 1º hop do fallback. */
async function callAbacus(modelo, messages) {
  const r = await fetch(PROVIDER_BASE.includes('/functions/v1/') ? PROVIDER_BASE : `${PROVIDER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PROVIDER_KEY}`,
      'X-Arsenal-Key': PROVIDER_KEY,
      'HTTP-Referer': 'https://ui.centralldark.com',
      'X-Title': 'CentralDark Arsenal Council',
    },
    body: JSON.stringify({ model: modelo, messages, stream: false }),
  });
  if (!r.ok) throw new Error(`${modelo} HTTP ${r.status}: ${(await r.text()).slice(0,180)}`);
  const data = await r.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error(`${modelo}: resposta vazia do abacus`);
  return text;
}

// Fallback central do gateway /v1 e Council:
//   abacus → tokenrouter (sempre que TR configurado)
// Rotas isoladas /providers/{nome}/v1/* NÃO usam isso — ficam puras p/ diagnóstico.
const FALLBACK_ENABLED = String(process.env.FALLBACK_ENABLED ?? 'true').toLowerCase() !== 'false';

/**
 * callProvider = caminho com fallback do sistema central.
 * Mantém o nome antigo pra não quebrar Council (router/parallel/debate/hermes).
 */
async function callProvider(modelo, messages) {
  const errors = [];

  // 1) Abacus
  try {
    const text = await callAbacus(modelo, messages);
    noteTrace({ provider: 'abacus', ok: true, model: modelo });
    return text;
  } catch (e) {
    errors.push(`abacus:${e.message}`);
    noteTrace({ provider: 'abacus', ok: false, model: modelo, err: String(e.message).slice(0, 120) });
    console.warn(`[fallback] abacus falhou (${modelo}): ${e.message}`);
  }

  // 2) TokenRouter (se habilitado + key) — tenta modelo pedido, depois default TR
  if (FALLBACK_ENABLED && TOKENROUTER_KEY) {
    const trCandidates = [...new Set(
      [modelo, TOKENROUTER_DEFAULT_MODEL].filter(Boolean),
    )];
    for (const trModel of trCandidates) {
      try {
        const text = await callTokenRouter(trModel, messages, { max_tokens: 1024 });
        noteTrace({ provider: 'tokenrouter', ok: true, model: trModel, via: 'fallback' });
        console.log(`[fallback] ok abacus→tokenrouter model=${trModel} (pedido era ${modelo})`);
        return text;
      } catch (e) {
        errors.push(`tokenrouter(${trModel}):${e.message}`);
        noteTrace({ provider: 'tokenrouter', ok: false, model: trModel, err: String(e.message).slice(0, 120) });
        console.warn(`[fallback] tokenrouter falhou (${trModel}): ${e.message}`);
      }
    }
  } else if (!TOKENROUTER_KEY) {
    errors.push('tokenrouter:não configurado');
  }

  throw new Error(`fallback esgotado no gateway central: ${errors.join(' | ')}`);
}

// ═══════════════════════════════════════════════════════════════
// PROVEDORES ORGANIZADOS (cada um na sua rota — sem misturar)
//   /providers                      → mapa
//   /providers/abacus/v1/*          → Abacus RouteLLM
//   /providers/tokenrouter/v1/*     → TokenRouter
//   /v1/*                           → Arsenal Council + Abacus (legado/default)
// ═══════════════════════════════════════════════════════════════

let tokenRouterCatalogCache = { at: 0, models: [] };
const TR_CATALOG_TTL_MS = 5 * 60 * 1000;

async function fetchTokenRouterCatalog() {
  if (!TOKENROUTER_KEY) return [];
  if (Date.now() - tokenRouterCatalogCache.at < TR_CATALOG_TTL_MS && tokenRouterCatalogCache.models.length) {
    return tokenRouterCatalogCache.models;
  }
  try {
    const r = await fetch(`${TOKENROUTER_BASE}/models`, {
      headers: { Authorization: `Bearer ${TOKENROUTER_KEY}`, Accept: 'application/json' },
    });
    if (!r.ok) return tokenRouterCatalogCache.models;
    const data = await r.json();
    const models = Array.isArray(data?.data)
      ? data.data.map((m) => (typeof m === 'string' ? m : m?.id)).filter(Boolean)
      : [];
    if (models.length) {
      tokenRouterCatalogCache = { at: Date.now(), models };
      console.log(`[Catalog] TokenRouter loaded ${models.length} models`);
    }
    return tokenRouterCatalogCache.models;
  } catch (e) {
    console.error('[Catalog] TokenRouter falhou:', e.message);
    return tokenRouterCatalogCache.models;
  }
}

/** Extrai texto útil — modelos reasoning do TR podem vir com content vazio. */
function extractMessageText(msg) {
  if (!msg || typeof msg !== 'object') return '';
  const c = msg.content;
  if (typeof c === 'string' && c.trim()) return c;
  if (Array.isArray(c)) {
    const joined = c.map((p) => (typeof p === 'string' ? p : p?.text || '')).join('');
    if (joined.trim()) return joined;
  }
  if (typeof msg.reasoning_content === 'string' && msg.reasoning_content.trim()) {
    return msg.reasoning_content;
  }
  return '';
}

async function callTokenRouter(modelo, messages, opts = {}) {
  if (!TOKENROUTER_KEY) throw new Error('TOKENROUTER_API_KEY não configurada (secrets/.env)');
  const model = modelo || TOKENROUTER_DEFAULT_MODEL;
  const max_tokens = opts.max_tokens ?? 1024;
  const r = await fetch(`${TOKENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKENROUTER_KEY}`,
      'User-Agent': 'CentralDark-ArsenalAdapter',
    },
    body: JSON.stringify({ model, messages, stream: false, max_tokens, temperature: opts.temperature ?? 0.2 }),
  });
  if (!r.ok) throw new Error(`tokenrouter ${model} HTTP ${r.status}: ${(await r.text()).slice(0, 180)}`);
  const data = await r.json();
  const text = extractMessageText(data.choices?.[0]?.message);
  if (!text) throw new Error(`tokenrouter ${model}: resposta vazia (finish=${data.choices?.[0]?.finish_reason || '?'})`);
  return text;
}

function providersMap() {
  return {
    object: 'providers',
    note: 'Rotas isoladas = puras. /v1/* = sistema central com FALLBACK abacus→tokenrouter.',
    fallback: {
      enabled: FALLBACK_ENABLED,
      chain: ['abacus', 'tokenrouter'],
      applies_to: ['/v1/chat/completions', 'arsenal-router', 'arsenal-parallel', 'arsenal-debate', 'arsenal-hermes'],
      pure_routes: ['/providers/abacus/v1/*', '/providers/tokenrouter/v1/*'],
      tokenrouter_default_model: TOKENROUTER_DEFAULT_MODEL,
    },
    providers: [
      {
        id: 'arsenal',
        name: 'Arsenal Council (default gateway + fallback)',
        base: '/v1',
        routes: { models: '/v1/models', chat: '/v1/chat/completions' },
        upstream: PROVIDER_BASE,
        fallback: FALLBACK_ENABLED ? 'abacus→tokenrouter' : 'off',
        configured: Boolean(PROVIDER_KEY),
      },
      {
        id: 'abacus',
        name: 'Abacus RouteLLM (puro)',
        base: '/providers/abacus/v1',
        routes: {
          models: '/providers/abacus/v1/models',
          chat: '/providers/abacus/v1/chat/completions',
        },
        upstream: PROVIDER_BASE,
        fallback: 'none (rota pura)',
        configured: Boolean(PROVIDER_KEY),
      },
      {
        id: 'tokenrouter',
        name: 'TokenRouter (puro)',
        base: '/providers/tokenrouter/v1',
        routes: {
          models: '/providers/tokenrouter/v1/models',
          chat: '/providers/tokenrouter/v1/chat/completions',
        },
        aliases: {
          models: '/tokenrouter/v1/models',
          chat: '/tokenrouter/v1/chat/completions',
        },
        upstream: TOKENROUTER_BASE,
        default_model: TOKENROUTER_DEFAULT_MODEL,
        fallback: 'none (rota pura)',
        configured: Boolean(TOKENROUTER_KEY),
      },
    ],
  };
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

async function respondProviderChat(res, req, providerId, payload) {
  const requestedModel = payload.model;
  const messages = payload.messages || [];
  const streaming = payload.stream === true;
  req._auditSetModel?.(`${providerId}:${requestedModel || 'default'}`);

  let text;
  let modelOut = requestedModel;

  if (providerId === 'abacus') {
    // Rota PURA — sem fallback (diagnóstico / manutenção explícita do Abacus)
    if (!requestedModel) return json(res, 400, { error: 'model obrigatório na rota abacus' });
    const catalogo = await fetchAbacusCatalog();
    if (catalogo.length && !catalogo.includes(requestedModel)) {
      return json(res, 400, { error: `modelo desconhecido no abacus: ${requestedModel}` });
    }
    text = await callAbacus(requestedModel, messages);
    noteTrace({ provider: 'abacus', ok: true, model: requestedModel, pure: true });
    modelOut = requestedModel;
  } else if (providerId === 'tokenrouter') {
    // Rota PURA — sem fallback (diagnóstico / manutenção explícita do TokenRouter)
    if (!TOKENROUTER_KEY) {
      return json(res, 503, { error: 'tokenrouter não configurado (TOKENROUTER_API_KEY ausente)' });
    }
    modelOut = requestedModel || TOKENROUTER_DEFAULT_MODEL;
    const catalogo = await fetchTokenRouterCatalog();
    // Se o catálogo estiver vazio (falha transitória), ainda tenta o default / pedido.
    if (catalogo.length && requestedModel && !catalogo.includes(requestedModel)) {
      return json(res, 400, {
        error: `modelo desconhecido no tokenrouter: ${requestedModel}`,
        available: catalogo.slice(0, 30),
      });
    }
    text = await callTokenRouter(modelOut, messages, {
      max_tokens: payload.max_tokens ?? 1024,
      temperature: payload.temperature,
    });
    noteTrace({ provider: 'tokenrouter', ok: true, model: modelOut, pure: true });
  } else {
    return json(res, 404, { error: `provedor desconhecido: ${providerId}` });
  }

  const trace = getTraceHeader();
  if (trace) res.setHeader('X-CentralDark-Upstream', trace);
  res.setHeader('X-CentralDark-Route', `providers/${providerId}`);

  if (streaming) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    res.write(sseChunk(modelOut, { role: 'assistant' }));
    res.write(sseChunk(modelOut, { content: text }));
    res.write(sseChunk(modelOut, {}, 'stop'));
    res.write('data: [DONE]\n\n');
    return res.end();
  }
  return json(res, 200, chatOk(modelOut, text, { route: `providers/${providerId}`, pure: true }));
}

async function modoRouter(regras, messages) {
  const out = await callProvider(regras.modelos.router, messages);
  // Router é single-shot: posta 1 vez no grupo pelo bot correspondente
  postarComoBot(botDoModelo(regras.modelos.router), out, { nome: `Router · ${regras.modelos.router}` });
  return `🎯 **Router (${regras.modelos.router})**\n\n${out}`;
}

async function modoParallel(regras, messages) {
  const modelos = [regras.modelos.voz1_pro, regras.modelos.voz2_gpt, regras.modelos.voz3_flash];
  const respostas = await Promise.all(modelos.map(async m => {
    try {
      const texto = await callProvider(m, messages);
      // Cada voz posta AO VIVO no grupo pelo seu bot
      postarComoBot(botDoModelo(m), texto, { nome: m });
      return { modelo: m, texto };
    } catch (e) { return { modelo: m, texto: `❌ falhou: ${e.message}` }; }
  }));
  const bloco = respostas.map(r => `### ${r.modelo}\n${r.texto}`).join('\n\n---\n\n');
  const sintese = await callProvider(regras.modelos.juiz, [
    { role: 'system', content: 'Você é o Juiz do Conselho. Recebeu 3 respostas de 3 IAs pra mesma pergunta. Sintetize a MELHOR resposta única. Direto, PT-BR.' },
    { role: 'user', content: `Pergunta: ${messages.map(m=>m.content).join('\n')}\n\nRespostas:\n\n${bloco}` },
  ]);
  postarComoBot('juiz', sintese, { nome: `Juiz · ${regras.modelos.juiz}` });
  return `⚡ **Arsenal Parallel · 3 vozes + Juiz**\n\n${bloco}\n\n---\n\n## 🧑‍⚖️ Veredito (${regras.modelos.juiz})\n\n${sintese}`;
}

async function modoDebate(regras, messages) {
  const [A, B] = [regras.modelos.voz1_pro, regras.modelos.voz2_gpt];
  const [rA1, rB1] = await Promise.all([callProvider(A, messages), callProvider(B, messages)]);
  postarComoBot(botDoModelo(A), rA1, { nome: `${A} · R1` });
  postarComoBot(botDoModelo(B), rB1, { nome: `${B} · R1` });

  const [rA2, rB2] = await Promise.all([
    callProvider(A, [...messages, { role: 'assistant', content: rA1 }, { role: 'user', content: `A outra IA (${B}) respondeu:\n\n${rB1}\n\nCritique e refine.` }]),
    callProvider(B, [...messages, { role: 'assistant', content: rB1 }, { role: 'user', content: `A outra IA (${A}) respondeu:\n\n${rA1}\n\nCritique e refine.` }]),
  ]);
  postarComoBot(botDoModelo(A), rA2, { nome: `${A} · R2 (refina)` });
  postarComoBot(botDoModelo(B), rB2, { nome: `${B} · R2 (refina)` });

  const veredito = await callProvider(regras.modelos.juiz, [
    { role: 'system', content: 'Você é o Juiz. Duas IAs debateram em 2 rodadas. Decida a MELHOR resposta final. PT-BR, direto.' },
    { role: 'user', content: `Pergunta: ${messages.map(m=>m.content).join('\n')}\n\n=== R1 ===\n**${A}:** ${rA1}\n\n**${B}:** ${rB1}\n\n=== R2 ===\n**${A}:** ${rA2}\n\n**${B}:** ${rB2}` },
  ]);
  postarComoBot('juiz', veredito, { nome: `Juiz · ${regras.modelos.juiz}` });
  return `🔥 **Arsenal Debate · 2 rodadas**\n\n### R1 · ${A}\n${rA1}\n\n### R1 · ${B}\n${rB1}\n\n### R2 · ${A}\n${rA2}\n\n### R2 · ${B}\n${rB2}\n\n---\n\n## 🧑‍⚖️ Veredito (${regras.modelos.juiz})\n\n${veredito}`;
}

async function modoHermes(regras, messages) {
  let pendencias = '';
  try {
    const raw = await readFile(PENDENCIAS_PATH, 'utf8');
    pendencias = raw.split('\n').filter(l => /^##\s+(🟡|🔴)/.test(l)).slice(0, 10).join('\n') || '(sem pendências abertas)';
  } catch { pendencias = '(PENDENCIAS.md indisponível)'; }

  const sistema = `Você é o HERMES — IA autônoma do Arsenal Council da CentralDark.
Missão: analisar pendências reais e propor evoluções concretas em PT-BR.
Contexto: React+Vite+Supabase(Lovable Cloud) + VPS PM2 + bots Telegram (@srver1bot HUB, @SEGREDOPUXADASBOT TelePainel).
Regras: não mexer em Caddy sem OK, whatsapp-server fica stopped, roles em tabela separada com has_role().
Tom: direto, gamificado (▓░ ✅⚠️❌), 3-5 passos práticos. Sinalize risco em deploy/migration.

Pendências abertas agora:
${pendencias}`;

  const pergunta = messages.filter(m => m.role === 'user').map(m => m.content).join('\n').trim()
    || 'Escolha a pendência mais urgente da lista acima e proponha o próximo passo.';

  const propostaA = await callProvider(regras.modelos.voz1_pro, [
    { role: 'system', content: sistema }, { role: 'user', content: pergunta },
  ]);
  postarComoBot(botDoModelo(regras.modelos.voz1_pro), propostaA, { nome: `Hermes-A · ${regras.modelos.voz1_pro}` });

  const propostaB = await callProvider(regras.modelos.voz2_gpt, [
    { role: 'system', content: sistema }, { role: 'user', content: pergunta },
  ]);
  postarComoBot(botDoModelo(regras.modelos.voz2_gpt), propostaB, { nome: `Hermes-B · ${regras.modelos.voz2_gpt}` });

  const veredito = await callProvider(regras.modelos.juiz, [
    { role: 'system', content: 'Você é o Juiz do Hermes. Recebeu 2 propostas autônomas. Consolide em UMA proposta final: 3-5 passos, PT-BR, direto, com riscos sinalizados.' },
    { role: 'user', content: `Pergunta: ${pergunta}\n\n=== Proposta A (${regras.modelos.voz1_pro}) ===\n${propostaA}\n\n=== Proposta B (${regras.modelos.voz2_gpt}) ===\n${propostaB}` },
  ]);
  postarComoBot('hermes', veredito, { nome: `🤖 HERMES · veredito` });

  return `🤖 **HERMES · proposta autônoma**\n\n**Quando:** ${new Date().toLocaleString('pt-BR')}\n**Pergunta:** ${pergunta}\n\n---\n\n### 🅰️ ${regras.modelos.voz1_pro}\n${propostaA}\n\n### 🅱️ ${regras.modelos.voz2_gpt}\n${propostaB}\n\n---\n\n## ⚖️ Veredito Hermes (${regras.modelos.juiz})\n\n${veredito}`;
}

async function salvarSaida(modo, messages, resposta) {
  try {
    const isHermes = modo === 'hermes';
    const baseDir = isHermes
      ? join(EVOLUCAO_DIR, new Date().toISOString().slice(0, 10))
      : DEBATES_DIR;
    await mkdir(baseDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const pergunta = messages.filter(m => m.role === 'user').slice(-1)[0]?.content?.slice(0, 60) || 'sem';
    const slug = pergunta.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    const prefix = isHermes ? 'hermes-webui' : `${modo}-webui`;
    await writeFile(join(baseDir, `${ts}-${prefix}-${slug}.md`),
      `# ${modo} · WebUI\n\n**Quando:** ${new Date().toLocaleString('pt-BR')}\n**Origem:** ui.centralldark.com\n\n## Pergunta\n${pergunta}\n\n## Resposta\n\n${resposta}\n`);
  } catch (e) { console.error('salvar:', e.message); }
}

function json(res, code, body) { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); }
function chatOk(model, content, meta = {}) {
  const upstream = getTraceHeader();
  return {
    id: 'chatcmpl-arsenal-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    // Campo extra (clientes OpenAI costumam ignorar) — prova de fallback/rota
    centraldark: {
      gateway: 'https://api.centralldark.com',
      fallback_enabled: FALLBACK_ENABLED,
      upstream: upstream || null,
      ...meta,
    },
  };
}
// SSE de verdade pro Open WebUI: chunk no formato chat.completion.chunk
function sseChunk(model, delta, finish = null) {
  return `data: ${JSON.stringify({ id: 'chatcmpl-arsenal-' + Date.now(), object: 'chat.completion.chunk',
    created: Math.floor(Date.now()/1000), model, choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, api-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.end();

  // === PR#2 shadow-audit wrapper ===
  const t0 = Date.now();
  const requestId = newRequestId();
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();
  const ua = (req.headers['user-agent'] || '').toString();
  res.setHeader('X-Request-Id', requestId);
  // Normaliza path: remove querystring e trailing slash (/v1/models/ = /v1/models)
  const rawUrl = req.url || '/';
  const pathOnly = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';

  // Autentica sempre (não bloqueia em shadow). Preserva fallback do AUTH_KEY legado.
  // Aceita Authorization: Bearer <k>, x-api-key: <k> e api-key: <k> (Claude Desktop usa x-api-key).
  const authRaw = (req.headers.authorization || '').toString();
  const xKeyRaw = (req.headers['x-api-key'] || req.headers['api-key'] || '').toString();
  const legacyOk = AUTH_KEY && (authRaw.includes(AUTH_KEY) || xKeyRaw.includes(AUTH_KEY));
  const authResult = await authenticate(req);
  let modelForAudit = null;

  // /health continua público
  if (pathOnly === '/health') {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: '/health', method: req.method,
            status: 200, latency_ms: Date.now() - t0, ip, user_agent: ua });
    return json(res, 200, {
      ok: true,
      provider: PROVIDER_BASE,
      models: MODELS.map(m => m.id),
      auth_enforce: enforceMode(),
      request_id: requestId,
      // mapa enxuto (sem secrets) — rotas por provedor
      providers: {
        arsenal: { base: '/v1', ok: true },
        abacus: { base: '/providers/abacus/v1', configured: Boolean(PROVIDER_KEY) },
        tokenrouter: { base: '/providers/tokenrouter/v1', configured: Boolean(TOKENROUTER_KEY) },
      },
    });
  }

  // Mapa de provedores (público, só paths + status configured)
  if (pathOnly === '/providers' || pathOnly === '/v1/providers') {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: pathOnly, method: req.method,
            status: 200, latency_ms: Date.now() - t0, ip, user_agent: ua });
    return json(res, 200, { ...providersMap(), request_id: requestId });
  }

  // Catálogo SÓ Abacus (rota isolada)
  if (pathOnly === '/providers/abacus/v1/models' || pathOnly === '/abacus/v1/models') {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: pathOnly, method: req.method,
            status: 200, latency_ms: Date.now() - t0, ip, user_agent: ua });
    const abacusIds = await fetchAbacusCatalog();
    const data = abacusIds.map((id) => ({ id, object: 'model', created: 0, owned_by: 'abacus', name: id }));
    return json(res, 200, { object: 'list', provider: 'abacus', data });
  }

  // Catálogo SÓ TokenRouter (rota isolada)
  if (pathOnly === '/providers/tokenrouter/v1/models' || pathOnly === '/tokenrouter/v1/models') {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: pathOnly, method: req.method,
            status: 200, latency_ms: Date.now() - t0, ip, user_agent: ua });
    if (!TOKENROUTER_KEY) {
      return json(res, 503, { error: 'tokenrouter não configurado', provider: 'tokenrouter', data: [] });
    }
    const ids = await fetchTokenRouterCatalog();
    const data = ids.map((id) => ({ id, object: 'model', created: 0, owned_by: 'tokenrouter', name: id }));
    return json(res, 200, {
      object: 'list',
      provider: 'tokenrouter',
      default_model: TOKENROUTER_DEFAULT_MODEL,
      data,
    });
  }

  // /v1/models também é público — é apenas o catálogo (sem inferência).
  // Clientes de gateway (Claude Desktop, Cursor, etc) chamam sem chave pra descobrir modelos.
  // Fica ANTES do bloco de auth pra não retornar 401 e ser mal-interpretado como 404.
  // DEFAULT = Arsenal curados + Abacus (NÃO mistura TokenRouter aqui — use /providers/tokenrouter/v1/models).
  if (pathOnly === '/v1/models' || pathOnly === '/models') {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: req.url, method: req.method,
            status: 200, latency_ms: Date.now() - t0, ip, user_agent: ua });
    const curados = DISCOVERY_MODELS.map(m => {
      const alias_of = MODEL_ALIASES[m.id] || null;
      return alias_of ? { ...m, alias_of } : m;
    });
    const curadosIds = new Set(curados.map(m => m.id));
    const abacusIds = await fetchAbacusCatalog();
    const crus = abacusIds
      .filter(id => !curadosIds.has(id))
      .map(id => ({ id, object: 'model', created: 0, owned_by: 'abacus', name: id }));
    return json(res, 200, { object: 'list', data: [...curados, ...crus] });
  }

  // Enforce mode: bloqueia se a chave não bater E o fallback legado também não bater
  const block = shouldBlock(authResult);
  if (block && !legacyOk) {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: req.url, method: req.method,
            status: block.status, error_code: block.error, latency_ms: Date.now() - t0, ip, user_agent: ua });
    return json(res, block.status, { error: block.error, request_id: requestId });
  }
  // Shadow mode: se a chave não bate E o legado não bate, mantém comportamento antigo (401).
  if (!legacyOk && authResult.decision !== 'ok') {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: req.url, method: req.method,
            status: 401, error_code: `shadow_${authResult.decision}`, latency_ms: Date.now() - t0, ip, user_agent: ua });
    return json(res, 401, { error: 'unauthorized', request_id: requestId });
  }

  // Hook para o handler existente registrar o modelo alvo
  res.on('finish', () => {
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: req.url, method: req.method,
            status: res.statusCode, model: modelForAudit, latency_ms: Date.now() - t0,
            ip, user_agent: ua });
  });
  req._auditSetModel = (m) => { modelForAudit = m; };


  // Chat SÓ Abacus (rota isolada — NÃO usa fallback cruzado)
  if (
    pathOnly === '/providers/abacus/v1/chat/completions' ||
    pathOnly === '/abacus/v1/chat/completions'
  ) {
    return requestTrace.run({ chain: [] }, async () => {
      try {
        const payload = await readJsonBody(req);
        return await respondProviderChat(res, req, 'abacus', payload);
      } catch (e) {
        console.error('abacus chat erro:', e);
        if (!res.headersSent) return json(res, 502, { error: e.message, provider: 'abacus' });
        try { res.end(); } catch {}
      }
    });
  }

  // Chat SÓ TokenRouter (rota isolada — NÃO usa fallback cruzado)
  if (
    pathOnly === '/providers/tokenrouter/v1/chat/completions' ||
    pathOnly === '/tokenrouter/v1/chat/completions'
  ) {
    return requestTrace.run({ chain: [] }, async () => {
      try {
        const payload = await readJsonBody(req);
        return await respondProviderChat(res, req, 'tokenrouter', payload);
      } catch (e) {
        console.error('tokenrouter chat erro:', e);
        if (!res.headersSent) return json(res, 502, { error: e.message, provider: 'tokenrouter' });
        try { res.end(); } catch {}
      }
    });
  }

  // Sistema central: Arsenal + passthrough com FALLBACK abacus→tokenrouter
  if (pathOnly === '/v1/chat/completions' || pathOnly === '/chat/completions') {
    return requestTrace.run({ chain: [] }, async () => {
      let body = '';
      for await (const chunk of req) body += chunk;
      try {
        const payload = JSON.parse(body);
        const requestedModel = payload.model;
        const modo = MODEL_ALIASES[requestedModel] || requestedModel;
        req._auditSetModel?.(requestedModel === modo ? modo : `${requestedModel}->${modo}`);
        const messages = payload.messages || [];
        const perguntaUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
        if (perguntaUser) postarPergunta(perguntaUser, modo.replace('arsenal-', ''));

        const MODOS = {
          'arsenal-router': modoRouter,
          'arsenal-parallel': modoParallel,
          'arsenal-debate': modoDebate,
          'arsenal-hermes': modoHermes,
        };
        const rodar = MODOS[modo];

        // Passthrough: não é modo Arsenal → tenta Abacus, se falhar cai no TokenRouter (callProvider).
        // Se o modelo nem está no Abacus mas está no TR (ou fallback on), ainda tenta a cadeia.
        if (!rodar) {
          const catalogo = await fetchAbacusCatalog();
          const trCat = TOKENROUTER_KEY ? await fetchTokenRouterCatalog() : [];
          const inAbacus = catalogo.includes(requestedModel);
          const inTr = trCat.includes(requestedModel);
          if (!inAbacus && !inTr && !(FALLBACK_ENABLED && TOKENROUTER_KEY)) {
            return json(res, 400, {
              error: `modelo desconhecido: ${requestedModel}`,
              hint: 'Use /providers/abacus/v1 ou /providers/tokenrouter/v1, ou GET /providers',
            });
          }
          req._auditSetModel?.(`central-passthrough:${requestedModel}`);
          const streamingPt = payload.stream === true;
          try {
            // Se só existe no TR, pula Abacus (evita erro inútil)
            let respostaPt;
            if (!inAbacus && inTr) {
              respostaPt = await callTokenRouter(requestedModel, messages, { max_tokens: payload.max_tokens ?? 1024 });
              noteTrace({ provider: 'tokenrouter', ok: true, model: requestedModel, via: 'direct-tr' });
            } else {
              respostaPt = await callProvider(requestedModel, messages);
            }
            const trace = getTraceHeader();
            if (trace) res.setHeader('X-CentralDark-Upstream', trace);
            res.setHeader('X-CentralDark-Route', 'v1');
            if (streamingPt) {
              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              });
              res.write(sseChunk(requestedModel, { role: 'assistant' }));
              res.write(sseChunk(requestedModel, { content: respostaPt }));
              res.write(sseChunk(requestedModel, {}, 'stop'));
              res.write('data: [DONE]\n\n');
              return res.end();
            }
            return json(res, 200, chatOk(requestedModel, respostaPt, { route: 'v1', fallback: FALLBACK_ENABLED }));
          } catch (e) {
            console.error('passthrough/fallback erro:', e);
            return json(res, 502, {
              error: e.message,
              centraldark: { route: 'v1', fallback: FALLBACK_ENABLED, upstream: getTraceHeader() },
            });
          }
        }

        const streaming = payload.stream === true;
        let keepalive;
        if (streaming) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });
          res.write(sseChunk(modo, { role: 'assistant' }));
          keepalive = setInterval(() => res.write(': ping\n\n'), 15000);
        }

        const regras = await lerRegras();
        try {
          const resposta = await rodar(regras, messages);
          await salvarSaida(modo.replace('arsenal-', ''), messages, resposta);
          const trace = getTraceHeader();
          if (trace && !streaming) res.setHeader('X-CentralDark-Upstream', trace);
          if (!streaming) res.setHeader('X-CentralDark-Route', 'v1-arsenal');
          if (streaming) {
            clearInterval(keepalive);
            res.write(sseChunk(modo, { content: resposta }));
            res.write(sseChunk(modo, {}, 'stop'));
            res.write('data: [DONE]\n\n');
            return res.end();
          }
          return json(res, 200, chatOk(modo, resposta, { route: 'v1-arsenal', fallback: FALLBACK_ENABLED }));
        } catch (e) {
          clearInterval(keepalive);
          console.error('erro:', e);
          if (streaming) {
            res.write(sseChunk(modo, { content: `❌ Arsenal falhou: ${e.message}` }, 'stop'));
            res.write('data: [DONE]\n\n');
            return res.end();
          }
          return json(res, 500, {
            error: e.message,
            centraldark: { route: 'v1-arsenal', upstream: getTraceHeader() },
          });
        }
      } catch (e) {
        console.error('erro:', e);
        if (!res.headersSent) return json(res, 500, { error: e.message });
        try { res.end(); } catch {}
      }
    });
  }
  json(res, 404, { error: 'not found' });
});

const BIND = process.env.BIND || '127.0.0.1';
server.listen(PORT, BIND, () => {
  console.log(`🔫 Arsenal Adapter ${BIND}:${PORT} → default ${PROVIDER_BASE}`);
  console.log(`   rotas: /v1/* (arsenal+abacus) | /providers/abacus/v1/* | /providers/tokenrouter/v1/*`);
  console.log(`   tokenrouter: ${TOKENROUTER_KEY ? 'configured' : 'OFF'} @ ${TOKENROUTER_BASE}`);
});