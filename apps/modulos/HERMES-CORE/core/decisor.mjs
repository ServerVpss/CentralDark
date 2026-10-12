#!/usr/bin/env node
// 🧠 Decisor v5.1 — cadeia + strategy (OmniRoute delta) + cache + Elite fallback
// Memória oficial: GraphRAG-Master injeta contexto do knowledge/ no prompt (fail-safe).
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buscarContexto } from '../agents/GraphRAG-Master/agent.mjs';
import { applyRoutingStrategy } from './routing-strategy.mjs';
import { evaluatePerceptionGate } from './perception-policy.mjs';
import { consultarContexto } from '../agents/Knowledge-Collector/agent.mjs';
const pexec = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));


function licoesRelevantes(missao, historico, erros_anteriores = []) {
  try {
    const contexto = [
      String(missao || ''),
      JSON.stringify(historico?.slice(-4) ?? []),
      JSON.stringify(erros_anteriores ?? []),
    ].join(' ');
    return consultarContexto(contexto, 14)
      .map((linha) => `- ${String(linha).replace(/^[- ]+/, '')}`)
      .join('\n');
  } catch {
    return '';
  }
}

const CADEIA_PATH = join(DIR, 'cadeia.json');
const CADEIA_TTL_MS = 60_000;
let _cadeiaCache = { ts: 0, darkai: null, elite: null, strategy: 'priority' };

const CADEIA_FALLBACK_DARKAI = [
  { modelo: 'google/gemini-3-flash-preview', timeout_ms: 15_000, cost_weight: 1 },
  { modelo: 'google/gemini-2.5-pro',         timeout_ms: 30_000, cost_weight: 3 },
  { modelo: 'openai/gpt-5-mini',             timeout_ms: 45_000, cost_weight: 3 },
];
const ELITE_FALLBACK = {
  url: 'https://api.centralldark.com/v1/messages',
  modelo: 'claude-sonnet-4-5',
  timeout_ms: 30_000,
};

const ELITE_VIAS = new Set(['elite-anthropic', 'centraldark-gateway']);

function isEliteVia(via) {
  return ELITE_VIAS.has(String(via || '').toLowerCase());
}

function carregarCadeia() {
  const agora = Date.now();
  if (_cadeiaCache.darkai && (agora - _cadeiaCache.ts) < CADEIA_TTL_MS) return _cadeiaCache;
  try {
    const j = JSON.parse(readFileSync(CADEIA_PATH, 'utf8'));
    const strategy = (j.routing && j.routing.strategy) || 'priority';
    const ativos = (j.cadeia || []).filter(m => m.ativo !== false);

    const darkaiRaw = ativos
      .filter(m => !isEliteVia(m.via))
      .map(m => ({
        modelo: m.modelo,
        timeout_ms: (m.timeout_s || 30) * 1000,
        cost_weight: m.cost_weight,
        tier: m.tier,
      }));

    const darkai = applyRoutingStrategy(
      darkaiRaw.length ? darkaiRaw : CADEIA_FALLBACK_DARKAI,
      strategy,
    );

    const eliteRow = ativos.find(m => isEliteVia(m.via));
    const ff = j.fallback_final && j.fallback_final.ativo !== false ? j.fallback_final : null;
    const elite = eliteRow ? {
      url: (j.elite && j.elite.url) || ELITE_FALLBACK.url,
      modelo: eliteRow.modelo,
      timeout_ms: (eliteRow.timeout_s || 30) * 1000,
    } : ff ? {
      url: ELITE_FALLBACK.url,
      modelo: ff.modelo || ELITE_FALLBACK.modelo,
      timeout_ms: (ff.timeout_s || 30) * 1000,
    } : ELITE_FALLBACK;

    _cadeiaCache = { ts: agora, darkai, elite, strategy };
  } catch (e) {
    console.error('[decisor] cadeia.json inválido, usando fallback:', e.message);
    _cadeiaCache = { ts: agora, darkai: CADEIA_FALLBACK_DARKAI, elite: ELITE_FALLBACK, strategy: 'priority' };
  }
  return _cadeiaCache;
}

function getCadeiaDarkai() { return carregarCadeia().darkai; }

let ELITE_URL         = ELITE_FALLBACK.url;
let ELITE_MODEL       = ELITE_FALLBACK.modelo;
let ELITE_TIMEOUT_MS  = ELITE_FALLBACK.timeout_ms;
function refreshEliteVars() {
  const e = carregarCadeia().elite;
  ELITE_URL = e.url; ELITE_MODEL = e.modelo; ELITE_TIMEOUT_MS = e.timeout_ms;
}
refreshEliteVars();
const ELITE_TOKEN = process.env.ELITE_ANTHROPIC_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN || '';

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX    = 100;

function contextoPersistido(state = {}) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return {};
  const keys = ['objetivo', 'head_sha', 'next_cursor', 'next_readonly_probe',
    'open_work', 'recoverable_unknown', 'recoverable_fail',
    'writer_conflict', 'reality_judge'];
  return Object.fromEntries(keys.filter(k => Object.hasOwn(state, k)).map(k => [k, state[k]]));
}

function chaveCache(missao, historico, continuityState = {}) {
  const raw = JSON.stringify({
    m: missao,
    n: historico?.length ?? 0,
    ultimo_resultado: historico?.slice(-1)?.[0] ?? null,
    continuidade: contextoPersistido(continuityState),
  });
  return createHash('sha1').update(raw).digest('hex').slice(0, 16);
}
function verCache(k) {
  const it = cache.get(k);
  if (!it) return null;
  if (Date.now() - it.ts > CACHE_TTL_MS) { cache.delete(k); return null; }
  try {
    return validarDecisao(it.valor);
  } catch {
    cache.delete(k);
    return null;
  }
}
function salvarCache(k, valor) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(k, { ts: Date.now(), valor });
}

const FERRAMENTAS = `
Você tem estas ferramentas disponíveis (escolha UMA por etapa):

1. "shell" — executa comando bash na VPS dentro de /root/CentralDark
   args: { "comando": "ls -la" }

2. "darkai" — consulta outra IA pra pensar/analisar/gerar texto
   args: { "modelo": "openai/gpt-5", "prompt": "..." }

3. "git" — operações git (commit, push, status, diff)
   args: { "acao": "commit_push", "mensagem": "...", "paths": ["apps/modulos/hub"] }  |  { "acao": "status" }\n   REGRA: paths é OBRIGATÓRIO no commit_push — só os caminhos que a missão tocou.

4. "escrever_arquivo" — cria ou sobrescreve arquivo dentro de /root/CentralDark
   args: { "path": "docs/foo.md", "conteudo": "..." }

5. "ler_arquivo" — lê arquivo dentro de /root/CentralDark
   args: { "path": "docs/foo.md" }

6. "notificar_progresso" — só posta no Telegram (informativo, sem executar nada)
   args: { "mensagem": "..." }

7. "aprender" — grava uma lição aprendida pra NUNCA repetir o mesmo erro (memória permanente)
   args: { "categoria": "git|timeout|json|typescript|permissao|geral", "licao": "frase curta e acionável" }

8. "handler" — ponte UNIVERSAL com qualquer serviço externo por HTTP (deploy, webhook, health, API)
   args: { "acao": "http|ping|webhook|deploy|pm2", ... }
   exemplos:
     { "acao": "ping", "url": "https://api.centralldark.com/health" }
     { "acao": "http", "metodo": "POST", "url": "https://...", "headers": {}, "body": {} }
     { "acao": "deploy", "url": "https://webhook.centralldark.com/deploy", "body": {} }
     { "acao": "pm2", "nome": "hermes" }
`;

const SCHEMA = `
DEVOLVA APENAS JSON VÁLIDO, SEM MARKDOWN, SEM \`\`\`, ASSIM:
{
  "pensamento": "por que essa etapa agora (1-2 frases)",
  "etapa_titulo": "título curto pro Telegram (max 60 char)",
  "estado": "TESTE|FATO|FAIL|BLOCKED|CHEFE_SEGREDO_NECESSARIO",
  "ferramenta": "shell|darkai|git|escrever_arquivo|ler_arquivo|notificar_progresso|handler|aprender",
  "args": { ... },
  "continuity": { "next_cursor": "FIXED_POINT|NEXT_STEP", "next_readonly_probe": "", "open_work": 0, "recoverable_unknown": 0, "recoverable_fail": 0, "writer_conflict": false, "oracle_uncertainty": false, "human_frontier": false, "reality_judge": "PASS|UNKNOWN" },
  "terminou": false
}
UNKNOWN, estado vazio ou estado fora do enum são inválidos. Se falta evidência, use TESTE e escolha a ação que mais reduz a incerteza. Use FATO somente quando a evidência resolveu a dúvida. FAIL registra falha observada; BLOCKED registra impedimento externo; CHEFE_SEGREDO_NECESSARIO é reservado à única dependência humana impossível de resolver pelo organismo.
Quando a missão declarar CONTINUE_SAME_GOAL=true ou HERMES_PARENT_GOAL_CONTINUOUS_LOOP, inclua continuity em toda proposta de término: somente NEXT_CURSOR=FIXED_POINT, zero trabalho/UNKNOWN/falha recuperável e REALITY_JUDGE=PASS permitem terminou=true.
Quando a missão estiver 100% concluída e provada, devolva "estado": "FATO", "terminou": true e "ferramenta": "notificar_progresso" com o resumo final.
`;

const ESTADOS_DECISAO = new Set(['TESTE', 'FATO', 'FAIL', 'BLOCKED', 'CHEFE_SEGREDO_NECESSARIO']);

export function validarDecisao(decisao) {
  if (!decisao || typeof decisao !== 'object' || Array.isArray(decisao)) throw new Error('decisão inválida');
  const estado = String(decisao.estado || '').trim().toUpperCase();
  if (!ESTADOS_DECISAO.has(estado)) throw new Error(`estado semântico inválido: ${estado || 'AUSENTE'}`);
  if (decisao.terminou === true && estado !== 'FATO') throw new Error(`estado ${estado} não pode encerrar missão`);
  return { ...decisao, estado };
}

function shellQuote(value) {
  return `'${String(value ?? '').replace(/'/g, `'\\''`)}'`;
}

function perceptionProposal(decisao, scopeKey) {
  const safe = {
    ferramenta: String(decisao?.ferramenta || ''),
    scope_key: scopeKey,
    estado: String(decisao?.estado || ''),
    etapa_titulo: String(decisao?.etapa_titulo || '').slice(0, 120),
    pensamento: String(decisao?.pensamento || '').slice(0, 500),
  };
  return Buffer.from(JSON.stringify(safe), 'utf8').toString('base64url');
}

export function aplicarGatePercepcao(decisao, historico = [], { emLoop = false } = {}) {
  const gate = evaluatePerceptionGate({ decisao, historico });
  const loopForcesGate = emLoop === true && gate.mutation?.mutating === true && gate.status === 'NOT_REQUIRED_CLEAR_LOCAL';

  if (gate.required === true || loopForcesGate) {
    const proposal = perceptionProposal(decisao, gate.scope_key);
    return {
      pensamento: `gate determinístico de percepção antes de ${gate.mutation?.kind || 'MUTATION'}`,
      etapa_titulo: 'Quatro percepções antes da caneta',
      estado: 'TESTE',
      ferramenta: 'shell',
      args: {
        comando: `HERMES_PERCEPTION_SCOPE_KEY=${shellQuote(gate.scope_key)} HERMES_PERCEPTION_PROPOSAL_B64=${shellQuote(proposal)} node apps/modulos/HERMES-CORE/core/perception-orchestra.mjs --active-mission`,
      },
      terminou: false,
      _perception_gate_status: 'REQUIRE_FOUR_PERCEPTIONS',
      _perception_original_tool: decisao.ferramenta,
      _perception_original_scope: gate.scope_key,
      _perception_triggers: { ...(gate.triggers || {}), loop_detected: emLoop === true },
    };
  }

  if (gate.allow_mutation === false) {
    const tests = (gate.active_gate?.discriminating_tests || []).slice(0, 4).join(' | ');
    return {
      pensamento: 'a percepção anterior ainda não provou delta suficiente; mutação continua bloqueada',
      etapa_titulo: 'Caneta bloqueada até contraprova',
      estado: 'TESTE',
      ferramenta: 'notificar_progresso',
      args: {
        mensagem: `PERCEPTION_GATE=BLOCKED next=${gate.active_gate?.next_rule || 'TEST_REQUIRED'}${tests ? ` tests=${tests}` : ''}`.slice(0, 700),
      },
      terminou: false,
      _perception_gate_status: gate.status,
      _perception_original_tool: decisao.ferramenta,
      _perception_original_scope: gate.scope_key,
    };
  }

  return {
    ...decisao,
    _perception_gate_status: gate.status,
    _perception_scope_key: gate.scope_key,
  };
}

const SYSTEM_FALLBACK = `Você é o Hermes, executor autônomo da CentralDark. Nunca promova estado sem evidência. Sempre devolva JSON puro.`;
const HERMES_PROMPT_PATH = join(DIR, '../prompts/hermes-core.md');
const RUNTIME_CONTRACT_PATH = join(DIR, '../../../../docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/HERMES-AUTOCONFIG-RUNTIME.yml');

export function carregarSystemCanonico() {
  let prompt = '';
  let runtime = '';
  try {
    prompt = readFileSync(HERMES_PROMPT_PATH, 'utf8').trim();
    runtime = readFileSync(RUNTIME_CONTRACT_PATH, 'utf8').trim();
  } catch (error) {
    throw new Error(`CANONICAL_RUNTIME_CONTRACT_LOAD_FAILED:${error.message}`);
  }
  if (!prompt) throw new Error('CANONICAL_HERMES_PROMPT_EMPTY');
  if (!runtime) throw new Error('CANONICAL_RUNTIME_CONTRACT_EMPTY');

  return {
    system: [
      prompt,
      '',
      '## RUNTIME CONTRACT — CURRENT',
      runtime,
      '',
      '## OUTPUT',
      'Sempre devolva JSON puro no schema exigido. Não exponha cadeia de pensamento privada.',
    ].join('\n'),
    promptPath: HERMES_PROMPT_PATH,
    runtimePath: RUNTIME_CONTRACT_PATH,
    promptSha256: createHash('sha256').update(prompt).digest('hex'),
    runtimeSha256: createHash('sha256').update(runtime).digest('hex'),
    deltaUtilityGateBound: runtime.includes('DELTA_UTIL_CONTINUA; SEM_PROVA_NAO_PASSA'),
    noProofNoPassBound: runtime.includes('NO_PROOF_NO_PASS: true'),
  };
}

export function provarContratoRuntime() {
  const current = carregarSystemCanonico();
  return {
    schema: 'centraldark.hermes-core.runtime-binding.v1',
    ok: current.deltaUtilityGateBound && current.noProofNoPassBound,
    prompt_path: current.promptPath,
    runtime_path: current.runtimePath,
    prompt_sha256: current.promptSha256,
    runtime_sha256: current.runtimeSha256,
    delta_utility_gate_bound: current.deltaUtilityGateBound,
    no_proof_no_pass_bound: current.noProofNoPassBound,
  };
}

function detectarLoop(historico) {
  const n = historico?.length ?? 0;
  if (n < 2) return 0;
  const assin = (h) => JSON.stringify({ f: h.ferramenta, a: h.args });
  const ult = assin(historico[n - 1]);
  let rep = 1;
  for (let i = n - 2; i >= 0 && assin(historico[i]) === ult; i--) rep++;
  return rep;
}

function detectarReleituras(historico) {
  const contagem = {};
  for (const h of (historico ?? []).slice(-6)) {
    let path = null;
    if (h.ferramenta === 'ler_arquivo') path = h.args?.path;
    else if (h.ferramenta === 'shell' && /\bcat\s+\S+/.test(h.args?.comando || ''))
      path = (h.args.comando.match(/\bcat\s+([^\s|;&>]+)/) || [])[1];
    if (!path) continue;
    const norm = String(path).replace('/root/CentralDark/', '');
    contagem[norm] = (contagem[norm] || 0) + 1;
  }
  let top = null;
  for (const [p, c] of Object.entries(contagem))
    if (c >= 3 && (!top || c > top.count)) top = { path: p, count: c };
  return top;
}

function normalizarComando(cmd) {
  return String(cmd || '')
    .replace(/(&&|;|\|\|)\s*echo\s+[^&;|]*/gi, ' ')
    .replace(/#[^\n]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function detectarEfeitoRepetido(historico) {
  const contagem = {};
  for (const h of (historico ?? []).slice(-6)) {
    if (h.ferramenta !== 'shell') continue;
    const norm = normalizarComando(h.args?.comando);
    if (!norm) continue;
    contagem[norm] = (contagem[norm] || 0) + 1;
  }
  let top = null;
  for (const [c, n] of Object.entries(contagem))
    if (n >= 3 && (!top || n > top.count)) top = { comando: c.slice(0, 120), count: n };
  return top;
}

function detectarEscritaSemValidacao(historico) {
  const ult = (historico ?? []).slice(-5);
  const escritas = {};
  let validou = false;
  for (const h of ult) {
    if (h.ferramenta === 'escrever_arquivo' && h.args?.path) {
      const p = String(h.args.path).replace('/root/CentralDark/', '');
      escritas[p] = (escritas[p] || 0) + 1;
    }
    if (h.ferramenta === 'shell' && /tsc --noEmit|node --check|json\.load|vite build/.test(h.args?.comando || '')) validou = true;
  }
  if (validou) return null;
  for (const [p, n] of Object.entries(escritas)) if (n >= 2) return { path: p, count: n };
  return null;
}

function montarPrompt(missao, historico, erros_anteriores = [], memoria = '', continuityState = {}) {
  const hist = (historico || []).length === 0
    ? '(sem etapas ainda)'
    : historico.map((h, i) =>
        `Etapa ${i+1}: ${h.etapa_titulo}\nFerramenta: ${h.ferramenta}\nResultado: ${(h.resultado || '').slice(0, 500)}${h.critic ? `\n🧐 Critic: ${h.critic}` : ''}${h.learning_ref ? `\nAprendizado comprovado: ${h.learning_ref}` : ''}\n`
      ).join('\n---\n');

  const nota_erros = erros_anteriores.length
    ? `\n\n[NOTA: Modelos anteriores falharam: ${erros_anteriores.map(e => `${e.modelo} (${e.erro})`).join(' | ')}]`
    : '';

  const licoes = licoesRelevantes(missao, historico, erros_anteriores);
  const bloco_licoes = licoes
    ? `\n\n---\nLIÇÕES APRENDIDAS (você já errou nisso antes — respeite):\n${licoes}`
    : '';

  const bloco_memoria = memoria
    ? `\n\n---\nMEMÓRIA OFICIAL (GraphRAG-Master — docs relevantes pra esta missão):\n${memoria}`
    : '';

  const rep = detectarLoop(historico);
  const bloco_loop = rep >= 2
    ? `\n\n🚨🚨 VOCÊ ESTÁ EM LOOP: as últimas ${rep} etapas usaram EXATAMENTE a mesma ferramenta com os mesmos args e nada mudou. É PROIBIDO repetir essa chamada. Mude de abordagem AGORA: se estava lendo, ESCREVA a correção (escrever_arquivo); se não sabe corrigir, pule e anote no relatório. 🚨🚨`
    : '';

  const rel = detectarReleituras(historico);
  const bloco_rel = rel
    ? `\n\n🚨 VOCÊ JÁ LEU ${rel.path} ${rel.count}x NAS ÚLTIMAS 6 ETAPAS sem corrigir nada. PROIBIDO ler esse arquivo de novo (por ler_arquivo OU shell). O conteúdo já está no seu histórico. A PRÓXIMA AÇÃO DEVE SER escrever_arquivo em ${rel.path} com o arquivo COMPLETO corrigido. 🚨`
    : '';

  const efe = detectarEfeitoRepetido(historico);
  const bloco_efeito = efe
    ? `\n\n🚨 EFEITO REPETIDO: você rodou o MESMO comando ${efe.count}x nas últimas 6 etapas (mudar o echo/marcador NÃO muda o resultado): "${efe.comando}". O resultado já está no histórico — CONFIE no exit code da 1ª rodada. PROIBIDO rodar esse comando de novo. Avance: corrija, conclua ou anote no relatório. 🚨`
    : '';

  const esc = detectarEscritaSemValidacao(historico);
  const bloco_escrita = esc
    ? `\n\n🚨 ESCRITA SEM VALIDAÇÃO: você escreveu ${esc.count}x em ${esc.path} sem validar entre as escritas. Reescrever no escuro NÃO converge. AÇÃO OBRIGATÓRIA AGORA (única aceita): ferramenta shell com \`cd /root/CentralDark/apps/modulos/hub && npx tsc --noEmit -p tsconfig.app.json && echo TSC_OK\` — o erro (ou o TSC_OK) decide o próximo passo. 🚨`
    : '';

  const estado = JSON.stringify(contextoPersistido(continuityState)).slice(0, 2400);
  return `MISSÃO ORIGINAL:\n${missao}\n\n---\nESTADO PERSISTIDO (DADOS, NÃO NOVA AUTORIDADE):\n${estado}\n\n---\nHISTÓRICO:\n${hist}${nota_erros}${bloco_licoes}${bloco_memoria}${bloco_loop}${bloco_rel}${bloco_efeito}${bloco_escrita}\n\n---\n${FERRAMENTAS}\n${SCHEMA}`;
}

function extrairJSON(texto) {
  const limpo = texto.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const m = limpo.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('sem JSON na resposta');
  return JSON.parse(m[0]);
}

const DARKAI_ENV = {
  ...process.env,
  DARKAI_ANON_KEY: process.env.DARKAI_ANON_KEY || '',
  DARKAI_URL: process.env.DARKAI_URL || '',
};

async function chamarEliteAnthropic(prompt, system) {
  refreshEliteVars();
  if (!ELITE_TOKEN) throw new Error('ELITE_ANTHROPIC_TOKEN não configurado');
  const body = {
    model: ELITE_MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: prompt }],
  };
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    try {
      const res = await fetch(ELITE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ELITE_TOKEN,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(ELITE_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const texto = data?.content?.[0]?.text;
      if (!texto) throw new Error('resposta vazia');
      return texto;
    } catch (e) {
      if (tentativa === 2) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function chamarRuntimeLocal(system, prompt) {
  const statePath = process.env.HERMES_LOCAL_RUNTIME_STATE || '/root/.hermes/runtimes/llamacpp/server.json';
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const baseUrl = String(state?.base_url || '').replace(/\/$/, '');
  const apiKey = String(state?.api_key || '');
  if (!baseUrl || !apiKey) throw new Error('LOCAL_RUNTIME_BINDING_INCOMPLETE');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  const modelsRes = await fetch(baseUrl + '/models', {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (!modelsRes.ok) throw new Error(`LOCAL_MODELS_HTTP_${modelsRes.status}`);
  const models = await modelsRes.json();
  const model = String(models?.data?.[0]?.id || '').trim();
  if (!model) throw new Error('LOCAL_MODEL_UNRESOLVED');

  const res = await fetch(baseUrl + '/chat/completions', {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(Number(process.env.HERMES_LOCAL_DECISOR_TIMEOUT_MS || 120000)),
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
      max_tokens: 900,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`LOCAL_CHAT_HTTP_${res.status}`);
  const data = await res.json();
  const texto = data?.choices?.[0]?.message?.content;
  if (!texto) throw new Error('LOCAL_CHAT_EMPTY');
  return { texto, model };
}

async function chamarDarkaiComResiliencia(modelo, system, prompt, timeout_ms, tentativas = 2) {
  for (let t = 1; t <= tentativas; t++) {
    try {
      const p = pexec('darkai', ['--model', modelo, '--system', system, prompt], {
        env: { ...process.env },
        maxBuffer: 10 * 1024 * 1024,
        timeout: timeout_ms,
        env: DARKAI_ENV,
      });
      p.child.stdin.end();
      const { stdout } = await p;
      return stdout;
    } catch (e) {
      const erro = (((e.stderr || '') + ' ' + (e.message || '')).trim().replace(/\s+/g, ' ')).slice(0, 300);
      if (t < tentativas) {
        const backoff = Math.min(2000 * Math.pow(2, t - 1), 10_000);
        console.log(`[decisor] ⏳ darkai tentativa ${t}/${tentativas} falhou, backoff ${backoff}ms: ${erro}`);
        await new Promise(r => setTimeout(r, backoff));
      } else {
        throw e;
      }
    }
  }
}

export async function decidir(missao, historico, continuityState = {}) {
  const canonical = carregarSystemCanonico();
  const system = canonical.system;
  const k = chaveCache(missao, historico, continuityState);
  const hit = verCache(k);
  if (hit) {
    console.log(`[decisor] 💾 cache HIT (${cache.size} itens)`);
    return { ...hit, _cache: true };
  }

  const historico_erros = [];

  // Corpo primário: modelo local já residente na VPS. Provedores remotos são fallback.
  try {
    const t0 = Date.now();
    const memoriaLocal = '';
    const prompt = montarPrompt(missao, historico, historico_erros, memoriaLocal, continuityState);
    const local = await chamarRuntimeLocal(system, prompt);
    const bruta = validarDecisao(extrairJSON(local.texto));
    const decisao = validarDecisao(aplicarGatePercepcao(bruta, historico, { emLoop: false }));
    decisao._modelo_usado = `local:${local.model}`;
    decisao._provider = 'llamacpp-local';
    console.log(`[decisor] ✅ local ${local.model} respondeu em ${Date.now()-t0}ms gate=${decisao._perception_gate_status || 'UNKNOWN'}`);
    salvarCache(k, decisao);
    return decisao;
  } catch (e) {
    const erro = String(e?.message || e).replace(/\s+/g, ' ').slice(0, 300);
    console.error(`[decisor] ⚠️ local runtime falhou: ${erro}; escalando para cadeia remota`);
    historico_erros.push({ modelo: 'LOCAL_RUNTIME', erro });
  }

  let memoria = '';
  const n = historico?.length ?? 0;
  const ultimaFalhou = n > 0 && historico[n - 1]?.ok === false;
  if (n % 5 === 0 || ultimaFalhou) {
    try { memoria = await buscarContexto(missao); } catch {}
  }

  const emLoop = detectarLoop(historico) >= 3 || !!detectarReleituras(historico) || !!detectarEfeitoRepetido(historico) || !!detectarEscritaSemValidacao(historico);
  const cadeiaDarkai = getCadeiaDarkai();
  let cadeia = cadeiaDarkai;
  if (emLoop) {
    if (cadeiaDarkai.length <= 1) {
      cadeia = cadeiaDarkai;
    } else {
      cadeia = cadeiaDarkai.slice(1);
    }
    console.log(`[decisor] 🔁 loop/releitura detectado — escalando (${cadeia.length} modelos restantes)`);
  }

  for (const cfg of cadeia) {
    const t0 = Date.now();
    try {
      const prompt = montarPrompt(missao, historico, historico_erros, memoria, continuityState);
      const stdout = await chamarDarkaiComResiliencia(cfg.modelo, system, prompt, cfg.timeout_ms);
      const bruta = validarDecisao(extrairJSON(stdout));
      const decisao = validarDecisao(aplicarGatePercepcao(bruta, historico, { emLoop }));
      decisao._modelo_usado = cfg.modelo;
      console.log(`[decisor] ✅ ${cfg.modelo} respondeu em ${Date.now()-t0}ms gate=${decisao._perception_gate_status || 'UNKNOWN'}`);
      salvarCache(k, decisao);
      return decisao;
    } catch (e) {
      const erro = (((e.stderr || '') + ' ' + (e.message || '')).trim().replace(/\s+/g, ' ')).slice(0, 300);
      console.error(`[decisor] ⚠️  ${cfg.modelo} falhou (${Date.now()-t0}ms): ${erro}`);
      historico_erros.push({ modelo: cfg.modelo, erro });
    }
  }

  console.log('[decisor] 🚨 caiu no Elite Anthropic (fallback final)');
  const t0 = Date.now();
  try {
    const prompt = montarPrompt(missao, historico, historico_erros, memoria, continuityState);
    const texto = await chamarEliteAnthropic(prompt, system);
    const bruta = validarDecisao(extrairJSON(texto));
    const decisao = validarDecisao(aplicarGatePercepcao(bruta, historico, { emLoop }));
    decisao._modelo_usado = `elite:${ELITE_MODEL}`;
    console.log(`[decisor] ✅ Elite ${ELITE_MODEL} respondeu em ${Date.now()-t0}ms gate=${decisao._perception_gate_status || 'UNKNOWN'}`);
    salvarCache(k, decisao);
    return decisao;
  } catch (e) {
    console.error(`[decisor] 🔥 Elite também falhou: ${e.message}`);
    throw new Error(`tudo falhou — darkai(${historico_erros.length}) + elite: ${e.message}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--contract-probe')) {
    try {
      const result = provarContratoRuntime();
      console.log(JSON.stringify(result, null, 2));
      console.log(result.ok ? 'HERMES_CORE_RUNTIME_BINDING=PASS' : 'HERMES_CORE_RUNTIME_BINDING=FAIL');
      if (!result.ok) process.exitCode = 1;
    } catch (error) {
      console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
      console.error('HERMES_CORE_RUNTIME_BINDING=FAIL');
      process.exitCode = 1;
    }
  } else {
    const [,, missao = 'test', hist = '[]'] = process.argv;
    decidir(missao, JSON.parse(hist)).then(d => console.log(JSON.stringify(d, null, 2)));
  }
}