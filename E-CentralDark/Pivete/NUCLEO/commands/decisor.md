# COMANDO - decisor.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\core\decisor.mjs
**SHA:** 3453dcd66f5584a5
**Timestamp:** 2026-08-28T02:56:26.513607
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- comando: `HERMES_PERCEPTION_SCOPE_KEY=${shellQuote(gate.scope_key)} HERMES_PERCEPTION_PROPOSAL_B64=${shellQuote(proposal)} node apps/modulos/HERMES-CORE/core/perception-orchestra.mjs --active-mission`
- if (n >= 3 && (!top || n > top.count)) top = { comando: c.slice(0, 120), count: n };
- const prompt = montarPrompt(missao, historico, historico_erros, memoria);
- const prompt = montarPrompt(missao, historico, historico_erros, memoria);

### Decisoes
- const ESTADOS_DECISAO = new Set(['TESTE', 'FATO', 'FAIL', 'BLOCKED', 'CHEFE_SEGREDO_NECESSARIO']);
- const decisao = validarDecisao(aplicarGatePercepcao(bruta, historico, { emLoop }));
- const decisao = validarDecisao(aplicarGatePercepcao(bruta, historico, { emLoop }));

### Padroes
- args: { "acao": "commit_push", "mensagem": "...", "paths": ["apps/modulos/hub"] }  |  { "acao": "status" }\n   REGRA: paths é OBRIGATÓRIO no commit_push — só os caminhos que a missão tocou.

### Contratos
- const gate = evaluatePerceptionGate({ decisao, historico });
- const loopForcesGate = emLoop === true && gate.mutation?.mutating === true && gate.status === 'NOT_REQUIRED_CLEAR_LOCAL';
- mensagem: `PERCEPTION_GATE=BLOCKED next=${gate.active_gate?.next_rule || 'TEST_REQUIRED'}${tests ? ` tests=${tests}` : ''}`.slice(0, 700),
- console.log(`[decisor] ✅ ${cfg.modelo} respondeu em ${Date.now()-t0}ms gate=${decisao._perception_gate_status || 'UNKNOWN'}`);
- console.log(`[decisor] ✅ Elite ${ELITE_MODEL} respondeu em ${Date.now()-t0}ms gate=${decisao._perception_gate_status || 'UNKNOWN'}`);

### Ouro Bruto (primeiros 5000 chars)
```
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
const pexec = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));

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
Você tem estas ferramentas disponívei
```

---

# COMANDO - decisor.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\backups\2026-07-03-hermes-darkai\decisor.mjs
**SHA:** 42a723e4e0dc27ef
**Timestamp:** 2026-08-28T02:56:41.649489
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = montarPrompt(missao, historico, historico_erros);
- const prompt = montarPrompt(missao, historico, historico_erros);

### Decisoes
- const decisao = extrairJSON(stdout);
- const decisao = extrairJSON(texto);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// 🧠 Decisor v2 — cadeia de 4 IAs + cache + timeout por modelo + Elite Anthropic fallback
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
const pexec = promisify(execFile);

// ═══════════════════════════════════════════════════════════════
// CADEIA DE MODELOS (ordem de tentativa)
// ═══════════════════════════════════════════════════════════════
const CADEIA_DARKAI = [
  { modelo: 'google/gemini-3-flash-preview', timeout_ms: 15_000 },
  { modelo: 'google/gemini-2.5-pro',         timeout_ms: 30_000 },
  { modelo: 'openai/gpt-5-mini',             timeout_ms: 45_000 },
];

// Elite Anthropic Proxy (4º fallback, sempre vivo)
const ELITE_URL   = 'https://claude.ap7.site/v1/messages';
const ELITE_MODEL = 'claude-sonnet-4-5';
const ELITE_TOKEN = process.env.ELITE_ANTHROPIC_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN || '';
const ELITE_TIMEOUT_MS = 30_000;

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
// PROMPT (system + schema)
// ═══════════════════════════════════════════════════════════════
const FERRAMENTAS = `
Você tem estas ferramentas disponíveis (escolha UMA por etapa):

1. "shell" — executa comando bash na VPS dentro de /root/CentralDark
   args: { "comando": "ls -la" }

2. "darkai" — consulta outra IA pra pensar/analisar/gerar texto
   args: { "modelo": "openai/gpt-5", "prompt": "..." }

3. "git" — operações git (commit, push, status, diff)
   args: { "acao": "commit_push", "mensagem": "..." }  |  { "acao": "status" }

4. "escrever_arquivo" — cria ou sobrescreve arquivo dentro de /root/CentralDark
   args: { "path": "docs/foo.md", "conteudo": "..." }

5. "ler_arquivo" — lê arquivo dentro de /root/CentralDark
   args: { "path": "docs/foo.md" }

6. "notificar_progresso" — só posta no Telegram (informativo, sem executar nada)
   args: { "mensagem": "..." }
`;

const SCHEMA = `
DEVOLVA APENAS JSON VÁLIDO, SEM MARKDOWN, SEM \`\`\`, ASSIM:
{
  "pensamento": "por que essa etapa agora (1-2 frases)",
  "etapa_titulo": "título curto pro Telegram (max 60 char)",
  "ferramenta": "shell|darkai|git|escrever_arquivo|ler_arquivo|notificar_progresso",
  "args": { ... },
  "terminou": false
}
Quando a missão estiver 100% concluída, devolva "terminou": true e "ferramenta": "notificar_progresso" com o resumo final.
`;

const SYSTEM = `Você é o Hermes, executor autônomo da CentralDark. Pense passo-a-passo. Nunca desvie da missão. Sempre devolva JSON puro.`;

function montarPrompt(missao, historico, erros_anteriores = []) {
  const hist = (historico || []).length === 0
    ? '(sem etapas ainda)'
    : historico.map((h, i) =>
        `Etapa ${i+1}: ${h.etapa_titulo}\nFerramenta: ${h.ferramenta}\nResultado: ${(h.resultado || '').slice(0, 500)}\n`
      ).join('\n---\n');

  const nota_erros = erros_anteriores.length
    ? `\n\n[NOTA: Modelos anteriores falharam: ${erros_anteriores.map(e => `${e.modelo} (${e.erro})`).join(' | ')}]`
    : '';

  return `MISSÃO ORIGINAL:\n${missao}\n\n---\nHISTÓRICO:\n${hist}${nota_erros}\n\n---\n${FERRAMENTAS}\n${SCHEMA}`;
}

function extrairJSON(texto) {
  const limpo = texto.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const m = limpo.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('sem JSON na resposta');
  return JSON.parse(m[0]);
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK 4 — Elite Anthropic Proxy
// ═══════════════════════════════════════════════════════════════
async function chamarEliteAnthropic(prompt) {
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
        signal: AbortSignal.timeout(ELITE_TI
```

---

# COMANDO - decisor.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\ARSENAL\hermes-vivo\decisor.mjs
**SHA:** 49fb6b4879db71df
**Timestamp:** 2026-08-28T02:56:52.842222
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = montarPrompt(missao, historico, historico_erros);
- const prompt = montarPrompt(missao, historico, historico_erros);

### Decisoes
- const decisao = extrairJSON(stdout);
- const decisao = extrairJSON(texto);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// 🧠 Decisor v2 — cadeia de 4 IAs + cache + timeout por modelo + Elite Anthropic fallback
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
const pexec = promisify(execFile);

// ═══════════════════════════════════════════════════════════════
// CADEIA DE MODELOS (ordem de tentativa)
// ═══════════════════════════════════════════════════════════════
const CADEIA_DARKAI = [
  { modelo: 'google/gemini-3-flash-preview', timeout_ms: 15_000 },
  { modelo: 'google/gemini-2.5-pro',         timeout_ms: 30_000 },
  { modelo: 'openai/gpt-5-mini',             timeout_ms: 45_000 },
];

// Elite Anthropic Proxy (4º fallback, sempre vivo)
const ELITE_URL   = 'https://api.centralldark.com/v1/messages';
const ELITE_MODEL = 'claude-sonnet-4-5';
const ELITE_TOKEN = process.env.ELITE_ANTHROPIC_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN || '';
const ELITE_TIMEOUT_MS = 30_000;

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
// PROMPT (system + schema)
// ═══════════════════════════════════════════════════════════════
const FERRAMENTAS = `
Você tem estas ferramentas disponíveis (escolha UMA por etapa):

1. "shell" — executa comando bash na VPS dentro de /root/CentralDark
   args: { "comando": "ls -la" }

2. "darkai" — consulta outra IA pra pensar/analisar/gerar texto
   args: { "modelo": "openai/gpt-5", "prompt": "..." }

3. "git" — operações git (commit, push, status, diff)
   args: { "acao": "commit_push", "mensagem": "..." }  |  { "acao": "status" }

4. "escrever_arquivo" — cria ou sobrescreve arquivo dentro de /root/CentralDark
   args: { "path": "docs/foo.md", "conteudo": "..." }

5. "ler_arquivo" — lê arquivo dentro de /root/CentralDark
   args: { "path": "docs/foo.md" }

6. "notificar_progresso" — só posta no Telegram (informativo, sem executar nada)
   args: { "mensagem": "..." }
`;

const SCHEMA = `
DEVOLVA APENAS JSON VÁLIDO, SEM MARKDOWN, SEM \`\`\`, ASSIM:
{
  "pensamento": "por que essa etapa agora (1-2 frases)",
  "etapa_titulo": "título curto pro Telegram (max 60 char)",
  "ferramenta": "shell|darkai|git|escrever_arquivo|ler_arquivo|notificar_progresso",
  "args": { ... },
  "terminou": false
}
Quando a missão estiver 100% concluída, devolva "terminou": true e "ferramenta": "notificar_progresso" com o resumo final.
`;

const SYSTEM = `Você é o Hermes, executor autônomo da CentralDark. Pense passo-a-passo. Nunca desvie da missão. Sempre devolva JSON puro.`;

function montarPrompt(missao, historico, erros_anteriores = []) {
  const hist = (historico || []).length === 0
    ? '(sem etapas ainda)'
    : historico.map((h, i) =>
        `Etapa ${i+1}: ${h.etapa_titulo}\nFerramenta: ${h.ferramenta}\nResultado: ${(h.resultado || '').slice(0, 500)}\n`
      ).join('\n---\n');

  const nota_erros = erros_anteriores.length
    ? `\n\n[NOTA: Modelos anteriores falharam: ${erros_anteriores.map(e => `${e.modelo} (${e.erro})`).join(' | ')}]`
    : '';

  return `MISSÃO ORIGINAL:\n${missao}\n\n---\nHISTÓRICO:\n${hist}${nota_erros}\n\n---\n${FERRAMENTAS}\n${SCHEMA}`;
}

function extrairJSON(texto) {
  const limpo = texto.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const m = limpo.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('sem JSON na resposta');
  return JSON.parse(m[0]);
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK 4 — Elite Anthropic Proxy
// ═══════════════════════════════════════════════════════════════
async function chamarEliteAnthropic(prompt) {
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
        signal: AbortSignal.timeout(ELI
```