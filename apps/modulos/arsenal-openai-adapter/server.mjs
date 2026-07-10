// Arsenal OpenAI Adapter — expõe o Council como modelos OpenAI-compatible.
// Consumido pelo Open WebUI (ui.centralldark.com) + posta AO VIVO no grupo
// "Central Dark - Grupo da Evolução" pelos bots individuais.

import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { postarComoBot, postarPergunta } from './telegram-grupo.mjs';
import { authenticate, shouldBlock, audit, newRequestId, enforceMode } from './auth-audit.mjs';

// === CATÁLOGO DINÂMICO ABACUS (adicionado 2026-07-10) ===
let __abacusCache = null; let __abacusCacheAt = 0;
const __ABACUS_TTL = 5 * 60 * 1000;
async function fetchAbacusCatalog() {
  const now = Date.now();
  if (__abacusCache && (now - __abacusCacheAt) < __ABACUS_TTL) return __abacusCache;
  try {
    const key = process.env.ABACUS_API_KEY || process.env.PROVIDER_KEY || '';
    const r = await fetch('https://routellm.abacus.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    });
    if (!r.ok) throw new Error(`Abacus HTTP ${r.status}`);
    const d = await r.json();
    const items = d.data || d.models || [];
    __abacusCache = items.map(m => ({
      id: m.id || m.name,
      object: 'model',
      created: Math.floor(Date.now()/1000),
      owned_by: 'abacus-routellm',
    })).filter(m => m.id);
    __abacusCacheAt = now;
    console.log(`[Catalog] Abacus loaded ${__abacusCache.length} models`);
    return __abacusCache;
  } catch (e) {
    console.error('[Catalog] Abacus fetch failed:', e.message);
    return __abacusCache || [];
  }
}

// Defesa: alguns clientes/regras enviam "google/x" ou "openai/x" mas Abacus RouteLLM só aceita ID puro
function stripProviderPrefix(modelId) {
  if (!modelId || typeof modelId !== 'string') return modelId;
  return modelId.replace(/^(google|openai|anthropic|meta-llama|deepseek-ai|moonshotai|zai-org|Qwen|MiniMaxAI)\//, (m, p) => {
    // Preserva prefixos que a Abacus REALMENTE aceita como parte do id (ex: moonshotai/Kimi-K2)
    // Testado: prefixos "google/", "openai/", "anthropic/" devem ser removidos
    if (['google','openai','anthropic'].includes(p)) return '';
    return m;
  });
}
// === FIM CATÁLOGO DINÂMICO ===



const PORT = process.env.PORT || 8090;
const AUTH_KEY = process.env.ARSENAL_ADAPTER_KEY || 'arsenal-key-local';
const PROVIDER_BASE = process.env.PROVIDER_BASE || 'https://openrouter.ai/api/v1';
const PROVIDER_KEY = process.env.PROVIDER_KEY || '';
const REGRAS_PATH = process.env.REGRAS_PATH || '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/regras.json';
const DEBATES_DIR = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/DEBATES';
const EVOLUCAO_DIR = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/EVOLUCAO';
const PENDENCIAS_PATH = '/root/CentralDark/docs/PENDENCIAS.md';

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
  'claude-3-5-sonnet-20240620': 'arsenal-router',
  'claude-3-5-haiku-latest': 'arsenal-router',
  'claude-3-5-haiku-20241022': 'arsenal-router',
  'claude-3-opus-latest': 'arsenal-parallel',
  'claude-3-opus-20240229': 'arsenal-parallel',
  'claude-3-sonnet-20240229': 'arsenal-router',
  'claude-3-haiku-20240307': 'arsenal-router',
  'claude-sonnet-4-20250514': 'arsenal-debate',
  'claude-opus-4-20250514': 'arsenal-debate',
  'claude-3-7-sonnet-latest': 'arsenal-router',
  'gpt-4o': 'arsenal-router',
  'gpt-4o-mini': 'arsenal-router',
  'gpt-4-turbo': 'arsenal-router',
  'gpt-4': 'arsenal-router',
  'gpt-3.5-turbo': 'arsenal-router',
  'gpt-5': 'arsenal-parallel',
  'gpt-5-mini': 'arsenal-router',
  'o1': 'arsenal-debate',
  'o1-mini': 'arsenal-router',
  'gemini-2.5-pro': 'arsenal-parallel',
  'gemini-2.5-flash': 'arsenal-router',
  'gemini-1.5-pro': 'arsenal-router',
  'gemini-1.5-flash': 'arsenal-router',
};

const DISCOVERY_MODELS = [
  ...MODELS.map(m => ({ id: m.id, object: 'model', created: 0, owned_by: 'arsenal-council', name: m.name })),
  ...Object.keys(MODEL_ALIASES).map(id => {
    const owner = id.startsWith('claude') ? 'anthropic'
                : id.startsWith('gemini') ? 'google'
                : 'openai';
    return { id, object: 'model', created: 1700000000, owned_by: owner, name: id + ' -> ' + MODEL_ALIASES[id] };
  }),
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

async function callProvider(modelo, messages) {
  const r = await fetch(PROVIDER_BASE.includes('/functions/v1/') ? PROVIDER_BASE : `${PROVIDER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PROVIDER_KEY}`,
      'X-Arsenal-Key': PROVIDER_KEY,
      'HTTP-Referer': 'https://ui.centralldark.com',
      'X-Title': 'CentralDark Arsenal Council',
    },
    body: JSON.stringify({ model: stripProviderPrefix(modelo), messages, stream: false }),
  });
  if (!r.ok) throw new Error(`${modelo} HTTP ${r.status}: ${(await r.text()).slice(0,180)}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content || '(sem resposta)';
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
function chatOk(model, content) {
  return { id: 'chatcmpl-arsenal-' + Date.now(), object: 'chat.completion', created: Math.floor(Date.now()/1000), model,
    choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
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
    return json(res, 200, { ok: true, provider: PROVIDER_BASE, models: MODELS.map(m=>m.id),
                            auth_enforce: enforceMode(), request_id: requestId });
  }

  // /v1/models é público — catálogo apenas, sem inferência.
  // Clientes (Claude Desktop, Cursor) descobrem os modelos SEM chave.
  if (pathOnly === '/v1/models' || pathOnly === '/models') {
    const abacus = await fetchAbacusCatalog();
    const merged = Array.from(new Map([...DISCOVERY_MODELS, ...abacus].map(m => [m.id, m])).values());
    audit({ request_id: requestId, key_prefix: authResult.prefix, path: req.url, method: req.method,
            status: 200, latency_ms: Date.now() - t0, ip, user_agent: ua });
    return json(res, 200, { object: 'list', data: merged });
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

  if (pathOnly === '/v1/chat/completions' || pathOnly === '/chat/completions') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const payload = JSON.parse(body);
      const requestedModel = payload.model;
      const modo = MODEL_ALIASES[requestedModel] || requestedModel;
      req._auditSetModel?.(requestedModel === modo ? modo : `${requestedModel}->${modo}`);
      const messages = payload.messages || [];
      const perguntaUser = messages.filter(m=>m.role==='user').slice(-1)[0]?.content || '';
      // Posta a pergunta do usuário no grupo (contexto)
      if (perguntaUser) postarPergunta(perguntaUser, modo.replace('arsenal-',''));

      const MODOS = { 'arsenal-router': modoRouter, 'arsenal-parallel': modoParallel, 'arsenal-debate': modoDebate, 'arsenal-hermes': modoHermes };
      const rodar = MODOS[modo];
      if (!rodar) return json(res, 400, { error: `modelo desconhecido: ${requestedModel}`, mapped_to: modo });

      // stream:true → SSE real (headers já vão, keepalive segura o cliente enquanto o Council trabalha)
      const streaming = payload.stream === true;
      let keepalive;
      if (streaming) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
        res.write(sseChunk(modo, { role: 'assistant' }));
        keepalive = setInterval(() => res.write(': ping\n\n'), 15000);
      }

      const regras = await lerRegras();
      try {
        const resposta = await rodar(regras, messages);
        await salvarSaida(modo.replace('arsenal-',''), messages, resposta);
        if (streaming) {
          clearInterval(keepalive);
          res.write(sseChunk(modo, { content: resposta }));
          res.write(sseChunk(modo, {}, 'stop'));
          res.write('data: [DONE]\n\n');
          return res.end();
        }
        return json(res, 200, chatOk(modo, resposta));
      } catch (e) {
        clearInterval(keepalive);
        console.error('erro:', e);
        if (streaming) {
          res.write(sseChunk(modo, { content: `❌ Arsenal falhou: ${e.message}` }, 'stop'));
          res.write('data: [DONE]\n\n');
          return res.end();
        }
        return json(res, 500, { error: e.message });
      }
    } catch (e) {
      console.error('erro:', e);
      if (!res.headersSent) return json(res, 500, { error: e.message });
      try { res.end(); } catch {}
    }
  }
  if (pathOnly === '/v1/messages') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const payload = JSON.parse(body || '{}');
      const requestedModel = payload.model;
      const modo = MODEL_ALIASES[requestedModel] || (requestedModel && requestedModel.startsWith('arsenal-') ? requestedModel : 'arsenal-router');
      req._auditSetModel?.(requestedModel + '->' + modo);
      const msgs = [];
      if (payload.system) msgs.push({ role: 'system', content: typeof payload.system === 'string' ? payload.system : JSON.stringify(payload.system) });
      for (const m of (payload.messages || [])) {
        const content = typeof m.content === 'string'
          ? m.content
          : (Array.isArray(m.content) ? m.content.map(c => c.text || c.content || '').join('\n') : String(m.content || ''));
        msgs.push({ role: m.role, content });
      }
      const MODOS = { 'arsenal-router': modoRouter, 'arsenal-parallel': modoParallel, 'arsenal-debate': modoDebate, 'arsenal-hermes': modoHermes };
      const rodar = MODOS[modo] || modoRouter;
      const regras = await lerRegras();
      const resposta = await rodar(regras, msgs);
      const msgId = 'msg_' + Math.random().toString(36).slice(2, 14);
      return json(res, 200, {
        id: msgId,
        type: 'message',
        role: 'assistant',
        model: requestedModel,
        content: [{ type: 'text', text: resposta }],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 },
      });
    } catch (e) {
      console.error('erro /v1/messages:', e);
      return json(res, 500, { type: 'error', error: { type: 'api_error', message: e.message } });
    }
  }

  json(res, 404, { error: 'not found' });
});

const BIND = process.env.BIND || '127.0.0.1';
server.listen(PORT, BIND, () => console.log(`🔫 Arsenal Adapter ${BIND}:${PORT} → ${PROVIDER_BASE} · grupo ao vivo ativo`));
