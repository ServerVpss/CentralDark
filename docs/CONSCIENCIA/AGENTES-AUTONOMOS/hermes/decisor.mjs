#!/usr/bin/env node
// 🧠 Decisor v2 — cadeia de 4 IAs + cache + timeout por modelo + Elite Anthropic fallback
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const pexec = promisify(execFile);

// ═══════════════════════════════════════════════════════════════
// APRENDIZADOS — lições que o Hermes já pagou caro pra saber
// (aprendizados.json; só a categoria relevante entra no prompt)
// ═══════════════════════════════════════════════════════════════
const APRENDIZADOS_PATH = join(dirname(fileURLToPath(import.meta.url)), 'aprendizados.json');

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

7. "aprender" — grava uma lição aprendida pra NUNCA repetir o mesmo erro (memória permanente)
   args: { "categoria": "git|timeout|json|typescript|permissao|geral", "licao": "frase curta e acionável" }
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

function montarPrompt(missao, historico, erros_anteriores = []) {
  const hist = (historico || []).length === 0
    ? '(sem etapas ainda)'
    : historico.map((h, i) =>
        `Etapa ${i+1}: ${h.etapa_titulo}\nFerramenta: ${h.ferramenta}\nResultado: ${(h.resultado || '').slice(0, 500)}\n`
      ).join('\n---\n');

  const nota_erros = erros_anteriores.length
    ? `\n\n[NOTA: Modelos anteriores falharam: ${erros_anteriores.map(e => `${e.modelo} (${e.erro})`).join(' | ')}]`
    : '';

  const licoes = licoesRelevantes(missao, historico, erros_anteriores);
  const bloco_licoes = licoes
    ? `\n\n---\nLIÇÕES APRENDIDAS (você já errou nisso antes — respeite):\n${licoes}`
    : '';

  const rep = detectarLoop(historico);
  const bloco_loop = rep >= 2
    ? `\n\n🚨🚨 VOCÊ ESTÁ EM LOOP: as últimas ${rep} etapas usaram EXATAMENTE a mesma ferramenta com os mesmos args e nada mudou. É PROIBIDO repetir essa chamada. Mude de abordagem AGORA: se estava lendo, ESCREVA a correção (escrever_arquivo); se não sabe corrigir, pule e anote no relatório. 🚨🚨`
    : '';

  const rel = detectarReleituras(historico);
  const bloco_rel = rel
    ? `\n\n🚨 VOCÊ JÁ LEU ${rel.path} ${rel.count}x NAS ÚLTIMAS 6 ETAPAS sem corrigir nada. PROIBIDO ler esse arquivo de novo (por ler_arquivo OU shell). O conteúdo já está no seu histórico. A PRÓXIMA AÇÃO DEVE SER escrever_arquivo em ${rel.path} com o arquivo COMPLETO corrigido. 🚨`
    : '';

  return `MISSÃO ORIGINAL:\n${missao}\n\n---\nHISTÓRICO:\n${hist}${nota_erros}${bloco_licoes}${bloco_loop}${bloco_rel}\n\n---\n${FERRAMENTAS}\n${SCHEMA}`;
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

  // Em loop ou releitura detectados, pula o Flash e vai direto pro modelo mais forte quebrar o empate
  const emLoop = detectarLoop(historico) >= 3 || !!detectarReleituras(historico);
  const cadeia = emLoop ? CADEIA_DARKAI.slice(1) : CADEIA_DARKAI;
  if (emLoop) console.log('[decisor] 🔁 loop/releitura detectado — escalando direto pro gemini-2.5-pro');

  // 2. Tenta os modelos via darkai
  for (const cfg of cadeia) {
    const t0 = Date.now();
    try {
      const prompt = montarPrompt(missao, historico, historico_erros);
      const p = pexec('darkai', ['--model', cfg.modelo, '--system', SYSTEM, prompt], {
        maxBuffer: 10 * 1024 * 1024,
        timeout: cfg.timeout_ms,
      });
      p.child.stdin.end(); // darkai lê stdin quando não é TTY — pipe aberto trava no $(cat) até o timeout
      const { stdout } = await p;
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
    const prompt = montarPrompt(missao, historico, historico_erros);
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
