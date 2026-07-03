// Arsenal OpenAI Adapter — expõe o Council como modelos OpenAI-compatible.
// Consumido pelo Open WebUI (ui.centralldark.com) + posta AO VIVO no grupo
// "Central Dark - Grupo da Evolução" pelos bots individuais.

import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { postarComoBot, postarPergunta } from './telegram-grupo.mjs';

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
    body: JSON.stringify({ model: modelo, messages, stream: false }),
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

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.end();

  const auth = req.headers.authorization || '';
  if (!auth.includes(AUTH_KEY) && req.url !== '/health') return json(res, 401, { error: 'unauthorized' });
  if (req.url === '/health') return json(res, 200, { ok: true, provider: PROVIDER_BASE, models: MODELS.map(m=>m.id) });
  if (req.url === '/v1/models' || req.url === '/models')
    return json(res, 200, { object: 'list', data: MODELS.map(m => ({ id: m.id, object: 'model', created: 0, owned_by: 'arsenal-council', name: m.name })) });

  if (req.url === '/v1/chat/completions' || req.url === '/chat/completions') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const payload = JSON.parse(body);
      const modo = payload.model;
      const messages = payload.messages || [];
      const perguntaUser = messages.filter(m=>m.role==='user').slice(-1)[0]?.content || '';
      // Posta a pergunta do usuário no grupo (contexto)
      if (perguntaUser) postarPergunta(perguntaUser, modo.replace('arsenal-',''));

      const regras = await lerRegras();
      let resposta;
      if (modo === 'arsenal-router') resposta = await modoRouter(regras, messages);
      else if (modo === 'arsenal-parallel') resposta = await modoParallel(regras, messages);
      else if (modo === 'arsenal-debate') resposta = await modoDebate(regras, messages);
      else if (modo === 'arsenal-hermes') resposta = await modoHermes(regras, messages);
      else return json(res, 400, { error: `modelo desconhecido: ${modo}` });
      await salvarSaida(modo.replace('arsenal-',''), messages, resposta);
      return json(res, 200, chatOk(modo, resposta));
    } catch (e) {
      console.error('erro:', e);
      return json(res, 500, { error: e.message });
    }
  }
  json(res, 404, { error: 'not found' });
});

server.listen(PORT, '127.0.0.1', () => console.log(`🔫 Arsenal Adapter :${PORT} → ${PROVIDER_BASE} · grupo ao vivo ativo`));
