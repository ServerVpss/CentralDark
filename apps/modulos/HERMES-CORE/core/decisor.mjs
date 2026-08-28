#!/usr/bin/env node
// 🧠 Decisor v5 — cadeia de IAs + cache + timeout por modelo + Elite Anthropic fallback
// Memória oficial: GraphRAG-Master injeta contexto do knowledge/ no prompt (fail-safe).
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buscarContexto } from '../agents/GraphRAG-Master/agent.mjs';
const pexec = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════
// APRENDIZADOS — lições que o Hermes já pagou caro pra saber
// (knowledge/aprendizados.json; só a categoria relevante entra no prompt)
// ═══════════════════════════════════════════════════════════════
const APRENDIZADOS_PATH = join(DIR, '../knowledge/aprendizados.json');

function licoesRelevantes(missao, historico, erros_anteriores = []) {
  try {
    const base = JSON.parse(readFileSync(APRENDIZADOS_PATH, 'utf8'));
    const contexto = (
      missao + ' ' +
      JSON.stringify(historico?.slice(-3) ?? []) + ' ' +
      JSON.stringify(erros_anteriores)
    ).toLowerCase();
    const linhas = [];
    for (const [cat, dados] of Object.entries(base.categorias || {})) {
      const bate = dados.sempre === true || (dados.gatilhos || []).some(g => g && contexto.includes(g.toLowerCase()));
      if (bate) for (const l of dados.licoes || []) linhas.push(`- [${cat}] ${l}`);
    }
    return linhas.slice(0, 14).join('\n');
  } catch { return ''; }
}

// ═══════════════════════════════════════════════════════════════
// CADEIA DE MODELOS — carregada de cadeia.json (editável em quente)
// Painel no WebUI: fab "H" → https://api.centralldark.com/hermes/*
// ═══════════════════════════════════════════════════════════════
const CADEIA_PATH = join(DIR, 'cadeia.json');
const CADEIA_TTL_MS = 60_000;
let _cadeiaCache = { ts: 0, darkai: null, elite: null };

// Fallback de segurança se cadeia.json quebrar
const CADEIA_FALLBACK_DARKAI = [
  { modelo: 'google/gemini-3-flash-preview', timeout_ms: 15_000 },
  { modelo: 'google/gemini-2.5-pro',         timeout_ms: 30_000 },
  { modelo: 'openai/gpt-5-mini',             timeout_ms: 45_000 },
];
const ELITE_FALLBACK = {
  url: 'https://api.centralldark.com/v1/messages',
  modelo: 'claude-sonnet-4-5',
  timeout_ms: 30_000,
};

function carregarCadeia() {
  const agora = Date.now();
  if (_cadeiaCache.darkai && (agora - _cadeiaCache.ts) < CADEIA_TTL_MS) return _cadeiaCache;
  try {
    const j = JSON.parse(readFileSync(CADEIA_PATH, 'utf8'));
    const ativos = (j.cadeia || []).filter(m => m.ativo !== false);
    // schema tolerante: se linha tiver via: 'elite-anthropic' vira elite;
    // senão trata como darkai. Também aceita fallback_final separado.
    const darkai = ativos
      .filter(m => (m.via || 'darkai') !== 'elite-anthropic')
      .map(m => ({ modelo: m.modelo, timeout_ms: (m.timeout_s || 30) * 1000 }));
    const eliteRow = ativos.find(m => m.via === 'elite-anthropic');
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
    _cadeiaCache = { ts: agora, darkai: darkai.length ? darkai : CADEIA_FALLBACK_DARKAI, elite };
  } catch (e) {
    console.error('[decisor] cadeia.json inválido, usando fallback:', e.message);
    _cadeiaCache = { ts: agora, darkai: CADEIA_FALLBACK_DARKAI, elite: ELITE_FALLBACK };
  }
  return _cadeiaCache;
}

// Cadeia darkai atual (array REAL a cada chamada — sem Proxy).
// Nota: a versão anterior usava `new Proxy([], {get})`; slice()/in operavam no alvo vazio
// e devolviam holes (undefined) na escalada de loop → cfg.modelo estourava. Corrigido.
function getCadeiaDarkai() { return carregarCadeia().darkai; }
// Vars atualizadas a cada leitura de cadeia (via refreshEliteVars)
let ELITE_URL         = ELITE_FALLBACK.url;
let ELITE_MODEL       = ELITE_FALLBACK.modelo;
let ELITE_TIMEOUT_MS  = ELITE_FALLBACK.timeout_ms;
function refreshEliteVars() {
  const e = carregarCadeia().elite;
  ELITE_URL = e.url; ELITE_MODEL = e.modelo; ELITE_TIMEOUT_MS = e.timeout_ms;
}
refreshEliteVars();
const ELITE_TOKEN = process.env.ELITE_ANTHROPIC_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN || '';

// ═══════════════════════════════════════════════════════════════
// CACHE in-memory (Map + TTL 10min + máx 100 itens)
// ═══════════════════════════════════════════════════════════════
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX    = 100;

function chaveCache(missao, historico) {
  const raw = JSON.stringify({
    m: missao,
    n: historico?.length ?? 0,
    ult: historico?.slice(-1)?.[0]?.etapa_titulo ?? null,
  });
  return createHash('sha1').update(raw).digest('hex').slice(0, 16);
}
function verCache(k) {
  const it = cache.get(k);
  if (!it) return null;
  if (Date.now() - it.ts > CACHE_TTL_MS) { cache.delete(k); return null; }
  return it.valor;
}
function salvarCache(k, valor) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(k, { ts: Date.now(), valor });
}

// ═══════════════════════════════════════════════════════════════
// PROMPT (system + schema) — SYSTEM oficial vive em prompts/hermes-core.md
// ═══════════════════════════════════════════════════════════════
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
  "ferramenta": "shell|darkai|git|escrever_arquivo|ler_arquivo|notificar_progresso|handler|aprender",
  "args": { ... },
  "terminou": false
}
Quando a missão estiver 100% concluída, devolva "terminou": true e "ferramenta": "notificar_progresso" com o resumo final.
`;

const SYSTEM_FALLBACK = `Você é o Hermes, executor autônomo da CentralDark. Pense passo-a-passo. Nunca desvie da missão. Sempre devolva JSON puro.`;
let SYSTEM = SYSTEM_FALLBACK;
try {
  const t = readFileSync(join(DIR, '../prompts/hermes-core.md'), 'utf8').trim();
  if (t) SYSTEM = t;
} catch {}

// Loop = últimas etapas com MESMA ferramenta + MESMOS args (o modelo travou numa ideia)
function detectarLoop(historico) {
  const n = historico?.length ?? 0;
  if (n < 2) return 0;
  const assin = (h) => JSON.stringify({ f: h.ferramenta, a: h.args });
  const ult = assin(historico[n - 1]);
  let rep = 1;
  for (let i = n - 2; i >= 0 && assin(historico[i]) === ult; i--) rep++;
  return rep;
}

// Releitura = mesmo arquivo lido 3+ vezes nas últimas 6 etapas (por QUALQUER ferramenta: ler_arquivo ou shell cat)
// — o modelo burla o detector de loop alternando ferramentas; o que importa é o EFEITO repetido
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

// Efeito repetido (v3) = mesmo comando shell rodado 3+x mudando só o "marcador"
// (ex.: `tsc --noEmit && echo v1` → `... && echo v2`) — normaliza e compara o EFEITO
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

// Detector v4: 2+ escritas no mesmo path nas últimas 5 etapas SEM validação entre elas
// (tsc/node --check/json.load) — reescrever no escuro não converge; a validação diz o que falta
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

function montarPrompt(missao, historico, erros_anteriores = [], memoria = '') {
  const hist = (historico || []).length === 0
    ? '(sem etapas ainda)'
    : historico.map((h, i) =>
        `Etapa ${i+1}: ${h.etapa_titulo}\nFerramenta: ${h.ferramenta}\nResultado: ${(h.resultado || '').slice(0, 500)}${h.critic ? `\n🧐 Critic: ${h.critic}` : ''}\n`
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

  return `MISSÃO ORIGINAL:\n${missao}\n\n---\nHISTÓRICO:\n${hist}${nota_erros}${bloco_licoes}${bloco_memoria}${bloco_loop}${bloco_rel}${bloco_efeito}${bloco_escrita}\n\n---\n${FERRAMENTAS}\n${SCHEMA}`;
}

function extrairJSON(texto) {
  const limpo = texto.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const m = limpo.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('sem JSON na resposta');
  return JSON.parse(m[0]);
}

// ═══════════════════════════════════════════════════════════════
// ENV VARS — darkai precisa delas no ambiente do subprocesso
// ═══════════════════════════════════════════════════════════════
const DARKAI_ENV = {
  ...process.env,
  DARKAI_ANON_KEY: process.env.DARKAI_ANON_KEY || '',
  DARKAI_URL: process.env.DARKAI_URL || '',
};

// ═══════════════════════════════════════════════════════════════
// FALLBACK FINAL — Elite Anthropic Proxy
// ═══════════════════════════════════════════════════════════════
async function chamarEliteAnthropic(prompt) {
  refreshEliteVars();
  if (!ELITE_TOKEN) throw new Error('ELITE_ANTHROPIC_TOKEN não configurado');
  const body = {
    model: ELITE_MODEL,
    max_tokens: 2048,
    system: SYSTEM,
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

// ═══════════════════════════════════════════════════════════════
// CHAMADA DARKAI COM RESILIÊNCIA — env vars + retry com backoff
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL — decidir(missao, historico)
// ═══════════════════════════════════════════════════════════════
export async function decidir(missao, historico) {
  // 1. Cache HIT?
  const k = chaveCache(missao, historico);
  const hit = verCache(k);
  if (hit) {
    console.log(`[decisor] 💾 cache HIT (${cache.size} itens)`);
    return { ...hit, _cache: true };
  }

  const historico_erros = [];

  // Memória oficial (GraphRAG-Master) — antes de decisão importante: início, a cada 5 etapas,
  // ou replanejamento (última etapa falhou). Fail-safe: sem memória a missão segue.
  let memoria = '';
  const n = historico?.length ?? 0;
  const ultimaFalhou = n > 0 && historico[n - 1]?.ok === false;
  if (n % 5 === 0 || ultimaFalhou) {
    try { memoria = await buscarContexto(missao); } catch {}
  }

  // ═════════════════════════════════════════════════════════════
  // ROTEAMENTO DE MODELO (barato → caro) — a decisão de verdade:
  //   1. cadeia.json é ORDENADA por custo: Flash (barato, ~90% das etapas) primeiro,
  //      depois Gemini Pro, GPT-5, Opus/Sonnet/Haiku, Grok — nesta ordem.
  //   2. Etapa normal: tenta do MAIS BARATO pro mais caro; para no 1º que responder JSON válido.
  //   3. Escalada automática: loop/releitura/escrita-cega detectados → PULA o barato
  //      (slice(1)) e vai direto pro modelo forte quebrar o empate.
  //   4. Se TODOS falharem → Elite Anthropic (fallback final, fora do darkai).
  // ═════════════════════════════════════════════════════════════
  const emLoop = detectarLoop(historico) >= 3 || !!detectarReleituras(historico) || !!detectarEfeitoRepetido(historico) || !!detectarEscritaSemValidacao(historico);
  const cadeiaDarkai = getCadeiaDarkai();
  // slice(1) seguro: se a cadeia tiver só 1 modelo, mantém ele em vez de array vazio
  // (array vazio faria o loop pular todos os darkai e cair direto no Elite)
  let cadeia = cadeiaDarkai;
  if (emLoop) {
    if (cadeiaDarkai.length <= 1) {
      cadeia = cadeiaDarkai; // só tem 1 modelo, não tem pra onde escalar
    } else {
      cadeia = cadeiaDarkai.slice(1); // pula o mais barato, tenta o resto
    }
    console.log(`[decisor] 🔁 loop/releitura detectado — escalando (${cadeia.length} modelos restantes)`);
  }

  // 2. Tenta os modelos via darkai (com env vars + retry)
  for (const cfg of cadeia) {
    const t0 = Date.now();
    try {
      const prompt = montarPrompt(missao, historico, historico_erros, memoria);
      const stdout = await chamarDarkaiComResiliencia(cfg.modelo, SYSTEM, prompt, cfg.timeout_ms);
      const decisao = extrairJSON(stdout);
      decisao._modelo_usado = cfg.modelo;
      console.log(`[decisor] ✅ ${cfg.modelo} respondeu em ${Date.now()-t0}ms`);
      salvarCache(k, decisao);
      return decisao;
    } catch (e) {
      const erro = (((e.stderr || '') + ' ' + (e.message || '')).trim().replace(/\s+/g, ' ')).slice(0, 300);
      console.error(`[decisor] ⚠️  ${cfg.modelo} falhou (${Date.now()-t0}ms): ${erro}`);
      historico_erros.push({ modelo: cfg.modelo, erro });
    }
  }

  // 3. Fallback final — Elite Anthropic
  console.log('[decisor] 🚨 caiu no Elite Anthropic (fallback final)');
  const t0 = Date.now();
  try {
    const prompt = montarPrompt(missao, historico, historico_erros, memoria);
    const texto = await chamarEliteAnthropic(prompt);
    const decisao = extrairJSON(texto);
    decisao._modelo_usado = `elite:${ELITE_MODEL}`;
    console.log(`[decisor] ✅ Elite ${ELITE_MODEL} respondeu em ${Date.now()-t0}ms`);
    salvarCache(k, decisao);
    return decisao;
  } catch (e) {
    console.error(`[decisor] 🔥 Elite também falhou: ${e.message}`);
    throw new Error(`tudo falhou — darkai(${historico_erros.length}) + elite: ${e.message}`);
  }
}

// CLI standalone pra debug
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, missao = 'test', hist = '[]'] = process.argv;
  decidir(missao, JSON.parse(hist)).then(d => console.log(JSON.stringify(d, null, 2)));
}
